import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconMessage,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconBook,
  IconAward,
} from "@tabler/icons-react"

// Sample parent dashboard data
const children = [
  {
    id: 1,
    name: "Emma Johnson",
    grade: "10th Grade",
    section: "A",
    avatar: "/avatars/student1.jpg",
    gpa: 3.8,
    attendance: 95,
    pendingAssignments: 2,
    upcomingEvents: 3,
    recentGrade: "A-",
    status: "excellent",
  },
  {
    id: 2,
    name: "Michael Johnson",
    grade: "8th Grade",
    section: "B",
    avatar: "/avatars/student2.jpg",
    gpa: 3.2,
    attendance: 88,
    pendingAssignments: 5,
    upcomingEvents: 1,
    recentGrade: "B+",
    status: "good",
  },
]

const recentActivities = [
  {
    id: 1,
    childName: "Emma Johnson",
    type: "grade",
    message: "Received A- in Mathematics final exam",
    time: "2 hours ago",
    icon: IconAward,
  },
  {
    id: 2,
    childName: "Michael Johnson",
    type: "assignment",
    message: "Submitted Science project (pending review)",
    time: "4 hours ago",
    icon: IconBook,
  },
  {
    id: 3,
    childName: "Emma Johnson",
    type: "announcement",
    message: "Parent-teacher meeting scheduled for tomorrow",
    time: "1 day ago",
    icon: IconCalendar,
  },
  {
    id: 4,
    childName: "Michael Johnson",
    type: "attendance",
    message: "Marked absent for Physics class",
    time: "2 days ago",
    icon: IconAlertTriangle,
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    child: "Emma Johnson",
    date: "2024-01-20",
    time: "2:00 PM",
    type: "meeting",
  },
  {
    id: 2,
    title: "Science Fair",
    child: "Michael Johnson",
    date: "2024-01-25",
    time: "9:00 AM",
    type: "event",
  },
  {
    id: 3,
    title: "Basketball Tournament",
    child: "Emma Johnson",
    date: "2024-01-28",
    time: "3:00 PM",
    type: "sports",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent": return "text-green-600"
    case "good": return "text-blue-600"
    case "average": return "text-yellow-600"
    case "needs_attention": return "text-red-600"
    default: return "text-gray-600"
  }
}

const getStatusBadge = (status: string) => {
  const variants = {
    "excellent": "bg-green-100 text-green-800",
    "good": "bg-blue-100 text-blue-800",
    "average": "bg-yellow-100 text-yellow-800",
    "needs_attention": "bg-red-100 text-red-800",
  }
  return variants[status as keyof typeof variants] || variants.good
}

export default function ParentDashboard() {
  const totalChildren = children.length
  const avgGPA = children.reduce((sum, child) => sum + child.gpa, 0) / totalChildren
  const avgAttendance = children.reduce((sum, child) => sum + child.attendance, 0) / totalChildren
  const totalPendingAssignments = children.reduce((sum, child) => sum + child.pendingAssignments, 0)
  const totalUpcomingEvents = children.reduce((sum, child) => sum + child.upcomingEvents, 0)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your children&apos;s academic progress.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Children</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChildren}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgGPA.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.2 from last month</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+1.5% from last month</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Assignments to review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Children Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.avatar} alt={child.name} />
                    <AvatarFallback>
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {child.grade} - Section {child.section}
                    </p>
                  </div>
                  <Badge className={getStatusBadge(child.status)}>
                    {child.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">GPA</p>
                    <p className="text-lg font-semibold">{child.gpa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-lg font-semibold">{child.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-lg font-semibold">{child.pendingAssignments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="text-lg font-semibold">{child.upcomingEvents}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <IconMessage className="mr-1 h-3 w-3" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities & Upcoming Events */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest updates from your children&apos;s academic life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.childName}</p>
                      <p className="text-sm text-muted-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Important dates and events for your children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <IconCalendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.child} • {event.date} at {event.time}
                      </p>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts for managing your children&apos;s education
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconMessage className="h-6 w-6" />
                <span>Contact Teachers</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconCalendar className="h-6 w-6" />
                <span>Schedule Meeting</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconBook className="h-6 w-6" />
                <span>View Assignments</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconAward className="h-6 w-6" />
                <span>Academic Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}