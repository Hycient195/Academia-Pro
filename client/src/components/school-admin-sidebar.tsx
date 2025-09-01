"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconBuildingBank,
  IconChartBar,
  IconDashboard,
  IconMail,
  IconSchool,
  IconSettings,
  IconUsers,
  IconUserShield,
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
    name: "School Admin",
    email: "admin@school.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/school-admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Students",
      url: "/school-admin/students",
      icon: IconUsers,
    },
    {
      title: "Staff",
      url: "/school-admin/staff",
      icon: IconUserShield,
    },
    {
      title: "Academic",
      url: "/school-admin/academic",
      icon: IconBook,
    },
    {
      title: "Financial",
      url: "/school-admin/financial",
      icon: IconBuildingBank,
    },
    {
      title: "Communication",
      url: "/school-admin/communication",
      icon: IconMail,
    },
  ],
  navSecondary: [
    {
      title: "Analytics",
      url: "/school-admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Settings",
      url: "/school-admin/settings",
      icon: IconSettings,
    },
  ],
}

export function SchoolAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/school-admin/dashboard">
                <IconSchool className="!size-5" />
                <span className="text-base font-semibold">School Admin</span>
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