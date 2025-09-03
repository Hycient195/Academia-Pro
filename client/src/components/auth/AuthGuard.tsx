"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/redux/auth/authContext'
import { Skeleton } from '@/components/ui/skeleton'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo || '/auth/sign-in')
      } else if (!requireAuth && isAuthenticated) {
        router.push(redirectTo || '/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  // Redirect logic is handled in useEffect
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page. Required roles: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean
    redirectTo?: string
    allowedRoles?: string[]
  } = {}
) => {
  const { requireAuth = true, redirectTo, allowedRoles } = options

  const ProtectedComponent: React.FC<P> = (props) => {
    if (allowedRoles && allowedRoles.length > 0) {
      return (
        <RoleGuard allowedRoles={allowedRoles}>
          <AuthGuard requireAuth={requireAuth} redirectTo={redirectTo}>
            <Component {...props} />
          </AuthGuard>
        </RoleGuard>
      )
    }

    return (
      <AuthGuard requireAuth={requireAuth} redirectTo={redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }

  ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name})`

  return ProtectedComponent
}