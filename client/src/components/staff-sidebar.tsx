"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconCalendar,
  IconChartBar,
  IconDashboard,
  IconMail,
  IconSchool,
  IconSettings,
  IconUsers,
  IconUserCheck,
  IconClipboardList,
  IconMessage,
  IconBooks,
  IconFileText,
  IconDeviceDesktop,
  IconHeart,
  IconShield,
  IconTools,
  IconUserHeart,
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

const data = {
  user: {
    name: "John Davis",
    email: "john.davis@school.com",
    avatar: "/avatars/teacher1.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/staff/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Classes",
      url: "/staff/students",
      icon: IconUsers,
    },
    {
      title: "Attendance",
      url: "/staff/attendance",
      icon: IconUserCheck,
    },
    {
      title: "Schedule",
      url: "/staff/schedule",
      icon: IconCalendar,
    },
    {
      title: "Gradebook",
      url: "/staff/gradebook",
      icon: IconBook,
    },
    {
      title: "Communication",
      url: "/staff/communication",
      icon: IconMessage,
    },
    {
      title: "Results",
      url: "/staff/results",
      icon: IconClipboardList,
    },
    {
      title: "Library",
      url: "/staff/library",
      icon: IconBooks,
    },
    {
      title: "Administration",
      url: "/staff/admin",
      icon: IconFileText,
    },
    {
      title: "IT Support",
      url: "/staff/it",
      icon: IconDeviceDesktop,
    },
    {
      title: "Counselor",
      url: "/staff/counselor",
      icon: IconUserHeart,
    },
    {
      title: "Nurse",
      url: "/staff/nurse",
      icon: IconHeart,
    },
    {
      title: "Security",
      url: "/staff/security",
      icon: IconShield,
    },
    {
      title: "Maintenance",
      url: "/staff/maintenance",
      icon: IconTools,
    },
  ],
  navSecondary: [
    {
      title: "Reports",
      url: "/staff/reports",
      icon: IconChartBar,
    },
    {
      title: "Profile",
      url: "/staff/profile",
      icon: IconSettings,
    },
  ],
}

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              <a href="/staff/dashboard">
                <IconSchool className="!size-5" />
                <span className="text-base font-semibold">Staff Portal</span>
              </a>
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