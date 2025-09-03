import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconUsers,
  IconCircleCheck,
  IconX,
  IconClock,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react"

// Sample attendance data
const monthlyAttendance = [
  { month: "January", present: 22, absent: 2, late: 1, total: 25 },
  { month: "February", present: 20, absent: 3, late: 2, total: 25 },
  { month: "March", present: 23, absent: 1, late: 1, total: 25 },
  { month: "April", present: 21, absent: 2, late: 2, total: 25 },
  { month: "May", present: 24, absent: 1, late: 0, total: 25 },
]

const recentAttendance = [
  { date: "2024-01-15", subject: "Mathematics", status: "present", time: "9:00 AM" },
  { date: "2024-01-15", subject: "Physics", status: "present", time: "10:30 AM" },
  { date: "2024-01-14", subject: "Chemistry", status: "late", time: "9:00 AM" },
  { date: "2024-01-14", subject: "English", status: "present", time: "11:00 AM" },
  { date: "2024-01-13", subject: "History", status: "absent", time: "2:00 PM" },
  { date: "2024-01-13", subject: "Biology", status: "present", time: "10:30 AM" },
]

const subjectAttendance = [
  { subject: "Mathematics", present: 18, total: 20, percentage: 90 },
  { subject: "Physics", present: 16, total: 20, percentage: 80 },
  { subject: "Chemistry", present: 19, total: 20, percentage: 95 },
  { subject: "English", present: 17, total: 20, percentage: 85 },
  { subject: "History", present: 15, total: 20, percentage: 75 },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return <IconCircleCheck className="h-5 w-5 text-green-600" />
    case "absent":
      return <IconX className="h-5 w-5 text-red-600" />
    case "late":
      return <IconClock className="h-5 w-5 text-orange-600" />
    default:
      return <IconClock className="h-5 w-5 text-gray-600" />
  }
}

const getStatusBadge = (status: string) => {
  const variants = {
    "present": "bg-green-100 text-green-800",
    "absent": "bg-red-100 text-red-800",
    "late": "bg-orange-100 text-orange-800",
  }
  return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
}

const getAttendanceColor = (percentage: number) => {
  if (percentage >= 90) return "text-green-600"
  if (percentage >= 75) return "text-yellow-600"
  return "text-red-600"
}

export default function AttendancePage() {
  const currentMonth = monthlyAttendance[monthlyAttendance.length - 1]
  const overallAttendance = 94.2
  const totalPresent = monthlyAttendance.reduce((sum, month) => sum + month.present, 0)
  const totalClasses = monthlyAttendance.reduce((sum, month) => sum + month.total, 0)
  const attendanceRate = ((totalPresent / totalClasses) * 100)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">
              Track your attendance record and class participation
            </p>
          </div>
          <Button>
            <IconCalendar className="mr-2 h-4 w-4" />
            Mark Today's Attendance
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAttendance}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +2.1% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPresent}</div>
              <p className="text-xs text-muted-foreground">
                Out of {totalClasses} classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonth.present}/{currentMonth.total}</div>
              <p className="text-xs text-muted-foreground">
                {((currentMonth.present / currentMonth.total) * 100).toFixed(1)}% attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonth.late}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                  <CardDescription>
                    Your attendance record for the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAttendance.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(record.status)}
                          <div>
                            <p className="font-medium">{record.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()} • {record.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>
                    Your attendance pattern over the past 5 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyAttendance.map((month, index) => {
                      const attendanceRate = (month.present / month.total) * 100
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{month.month}</span>
                            <span className={getAttendanceColor(attendanceRate)}>
                              {attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={attendanceRate} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Subject</CardTitle>
                <CardDescription>
                  Your attendance percentage for each subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectAttendance.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subject.present} out of {subject.total} classes
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold mb-1">
                          {subject.percentage}%
                        </div>
                        <Progress value={subject.percentage} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Attendance History</CardTitle>
                <CardDescription>
                  Detailed attendance record for all your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttendance.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <p className="font-medium">{record.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()} • {record.time}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}