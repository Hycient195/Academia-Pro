"use client"

import React from "react"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PortalSidebar, RoleConfig  } from "@/components/portal-sidebar"

/* role type imported from PortalSidebar */

type PortalLayoutProps = {
  navData: RoleConfig
  children: React.ReactNode
  style?: React.CSSProperties
}

const defaultStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties

/* Unified PortalSidebar handles role-specific sidebars (menus) */

export function PortalLayout({ navData, children, style }: PortalLayoutProps) {
  const contentClassName = `flex flex-1 flex-col p-4`

  return (
    <SidebarProvider
      style={{
        ...defaultStyle,
        ...style,
      } as React.CSSProperties}
    >
      <PortalSidebar navData={navData} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className={contentClassName}>
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default PortalLayout