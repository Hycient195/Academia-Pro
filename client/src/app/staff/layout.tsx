"use client"

import PortalLayout from "@/components/PortalLayout"
import { staffNavData } from "./_constants/navData"
import { AuthProvider } from "@/redux/auth/authContext"
import { AuthGuard, RoleGuard } from "@/components/auth/AuthGuard"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthGuard
        requireAuth={true}
        redirectTo="/staff/login"
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <RoleGuard allowedRoles={['teacher']}>
          <PortalLayout navData={staffNavData}>
            {children}
          </PortalLayout>
        </RoleGuard>
      </AuthGuard>
    </AuthProvider>
  )
}