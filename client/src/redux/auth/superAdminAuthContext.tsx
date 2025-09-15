"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { GLOBAL_API_URL } from '../globalURLs'

export interface SuperAdminUser {
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

export interface SuperAdminAuthState {
  user: SuperAdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  csrfToken: string | null
}

export interface SuperAdminAuthContextType extends SuperAdminAuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  getCSRFToken: () => Promise<string | null>
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined)

export const useSuperAdminAuth = () => {
  const context = useContext(SuperAdminAuthContext)
  if (context === undefined) {
    throw new Error('useSuperAdminAuth must be used within an SuperAdminAuthProvider')
  }
  return context
}

interface SuperAdminAuthProviderProps {
  children: ReactNode
}

// Helper function to get super admin CSRF token from cookies
const getSuperAdminCSRFTokenFromCookies = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'superAdminCsrfToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export const SuperAdminAuthProvider: React.FC<SuperAdminAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<SuperAdminAuthState>({
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
      // Only check auth status if we have super admin cookies (indicating a potential previous session)
      const hasSuperAdminCookies = document.cookie.includes('superAdminAccessToken') ||
                                   document.cookie.includes('superAdminRefreshToken') ||
                                   document.cookie.includes('superAdminCsrfToken')

      if (!hasSuperAdminCookies) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          csrfToken: null,
        })
        return
      }

      const response = await fetch(`${GLOBAL_API_URL}/auth/super-admin/me`, {
        credentials: 'include',
      })

      if (response.ok) {
        const user = await response.json()
                console.log(user)

        // Only set auth state if this is a super admin
        if (user?.roles.includes('super-admin') || user?.roles.includes('delegated-super-admin')) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            csrfToken: authState.csrfToken,
          })
        } else {
          // Clear any invalid cookies if this is not a super admin
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
      console.error('Super admin auth check failed:', error)
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

      const response = await fetch(`${GLOBAL_API_URL}/auth/super-admin/login`, {
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
        const csrfToken = getSuperAdminCSRFTokenFromCookies()
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
      await fetch(`${apiUrl}/auth/super-admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear super admin specific cookies
      document.cookie = "superAdminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      document.cookie = "superAdminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      document.cookie = "superAdminCsrfToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
      
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
      // First try to refresh the token using the super admin refresh endpoint
      const refreshResponse = await fetch(`${GLOBAL_API_URL}/auth/super-admin/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Token refresh successful, now get the user profile using super admin endpoint
        const response = await fetch(`${GLOBAL_API_URL}/auth/super-admin/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const user = await response.json()
          // Only update auth state if this is a super admin
          if (user.roles.includes('super-admin') || user.roles.includes('delegated-super-admin')) {
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
      console.error('Super admin auth refresh error:', error)
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
      const response = await fetch(`${apiUrl}/auth/super-admin/csrf-token`, {
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

  const value: SuperAdminAuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    getCSRFToken,
  }

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  )
}
