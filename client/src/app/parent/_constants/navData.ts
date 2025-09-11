"use client"

import { RoleConfig } from "@/components/portal-sidebar";
import {
  IconUsers,
  IconSettings,
  IconHome,
  IconFileText,
  IconMessage,
  IconBell,
  IconUser,
} from "@tabler/icons-react"

export const parentNavData: RoleConfig = {
    label: "Parent Portal",
    shortLabel: "Parent",
    homeUrl: "/parent/dashboard",
    collapsible: "offcanvas",
    user: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar: "/avatars/parent.jpg",
    },
    navMain: [
      { title: "Dashboard", url: "/parent/dashboard", icon: IconHome },
      { title: "My Children", url: "/parent/children", icon: IconUsers },
      { title: "Fees & Payments", url: "/parent/fees", icon: IconFileText },
      { title: "Communication", url: "/parent/communication", icon: IconMessage },
    ],
    navSecondary: [
      { title: "Announcements", url: "/parent/announcements", icon: IconBell },
      { title: "Profile", url: "/parent/profile", icon: IconUser },
      { title: "Settings", url: "/parent/settings", icon: IconSettings },
    ],
}