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
      shortForm: "Dash",
    },
    {
      title: "Students",
      url: "/school-admin/students",
      icon: IconUsers,
      shortForm: "Stud",
    },
    {
      title: "Staff",
      url: "/school-admin/staff",
      icon: IconUserShield,
      shortForm: "Staff",
    },
    {
      title: "Academic",
      url: "/school-admin/academic",
      icon: IconBook,
      shortForm: "Acad",
    },
    {
      title: "Financial",
      url: "/school-admin/financial",
      icon: IconBuildingBank,
      shortForm: "Fin",
    },
    {
      title: "Communication",
      url: "/school-admin/communication",
      icon: IconMail,
      shortForm: "Comm",
    },
  ],
  navSecondary: [
    {
      title: "Analytics",
      url: "/school-admin/analytics",
      icon: IconChartBar,
      shortForm: "Anal",
    },
    {
      title: "Settings",
      url: "/school-admin/settings",
      icon: IconSettings,
      shortForm: "Sett",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              tooltip="School Admin"
            >
              <Link href="/school-admin/dashboard">
                <IconSchool className="!size-5" />
                <span className="group-data-[collapsible=icon]:hidden text-base font-semibold">School Admin</span>
                <span className="hidden group-data-[collapsible=icon]:inline text-xs font-medium">Admin</span>
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