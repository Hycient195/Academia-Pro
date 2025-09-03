"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconActivity,
  IconBuilding,
  IconChartBar,
  IconDashboard,
  IconSettings,
  IconShield,
  IconUsers,
  IconFileText,
  IconKey,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  user: {
    name: "Super Admin",
    email: "superadmin@academiapro.com",
    avatar: "/avatars/superadmin.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/super-admin/overview",
      icon: IconDashboard,
      shortForm: "Dash",
    },
    {
      title: "Schools",
      url: "/super-admin/schools",
      icon: IconBuilding,
      shortForm: "Schools",
    },
    {
      title: "Users",
      url: "/super-admin/users",
      icon: IconUsers,
      shortForm: "Users",
    },
    {
      title: "Identity & Access Management",
      url: "/super-admin/iam",
      icon: IconKey,
      shortForm: "IAM",
    },
    {
      title: "Analytics",
      url: "/super-admin/analytics",
      icon: IconChartBar,
      shortForm: "Anal",
    },
    {
      title: "Audit",
      url: "/super-admin/audit",
      icon: IconFileText,
      shortForm: "Audit",
    },
  ],
  navSecondary: [
    {
      title: "System Health",
      url: "/super-admin/system",
      icon: IconActivity,
      shortForm: "Health",
    },
    {
      title: "Settings",
      url: "/super-admin/settings",
      icon: IconSettings,
      shortForm: "Sett",
    },
  ],
}

export function SuperAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Create nav items with active state
  const navMainWithActive = data.navMain.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  const navSecondaryWithActive = data.navSecondary.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              tooltip="Super Admin"
            >
              <Link href="/super-admin/dashboard">
                <IconShield className="!size-5" />
                <span className="group-data-[collapsible=icon]:hidden text-base font-semibold">Super Admin</span>
                <span className="hidden group-data-[collapsible=icon]:inline text-xs font-medium">Super</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
        <NavSecondary items={navSecondaryWithActive} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}