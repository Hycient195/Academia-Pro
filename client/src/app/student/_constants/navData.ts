import { RoleConfig } from "@/components/portal-sidebar";
import {
  IconDashboard,
  IconUsers,
  IconMail,
  IconChartBar,
  IconFileText,
  IconUser,
  IconCalendar,
  IconClipboardList,
} from "@tabler/icons-react"

export const studentNavData: RoleConfig = {
    label: "Student Portal",
    shortLabel: "Student",
    homeUrl: "/student/dashboard",
    collapsible: "offcanvas",
    user: {
      name: "John Doe",
      email: "john.doe@student.school.com",
      avatar: "/avatars/student.jpg",
    },
    navMain: [
      { title: "Dashboard", url: "/student/dashboard", icon: IconDashboard },
      { title: "My Grades", url: "/student/grades", icon: IconChartBar },
      { title: "Results", url: "/student/results", icon: IconFileText },
      { title: "Assignments", url: "/student/assignments", icon: IconClipboardList },
      { title: "Timetable", url: "/student/timetable", icon: IconCalendar },
      { title: "Attendance", url: "/student/attendance", icon: IconUsers },
      { title: "Fees", url: "/student/fees", icon: IconFileText },
    ],
    navSecondary: [
      { title: "Announcements", url: "/student/announcements", icon: IconMail },
      { title: "Profile", url: "/student/profile", icon: IconUser },
    ],
  }