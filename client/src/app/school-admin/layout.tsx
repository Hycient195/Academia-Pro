"use client"

import PortalLayout from "@/components/PortalLayout"
import { schoolAdminNavData } from "./_constants/navData"
import { UserAuthProvider, useUserAuth } from "@/redux/auth/userAuthContext"
import { UserAuthGuard, UserRoleGuard } from "@/components/auth/UserAuthGuard"

function SchoolAdminPortalWrapper({ children }: { children: React.ReactNode }) {
  const { logout } = useUserAuth()
  return (
    <PortalLayout navData={schoolAdminNavData} onLogout={logout} redirectTo="/auth/sign-in">
      {children}
    </PortalLayout>
  )
}

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserAuthProvider>
      <UserAuthGuard
        requireAuth={true}
        redirectTo="/auth/sign-in"
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <UserRoleGuard allowedRoles={['school-admin', 'delegated-school-admin']}>
          <SchoolAdminPortalWrapper>
            {children}
          </SchoolAdminPortalWrapper>
        </UserRoleGuard>
      </UserAuthGuard>
    </UserAuthProvider>
  )
}