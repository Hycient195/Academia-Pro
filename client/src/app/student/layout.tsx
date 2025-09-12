"use client"

import PortalLayout from "@/components/PortalLayout"
import { studentNavData } from "./_constants/navData"
import { UserAuthProvider } from "@/redux/auth/userAuthContext"
import { UserAuthGuard, UserRoleGuard } from "@/components/auth/UserAuthGuard"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserAuthProvider>
      <UserAuthGuard
        requireAuth={true}
        redirectTo="/student/login"
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <UserRoleGuard allowedRoles={['student']}>
          <PortalLayout navData={studentNavData}>
            {children}
          </PortalLayout>
        </UserRoleGuard>
      </UserAuthGuard>
    </UserAuthProvider>
  )
}