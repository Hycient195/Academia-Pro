"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconCalendar,
  IconChartBar,
  IconClipboardList,
  IconDashboard,
  IconFileText,
  IconMail,
  IconUser,
  IconUsers,
  IconSchool,
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
    name: "John Doe",
    email: "john.doe@student.school.com",
    avatar: "/avatars/student.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/student/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Grades",
      url: "/student/grades",
      icon: IconChartBar,
    },
    {
      title: "Results",
      url: "/student/results",
      icon: IconFileText,
    },
    {
      title: "Assignments",
      url: "/student/assignments",
      icon: IconClipboardList,
    },
    {
      title: "Timetable",
      url: "/student/timetable",
      icon: IconCalendar,
    },
    {
      title: "Attendance",
      url: "/student/attendance",
      icon: IconUsers,
    },
    {
      title: "Fees",
      url: "/student/fees",
      icon: IconFileText,
    },
  ],
  navSecondary: [
    {
      title: "Announcements",
      url: "/student/announcements",
      icon: IconMail,
    },
    {
      title: "Profile",
      url: "/student/profile",
      icon: IconUser,
    },
  ],
}

export function StudentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              <a href="/student/dashboard">
                <IconSchool className="!size-5" />
                <span className="text-base font-semibold">Student Portal</span>
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