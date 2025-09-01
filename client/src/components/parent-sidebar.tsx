"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconHome,
  IconUsers,
  IconFileText,
  IconMessage,
  IconUser,
  IconSchool,
  IconBell,
  IconSettings,
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
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "/avatars/parent.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/parent/dashboard",
      icon: IconHome,
    },
    {
      title: "My Children",
      url: "/parent/children",
      icon: IconUsers,
    },
    {
      title: "Fees & Payments",
      url: "/parent/fees",
      icon: IconFileText,
    },
    {
      title: "Communication",
      url: "/parent/communication",
      icon: IconMessage,
    },
  ],
  navSecondary: [
    {
      title: "Announcements",
      url: "/parent/announcements",
      icon: IconBell,
    },
    {
      title: "Profile",
      url: "/parent/profile",
      icon: IconUser,
    },
    {
      title: "Settings",
      url: "/parent/settings",
      icon: IconSettings,
    },
  ],
}

export function ParentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              <a href="/parent/dashboard">
                <IconSchool className="!size-5" />
                <span className="text-base font-semibold">Parent Portal</span>
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