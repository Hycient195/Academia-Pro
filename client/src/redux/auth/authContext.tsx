"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  schoolId?: string
  isEmailVerified: boolean
  status: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  csrfToken: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  getCSRFToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
      })

      if (response.ok) {
        const user = await response.json()
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          csrfToken: authState.csrfToken,
        })
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          csrfToken: null,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/super-admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          csrfToken: data.csrfToken || null,
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
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
      // This will trigger the cookie-based refresh through the middleware
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
      })

      if (response.ok) {
        const user = await response.json()
        setAuthState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
        }))
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
      console.error('Auth refresh error:', error)
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
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

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    getCSRFToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}