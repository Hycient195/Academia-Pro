import { SuperAdminSidebar } from "@/components/super-admin-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SuperAdminAuthProvider } from "@/redux/auth/superAdminAuthContext"
import { SuperAdminAuthGuard, SuperAdminRoleGuard } from "@/components/auth/SuperAdminAuthGuard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SuperAdminAuthProvider>
      <SuperAdminAuthGuard
        requireAuth={true}
        redirectTo="/super-admin/auth/sign-in"
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <SuperAdminRoleGuard
          allowedRoles={['super-admin']}
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
                <p className="text-muted-foreground mt-2">
                  You need super admin privileges to access this section.
                </p>
              </div>
            </div>
          }
        >
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <SuperAdminSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col p-4">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </SuperAdminRoleGuard>
      </SuperAdminAuthGuard>
    </SuperAdminAuthProvider>
  )
}