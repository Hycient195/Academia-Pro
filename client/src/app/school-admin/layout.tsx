import { PortalLayout } from "@/components/portal-layout"
import { schoolAdminNavData } from "./_constants/navData"

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalLayout navData={schoolAdminNavData}>
      {children}
    </PortalLayout>
  )
}