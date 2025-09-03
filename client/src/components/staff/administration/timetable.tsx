import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  IconCalendar,
  IconPlus,
  IconEdit,
  IconEye,
  IconClock,
  IconUsers,
} from "@tabler/icons-react"

// Sample timetable data
const timetableData = [
  {
    id: 1,
    grade: "Grade 10-A",
    subject: "Mathematics",
    teacher: "Mr. Johnson",
    day: "Monday",
    time: "09:00 - 10:00",
    room: "Room 101",
    status: "Active",
  },
  {
    id: 2,
    grade: "Grade 10-A",
    subject: "English",
    teacher: "Ms. Davis",
    day: "Monday",
    time: "10:00 - 11:00",
    room: "Room 102",
    status: "Active",
  },
  {
    id: 3,
    grade: "Grade 11-B",
    subject: "Physics",
    teacher: "Dr. Smith",
    day: "Tuesday",
    time: "09:00 - 10:30",
    room: "Lab 201",
    status: "Active",
  },
]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
]

const getStatusColor = (status: string) => {
  const colors = {
    "Active": "bg-green-100 text-green-800",
    "Inactive": "bg-gray-100 text-gray-800",
    "Cancelled": "bg-red-100 text-red-800",
  }
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

export default function TimetableComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
            <p className="text-muted-foreground">
              Create and manage class schedules and timetables
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconEye className="mr-2 h-4 w-4" />
              View Full Schedule
            </Button>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </div>
        </div>

        {/* Timetable Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Teaching this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classrooms Used</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                Out of 25 available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
              <IconEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No scheduling conflicts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
            <CardDescription>
              Overview of all scheduled classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 p-3 text-left font-medium bg-muted">Time</th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="border border-gray-200 p-3 text-left font-medium bg-muted min-w-[200px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, index) => (
                    <tr key={timeSlot}>
                      <td className="border border-gray-200 p-3 font-medium bg-muted/50">
                        {timeSlot}
                      </td>
                      {daysOfWeek.map((day) => {
                        const classForSlot = timetableData.find(
                          (cls) => cls.day === day && cls.time === timeSlot
                        )

                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3">
                            {classForSlot ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {classForSlot.grade}
                                  </Badge>
                                  <Badge className={`${getStatusColor(classForSlot.status)} text-xs`}>
                                    {classForSlot.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{classForSlot.subject}</p>
                                  <p className="text-xs text-muted-foreground">{classForSlot.teacher}</p>
                                  <p className="text-xs text-muted-foreground">{classForSlot.room}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground text-sm">
                                No class
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Classes</CardTitle>
            <CardDescription>
              Latest timetable entries and modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timetableData.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <IconCalendar className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{classItem.subject}</h4>
                      <Badge variant="outline">{classItem.grade}</Badge>
                      <Badge className={`${getStatusColor(classItem.status)} text-xs`}>
                        {classItem.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{classItem.teacher}</span>
                      <span>•</span>
                      <span>{classItem.day} {classItem.time}</span>
                      <span>•</span>
                      <span>{classItem.room}</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}