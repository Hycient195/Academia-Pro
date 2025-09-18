"use client"

import { RoleConfig } from "@/components/portal-sidebar"
import {
  IconDashboard,
  IconUsers,
  IconUserShield,
  IconBook,
  IconBuildingBank,
  IconMail,
  IconChartBar,
  IconSettings,
  IconBuilding,
  IconShield,
} from "@tabler/icons-react"

export const schoolAdminNavData: RoleConfig =  {
    label: "School Admin",
    shortLabel: "Admin",
    homeUrl: "/school-admin/dashboard",
    collapsible: "icon",
    user: {
      name: "School Admin",
      email: "admin@school.com",
      avatar: "/avatars/admin.jpg",
    },
    navMain: [
      { title: "Dashboard", url: "/school-admin/overview", icon: IconDashboard, shortForm: "Dash" },
      { title: "Students", url: "/school-admin/students", icon: IconUsers, shortForm: "Stud" },
      { title: "Staff", url: "/school-admin/staff", icon: IconUserShield, shortForm: "Staff" },
      { title: "Departments", url: "/school-admin/departments", icon: IconBuilding, shortForm: "Depts" },
      { title: "Academic", url: "/school-admin/academic", icon: IconBook, shortForm: "Acad" },
      { title: "Financial", url: "/school-admin/financial", icon: IconBuildingBank, shortForm: "Fin" },
      { title: "Communication", url: "/school-admin/communication", icon: IconMail, shortForm: "Comm" },
      { title: "Delegated Admins", url: "/school-admin/delegated-admins", icon: IconShield, shortForm: "DelAdm" },
    ],
    navSecondary: [
      { title: "Analytics", url: "/school-admin/analytics", icon: IconChartBar, shortForm: "Anal" },
      { title: "Settings", url: "/school-admin/settings", icon: IconSettings, shortForm: "Sett" },
    ],
  }