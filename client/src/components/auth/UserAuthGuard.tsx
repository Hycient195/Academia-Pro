"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserAuth } from '@/redux/auth/userAuthContext'
import { Skeleton } from '@/components/ui/skeleton'

interface UserAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export const UserAuthGuard: React.FC<UserAuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useUserAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      // console.debug('[UserAuthGuard]', { isAuthenticated, isLoading, requireAuth, redirectTo, pathname })
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

interface UserRoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export const UserRoleGuard: React.FC<UserRoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user, isAuthenticated } = useUserAuth()

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    // console.debug('[UserRoleGuard]', { userRoles: user?.roles, allowedRoles })
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
export const withUserAuth = <P extends object>(
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
        <UserRoleGuard allowedRoles={allowedRoles}>
          <UserAuthGuard requireAuth={requireAuth} redirectTo={redirectTo}>
            <Component {...props} />
          </UserAuthGuard>
        </UserRoleGuard>
      )
    }

    return (
      <UserAuthGuard requireAuth={requireAuth} redirectTo={redirectTo}>
        <Component {...props} />
      </UserAuthGuard>
    )
  }

  ProtectedComponent.displayName = `withUserAuth(${Component.displayName || Component.name})`

  return ProtectedComponent
}