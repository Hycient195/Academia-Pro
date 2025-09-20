"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { GLOBAL_API_URL } from '../globalURLs'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  schoolId?: string
  isEmailVerified: boolean
  status: string
  lastLoginAt?: string
  isFirstLogin?: boolean
}

export interface UserAuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  csrfToken: string | null
}

export interface UserAuthContextType extends UserAuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  getCSRFToken: () => Promise<string | null>
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export const useUserAuth = () => {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within an UserAuthProvider')
  }
  return context
}

interface UserAuthProviderProps {
  children: ReactNode
}

// Helper function to get CSRF token from cookies
const getCSRFTokenFromCookies = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrfToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export const getAccessTokenFromCookies = () => {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('accessToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<UserAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    csrfToken: null,
  })

  // Check authentication status on mount (only on client side)
  useEffect(() => {
    // Only run on client side to prevent SSR issues
    if (typeof window !== 'undefined') {
      checkAuthStatus()
    } else {
      // Set loading to false for SSR
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Silent refresh mechanism
  useEffect(() => {
    if (authState.isAuthenticated) {
      const refreshInterval = setInterval(() => {
        refreshAuth()
      }, 15 * 60 * 1000) // Refresh every 15 minutes

      return () => clearInterval(refreshInterval)
    }
  }, [authState.isAuthenticated])

  const checkAuthStatus = async () => {
    try {
      // Only check auth status if we have regular user cookies (indicating a potential previous session)
      const hasUserCookies = document.cookie.includes('accessToken') ||
                            document.cookie.includes('refreshToken') ||
                            document.cookie.includes('csrfToken')

      if (!hasUserCookies) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          csrfToken: null,
        })
        return
      }

      const response = await fetch(`${GLOBAL_API_URL}/auth/me`, {
        credentials: 'include',
      })

      if (response.ok) {
        const user = await response.json()
        // Only set auth state if this is not a super admin
        if (!user.roles.includes('super-admin') && !user.roles.includes('delegated-super-admin')) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            csrfToken: authState.csrfToken,
          })
        } else {
          // Clear any invalid cookies if this is actually a super admin
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            csrfToken: null,
          })
        }
      } else {
        // Clear any invalid cookies
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          csrfToken: null,
        })
      }
    } catch (error) {
      console.error('User auth check failed:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        csrfToken: null,
      })
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch(`${GLOBAL_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Read CSRF token from cookies after successful login
        const csrfToken = getCSRFTokenFromCookies()
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          csrfToken: csrfToken,
        })
        return { success: true }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          user: null,
          isAuthenticated: false,
        }))
        return { success: false, error: errorData.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        user: null,
        isAuthenticated: false,
      }))
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear regular user specific cookies
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      document.cookie = "csrfToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        csrfToken: null,
      })
    }
  }

  const refreshAuth = async (): Promise<void> => {
    try {
      // First try to refresh the token using the regular refresh endpoint
      const refreshResponse = await fetch(`${GLOBAL_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Token refresh successful, now get the user profile
        const response = await fetch(`${GLOBAL_API_URL}/auth/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const user = await response.json()
          // Only update auth state if this is not a super admin
          if (!user.roles.includes('super-admin') && !user.roles.includes('delegated-super-admin')) {
            setAuthState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
            }))
          }
        } else {
          // Profile fetch failed, logout user
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            csrfToken: null,
          })
        }
      } else {
        // Refresh failed, logout user
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          csrfToken: null,
        })
      }
    } catch (error) {
      console.error('User auth refresh error:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        csrfToken: null,
      })
    }
  }

  const getCSRFToken = async (): Promise<string | null> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/auth/csrf-token`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState(prev => ({ ...prev, csrfToken: data.csrfToken }))
        return data.csrfToken
      }
    } catch (error) {
      console.error('CSRF token fetch error:', error)
    }
    return null
  }

  const value: UserAuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    getCSRFToken,
  }

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  )
}