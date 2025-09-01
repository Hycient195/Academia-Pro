import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconUsers,
  IconBook,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconMessage,
  IconClipboardList,
  IconUserCheck,
} from "@tabler/icons-react"

// Sample data for staff dashboard
const todaysClasses = [
  {
    id: 1,
    subject: "Mathematics",
    grade: "Grade 10-A",
    time: "9:00 AM - 10:00 AM",
    room: "Room 101",
    students: 32,
    status: "upcoming",
  },
  {
    id: 2,
    subject: "Physics",
    grade: "Grade 11-B",
    time: "10:30 AM - 11:30 AM",
    room: "Lab 201",
    students: 28,
    status: "upcoming",
  },
  {
    id: 3,
    subject: "Mathematics",
    grade: "Grade 9-C",
    time: "2:00 PM - 3:00 PM",
    room: "Room 105",
    students: 35,
    status: "upcoming",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "grade_submitted",
    message: "Submitted grades for Mathematics Grade 10-A",
    time: "2 hours ago",
    icon: IconBook,
  },
  {
    id: 2,
    type: "attendance_marked",
    message: "Marked attendance for Physics Grade 11-B",
    time: "4 hours ago",
    icon: IconUserCheck,
  },
  {
    id: 3,
    type: "message_sent",
    message: "Sent announcement to all students",
    time: "1 day ago",
    icon: IconMessage,
  },
]

const studentPerformance = [
  { name: "Sarah Johnson", grade: "A", attendance: 95, avatar: "/avatars/student1.jpg" },
  { name: "Michael Chen", grade: "B+", attendance: 88, avatar: "/avatars/student2.jpg" },
  { name: "Emily Rodriguez", grade: "A-", attendance: 92, avatar: "/avatars/student3.jpg" },
  { name: "David Kim", grade: "B", attendance: 85, avatar: "/avatars/student4.jpg" },
]

export default function StaffDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your teaching overview and daily schedule.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Classes</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Classes scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95</div>
              <p className="text-xs text-muted-foreground">
                Across all classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <IconUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92.3%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +2.1%
                </span>
                from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <IconClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Assignments to grade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Today&apos;s Schedule */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>Your classes and activities for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysClasses.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <IconBook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{class_.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {class_.grade} • {class_.time} • {class_.room}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{class_.students} students</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {class_.status === "upcoming" ? "Upcoming" : "Completed"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common teaching tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <IconUserCheck className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <IconBook className="mr-2 h-4 w-4" />
                Enter Grades
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <IconMessage className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <IconClipboardList className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest teaching activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <activity.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Student Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students with highest grades this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentPerformance.map((student, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.attendance}% attendance</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Grade {student.grade}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Class Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
            <CardDescription>Performance metrics across your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Grade 10-A Mathematics</span>
                  <span>88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Grade 11-B Physics</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Grade 9-C Mathematics</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}