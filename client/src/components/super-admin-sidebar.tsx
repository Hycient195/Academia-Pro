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
import { useSuperAdminAuth } from "@/redux/auth/superAdminAuthContext"

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

const navMain = [
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
]

const navSecondary = [
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
]

export function SuperAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useSuperAdminAuth()

  // Transform user data for NavUser component
  const userData = user ? {
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    avatar: "/avatars/default.jpg", // Default avatar since User interface doesn't have avatar field
  } : {
    name: "Super Admin",
    email: "superadmin@academiapro.com",
    avatar: "/avatars/superadmin.jpg",
  }

  // Create nav items with active state
  const navMainWithActive = navMain.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  const navSecondaryWithActive = navSecondary.map(item => ({
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
        <NavUser user={userData} onLogout={logout} redirectTo="/super-admin/auth/sign-in" />
      </SidebarFooter>
    </Sidebar>
  )
}