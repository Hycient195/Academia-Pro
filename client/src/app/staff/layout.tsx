import { PortalLayout } from "@/components/portal-layout"
import { staffNavData } from "./_constants/navData"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalLayout navData={staffNavData}>
      {children}
    </PortalLayout>
  )
}