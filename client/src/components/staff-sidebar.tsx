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
import Link from "next/link"

const data = {
  user: {
    name: "John Davis",
    email: "john.davis@school.com",
    avatar: "/avatars/teacher1.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/staff",
      icon: IconDashboard,
      shortForm: "Dash",
    },
    {
      title: "My Classes",
      url: "/staff/students",
      icon: IconUsers,
      shortForm: "Class",
    },
    {
      title: "Attendance",
      url: "/staff/attendance",
      icon: IconUserCheck,
      shortForm: "Att",
    },
    {
      title: "Schedule",
      url: "/staff/schedule",
      icon: IconCalendar,
      shortForm: "Sch",
    },
    {
      title: "Gradebook",
      url: "/staff/gradebook",
      icon: IconBook,
      shortForm: "Grade",
    },
    {
      title: "Communication",
      url: "#",
      icon: IconMessage,
      shortForm: "Comm",
      items: [
        {
          title: "Messages",
          url: "/staff/communication#messages",
        },
        {
          title: "Announcements",
          url: "/staff/communication#announcements",
        },
        {
          title: "Parent Portal",
          url: "/staff/communication#parents",
        },
        {
          title: "Notifications",
          url: "/staff/communication#notifications",
        },
      ],
    },
    {
      title: "Results",
      url: "#",
      icon: IconClipboardList,
      shortForm: "Res",
      items: [
        {
          title: "Overview",
          url: "/staff/results#overview",
        },
        {
          title: "Subject Grades",
          url: "/staff/results#subjects",
        },
        {
          title: "Class Results",
          url: "/staff/results#classes",
        },
        {
          title: "Reports",
          url: "/staff/results#reports",
        },
      ],
    },
    {
      title: "Library",
      url: "/staff/library",
      icon: IconBooks,
      shortForm: "Lib",
    },
    {
      title: "Administration",
      url: "#",
      icon: IconFileText,
      shortForm: "Admin",
      items: [
        {
          title: "School Policies",
          url: "/staff/admin#policies",
        },
        {
          title: "Timetable",
          url: "/staff/admin#timetable",
        },
        {
          title: "Curriculum",
          url: "/staff/admin#curriculum",
        },
        {
          title: "Reports",
          url: "/staff/admin#reports",
        },
      ],
    },
    {
      title: "IT Support",
      url: "/staff/it",
      icon: IconDeviceDesktop,
      shortForm: "IT",
    },
    {
      title: "Counselor",
      url: "/staff/counselor",
      icon: IconUserHeart,
      shortForm: "Couns",
    },
    {
      title: "Nurse",
      url: "/staff/nurse",
      icon: IconHeart,
      shortForm: "Nurse",
    },
    {
      title: "Security",
      url: "/staff/security",
      icon: IconShield,
      shortForm: "Sec",
    },
    {
      title: "Maintenance",
      url: "/staff/maintenance",
      icon: IconTools,
      shortForm: "Maint",
    },
  ],
  navSecondary: [
    {
      title: "Reports",
      url: "/staff/reports",
      icon: IconChartBar,
      shortForm: "Rpts",
    },
    {
      title: "Profile",
      url: "/staff/profile",
      icon: IconSettings,
      shortForm: "Prof",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              tooltip="Staff Portal"
            >
              <Link href="/staff">
                <IconSchool className="!size-5" />
                <span className="group-data-[collapsible=icon]:hidden text-base font-semibold">Staff Portal</span>
                <span className="hidden group-data-[collapsible=icon]:inline text-xs font-medium">Staff</span>
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