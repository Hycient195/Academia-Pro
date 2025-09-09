import React from 'react'
import { useAuth } from '@/redux/auth/authContext'

export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseURL: string
  csrfToken: string | null = null

  constructor(baseURL: string = '') {
    // Use environment variable or default to backend URL
    const defaultUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001')
      : 'http://localhost:3001'

    // Ensure we don't have double /api/v1
    this.baseURL = baseURL || defaultUrl
    if (this.baseURL.endsWith('/api/v1')) {
      this.baseURL = this.baseURL.replace('/api/v1', '')
    }
  }

  private async getCSRFToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/csrf-token`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        this.csrfToken = data.csrfToken
        return this.csrfToken
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
    }
    return null
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This will send the refreshToken cookie
      })

      if (response.ok) {
        console.log('Access token refreshed successfully')
        return true
      } else {
        console.warn('Failed to refresh access token:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return false
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      if (!this.csrfToken) {
        await this.getCSRFToken()
      }

      if (this.csrfToken) {
        options.headers = {
          ...options.headers,
          'X-CSRF-Token': this.csrfToken,
        }
      }
    }

    // Set default headers
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Include cookies
    }

    try {
      const response = await fetch(url, config)

      // Handle CSRF token refresh
      if (response.status === 403 && response.statusText.includes('CSRF')) {
        // Try to refresh CSRF token and retry
        this.csrfToken = null
        await this.getCSRFToken()

        if (this.csrfToken) {
          config.headers = {
            ...config.headers,
            'X-CSRF-Token': this.csrfToken,
          }
          const retryResponse = await fetch(url, config)
          return this.handleResponse<T>(retryResponse)
        }
      }

      // Handle JWT token expiration (403 Forbidden)
      if (response.status === 403 && !response.statusText.includes('CSRF')) {
        // Try to refresh the access token
        const refreshSuccess = await this.refreshAccessToken()
        if (refreshSuccess) {
          // Retry the original request with the new token
          const retryResponse = await fetch(url, config)
          return this.handleResponse<T>(retryResponse)
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: 'Network error occurred',
      }
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()

      if (response.ok) {
        return {
          data,
          message: data.message,
        }
      } else {
        return {
          error: data.message || `Request failed with status ${response.status}`,
        }
      }
    } catch (error) {
      if (response.ok) {
        return {
          data: null as T,
        }
      } else {
        return {
          error: `Request failed with status ${response.status}`,
        }
      }
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

// React hook for using the API client with auth context
export const useApiClient = () => {
  const { csrfToken, getCSRFToken } = useAuth()

  // Update CSRF token when it changes
  React.useEffect(() => {
    if (csrfToken) {
      apiClient.csrfToken = csrfToken
    }
  }, [csrfToken])

  return {
    apiClient,
    refreshCSRFToken: getCSRFToken,
  }
}

// Export types are already exported above