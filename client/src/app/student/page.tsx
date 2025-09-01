import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  IconBook,
  IconCalendar,
  IconChartBar,
  IconClipboardList,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconUsers,
} from "@tabler/icons-react"

export default function StudentDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your academic overview and upcoming activities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +0.2
                </span>
                from last semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +2.1%
                </span>
                this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <IconClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-orange-600 flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  2 due this week
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Class</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Math</div>
              <p className="text-xs text-muted-foreground">
                Today at 10:00 AM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Today's Schedule */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes and activities for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <IconBook className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Mathematics</p>
                  <p className="text-sm text-muted-foreground">Room 201 • Mr. Johnson</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">10:00 AM</p>
                  <p className="text-sm text-muted-foreground">60 min</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <IconBook className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Physics</p>
                  <p className="text-sm text-muted-foreground">Lab 3 • Dr. Smith</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">11:30 AM</p>
                  <p className="text-sm text-muted-foreground">90 min</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <IconBook className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">English Literature</p>
                  <p className="text-sm text-muted-foreground">Room 105 • Ms. Davis</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">2:00 PM</p>
                  <p className="text-sm text-muted-foreground">60 min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common student tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <IconClipboardList className="mr-2 h-4 w-4" />
                View Assignments
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <IconChartBar className="mr-2 h-4 w-4" />
                Check Grades
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <IconCalendar className="mr-2 h-4 w-4" />
                View Timetable
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <IconUsers className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Upcoming Deadlines */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your latest assessment results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Mathematics Quiz</p>
                  <p className="text-sm text-muted-foreground">Chapter 5: Algebra</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800">A (95%)</Badge>
                  <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Physics Lab Report</p>
                  <p className="text-sm text-muted-foreground">Experiment 3</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800">B+ (87%)</Badge>
                  <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">English Essay</p>
                  <p className="text-sm text-muted-foreground">Literary Analysis</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800">A- (92%)</Badge>
                  <p className="text-xs text-muted-foreground mt-1">2 weeks ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Assignments and exams due soon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg border-orange-200 bg-orange-50">
                <IconAlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium">Chemistry Project</p>
                  <p className="text-sm text-muted-foreground">Due in 2 days</p>
                </div>
                <Badge variant="outline" className="text-orange-600">High Priority</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <IconClock className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">History Research Paper</p>
                  <p className="text-sm text-muted-foreground">Due in 1 week</p>
                </div>
                <Badge variant="outline">Medium Priority</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <IconCircleCheck className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Biology Quiz</p>
                  <p className="text-sm text-muted-foreground">Due in 2 weeks</p>
                </div>
                <Badge variant="outline">Low Priority</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Progress</CardTitle>
            <CardDescription>Your performance across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Mathematics</span>
                  <span className="font-medium">A (94%)</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Physics</span>
                  <span className="font-medium">B+ (87%)</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>English</span>
                  <span className="font-medium">A- (91%)</span>
                </div>
                <Progress value={91} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Chemistry</span>
                  <span className="font-medium">B (83%)</span>
                </div>
                <Progress value={83} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}