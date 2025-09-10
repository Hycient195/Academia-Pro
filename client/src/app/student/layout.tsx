"use client"

import { PortalLayout } from "@/components/portal-layout"
import { studentNavData } from "./_constants/navData"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalLayout navData={studentNavData}>
      {children}
    </PortalLayout>
  )
}