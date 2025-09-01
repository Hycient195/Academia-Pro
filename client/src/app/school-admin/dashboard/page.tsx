"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  IconUsers,
  IconBook,
  IconBuildingBank,
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconMail,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"

const enrollmentData = [
  { month: "Jan", students: 1150, revenue: 180000 },
  { month: "Feb", students: 1180, revenue: 185000 },
  { month: "Mar", students: 1200, revenue: 190000 },
  { month: "Apr", students: 1220, revenue: 195000 },
  { month: "May", students: 1230, revenue: 200000 },
  { month: "Jun", students: 1247, revenue: 245678 },
]

const attendanceData = [
  { name: "Present", value: 94.2, color: "#22c55e" },
  { name: "Absent", value: 3.8, color: "#ef4444" },
  { name: "Late", value: 2.0, color: "#f59e0b" },
]

const recentActivities = [
  {
    id: 1,
    type: "enrollment",
    title: "New student enrollment",
    description: "Sarah Johnson joined Class 10-A",
    time: "2h ago",
    avatar: "/avatars/student1.jpg",
    initials: "SJ",
  },
  {
    id: 2,
    type: "payment",
    title: "Fee payment received",
    description: "$1,200 from John Smith",
    time: "4h ago",
    avatar: "/avatars/student2.jpg",
    initials: "JS",
  },
  {
    id: 3,
    type: "exam",
    title: "Exam results published",
    description: "Mathematics final exam results",
    time: "1d ago",
    avatar: "/avatars/teacher1.jpg",
    initials: "MT",
  },
  {
    id: 4,
    type: "event",
    title: "Parent-teacher meeting",
    description: "Scheduled for tomorrow at 2 PM",
    time: "2d ago",
    avatar: "/avatars/teacher2.jpg",
    initials: "PT",
  },
]

export default function SchoolAdminDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your school's performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +12.5%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +2.1%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <IconBuildingBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$245,678</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600 flex items-center gap-1">
                  <IconTrendingDown className="h-3 w-3" />
                  -4.2%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +1.8%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Enrollment Trend Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Enrollment & Revenue Trend</CardTitle>
              <CardDescription>Monthly enrollment and revenue growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
              <CardDescription>Current month attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {attendanceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and activities from your school</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <IconEye className="mr-2 h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.avatar} />
                          <AvatarFallback>{activity.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {activity.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{activity.time}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <IconUsers className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Add New Student</h3>
              <p className="text-sm text-muted-foreground text-center">
                Register a new student in the system
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <IconBook className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Create Assignment</h3>
              <p className="text-sm text-muted-foreground text-center">
                Assign homework or projects to students
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                <IconCalendar className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Schedule Event</h3>
              <p className="text-sm text-muted-foreground text-center">
                Plan school events and activities
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
                <IconMail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Send Announcement</h3>
              <p className="text-sm text-muted-foreground text-center">
                Communicate with parents and staff
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance by Grade</CardTitle>
              <CardDescription>Average performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-medium">Grade 10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">92%</span>
                    <IconTrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Progress value={92} className="h-3" />
                <p className="text-xs text-muted-foreground ml-6">245 students • 15 subjects</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">Grade 11</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">88%</span>
                    <IconTrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Progress value={88} className="h-3" />
                <p className="text-xs text-muted-foreground ml-6">198 students • 16 subjects</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-medium">Grade 12</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">85%</span>
                    <IconTrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <Progress value={85} className="h-3" />
                <p className="text-xs text-muted-foreground ml-6">156 students • 18 subjects</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Summary</CardTitle>
              <CardDescription>Attendance statistics for current month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Present</p>
                      <p className="text-sm text-muted-foreground">On time attendance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                    <p className="text-xs text-green-600">+1.8% from last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">Absent</p>
                      <p className="text-sm text-muted-foreground">Unexcused absences</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">3.8%</p>
                    <p className="text-xs text-red-600">-0.5% from last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <div>
                      <p className="font-medium">Late</p>
                      <p className="text-sm text-muted-foreground">Arrived after start time</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">2.0%</p>
                    <p className="text-xs text-yellow-600">+0.3% from last month</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Working Days</span>
                  <span className="font-medium">22 days</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Average Daily Attendance</span>
                  <span className="font-medium">1,178 students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}