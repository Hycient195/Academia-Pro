"use client"

import { RoleConfig } from "@/components/portal-sidebar"
import {
  IconDashboard,
  IconUsers,
  IconBook,
  IconChartBar,
  IconSettings,
  IconFileText,
  IconMessage,
  IconCalendar,
  IconClipboardList,
  IconUserCheck,
  IconBooks,
  IconDeviceDesktop,
  IconHeart,
  IconShield,
  IconTools,
  IconUserHeart,
} from "@tabler/icons-react"

export const staffNavData: RoleConfig = {
    label: "Staff Portal",
    shortLabel: "Staff",
    homeUrl: "/staff",
    collapsible: "icon",
    user: {
      name: "John Davis",
      email: "john.davis@school.com",
      avatar: "/avatars/teacher1.jpg",
    },
    navMain: [
      { title: "Dashboard", url: "/staff", icon: IconDashboard, shortForm: "Dash" },
      { title: "My Classes", url: "/staff/students", icon: IconUsers, shortForm: "Class" },
      { title: "Attendance", url: "/staff/attendance", icon: IconUserCheck, shortForm: "Att" },
      { title: "Schedule", url: "/staff/schedule", icon: IconCalendar, shortForm: "Sch" },
      { title: "Gradebook", url: "/staff/gradebook", icon: IconBook, shortForm: "Grade" },
      {
        title: "Communication",
        url: "#",
        icon: IconMessage,
        shortForm: "Comm",
        items: [
          { title: "Messages", url: "/staff/communication#messages" },
          { title: "Announcements", url: "/staff/communication#announcements" },
          { title: "Parent Portal", url: "/staff/communication#parents" },
          { title: "Notifications", url: "/staff/communication#notifications" },
        ],
      },
      {
        title: "Results",
        url: "#",
        icon: IconClipboardList,
        shortForm: "Res",
        items: [
          { title: "Overview", url: "/staff/results#overview" },
          { title: "Subject Grades", url: "/staff/results#subjects" },
          { title: "Class Results", url: "/staff/results#classes" },
          { title: "Reports", url: "/staff/results#reports" },
        ],
      },
      { title: "Library", url: "/staff/library", icon: IconBooks, shortForm: "Lib" },
      {
        title: "Administration",
        url: "#",
        icon: IconFileText,
        shortForm: "Admin",
        items: [
          { title: "Departments", url: "/staff/departments" },
          { title: "School Policies", url: "/staff/admin#policies" },
          { title: "Timetable", url: "/staff/admin#timetable" },
          { title: "Curriculum", url: "/staff/admin#curriculum" },
          { title: "Reports", url: "/staff/admin#reports" },
        ],
      },
      { title: "IT Support", url: "/staff/it", icon: IconDeviceDesktop, shortForm: "IT" },
      { title: "Counselor", url: "/staff/counselor", icon: IconUserHeart, shortForm: "Couns" },
      { title: "Nurse", url: "/staff/nurse", icon: IconHeart, shortForm: "Nurse" },
      { title: "Security", url: "/staff/security", icon: IconShield, shortForm: "Sec" },
      { title: "Maintenance", url: "/staff/maintenance", icon: IconTools, shortForm: "Maint" },
    ],
    navSecondary: [
      { title: "Reports", url: "/staff/reports", icon: IconChartBar, shortForm: "Rpts" },
      { title: "Profile", url: "/staff/profile", icon: IconSettings, shortForm: "Prof" },
    ],
  }