"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSuperAdminAuth } from '@/redux/auth/superAdminAuthContext'
import { Skeleton } from '@/components/ui/skeleton'

interface SuperAdminAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export const SuperAdminAuthGuard: React.FC<SuperAdminAuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useSuperAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      // console.debug('[SuperAdminAuthGuard]', { isAuthenticated, isLoading, requireAuth, redirectTo, pathname })
    }
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        const target = redirectTo || '/super-admin/auth/sign-in'
        if (pathname !== target) {
          router.push(target)
        }
      } else if (!requireAuth && isAuthenticated) {
        const target = redirectTo || '/super-admin/overview'
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

interface SuperAdminRoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export const SuperAdminRoleGuard: React.FC<SuperAdminRoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user, isAuthenticated } = useSuperAdminAuth()

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    // console.debug('[SuperAdminRoleGuard]', { userRoles: user?.roles, allowedRoles })
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

  const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role))
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
export const withSuperAdminAuth = <P extends object>(
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
        <SuperAdminRoleGuard allowedRoles={allowedRoles}>
          <SuperAdminAuthGuard requireAuth={requireAuth} redirectTo={redirectTo}>
            <Component {...props} />
          </SuperAdminAuthGuard>
        </SuperAdminRoleGuard>
      )
    }

    return (
      <SuperAdminAuthGuard requireAuth={requireAuth} redirectTo={redirectTo}>
        <Component {...props} />
      </SuperAdminAuthGuard>
    )
  }

  ProtectedComponent.displayName = `withSuperAdminAuth(${Component.displayName || Component.name})`

  return ProtectedComponent
}