"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      // console.debug('[AuthGuard]', { isAuthenticated, isLoading, requireAuth, redirectTo, pathname })
    }
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        const target = redirectTo || '/auth/sign-in'
        if (pathname !== target) {
          router.push(target)
        }
      } else if (!requireAuth && isAuthenticated) {
        const target = redirectTo || '/dashboard'
        if (pathname !== target) {
          router.push(target)
        }
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, pathname])

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

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[RoleGuard]', { userRoles: user?.roles, allowedRoles })
  }

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

  const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role))
  if (!hasRequiredRole) {
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