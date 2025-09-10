import { PortalLayout } from "@/components/portal-layout"
import { parentNavData } from "./_constants/navData"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalLayout navData={parentNavData}>
      {children}
    </PortalLayout>
  )
}