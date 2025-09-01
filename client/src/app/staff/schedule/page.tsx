"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconBook,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

// Sample schedule data
const weeklySchedule = [
  {
    id: 1,
    day: "Monday",
    classes: [
      {
        id: 1,
        subject: "Mathematics",
        grade: "Grade 10-A",
        time: "9:00 AM - 10:00 AM",
        room: "Room 101",
        students: 32,
        type: "lecture",
      },
      {
        id: 2,
        subject: "Mathematics",
        grade: "Grade 9-C",
        time: "11:00 AM - 12:00 PM",
        room: "Room 105",
        students: 35,
        type: "lecture",
      },
      {
        id: 3,
        subject: "Mathematics",
        grade: "Grade 11-B",
        time: "2:00 PM - 3:00 PM",
        room: "Room 201",
        students: 28,
        type: "tutorial",
      },
    ],
  },
  {
    id: 2,
    day: "Tuesday",
    classes: [
      {
        id: 4,
        subject: "Physics",
        grade: "Grade 11-B",
        time: "10:30 AM - 11:30 AM",
        room: "Lab 201",
        students: 28,
        type: "practical",
      },
      {
        id: 5,
        subject: "Mathematics",
        grade: "Grade 10-A",
        time: "1:00 PM - 2:00 PM",
        room: "Room 101",
        students: 32,
        type: "lecture",
      },
    ],
  },
  {
    id: 3,
    day: "Wednesday",
    classes: [
      {
        id: 6,
        subject: "Mathematics",
        grade: "Grade 10-A",
        time: "9:00 AM - 10:00 AM",
        room: "Room 101",
        students: 32,
        type: "lecture",
      },
      {
        id: 7,
        subject: "Physics",
        grade: "Grade 11-B",
        time: "11:00 AM - 12:00 PM",
        room: "Lab 201",
        students: 28,
        type: "practical",
      },
    ],
  },
  {
    id: 4,
    day: "Thursday",
    classes: [
      {
        id: 8,
        subject: "Mathematics",
        grade: "Grade 9-C",
        time: "10:00 AM - 11:00 AM",
        room: "Room 105",
        students: 35,
        type: "lecture",
      },
      {
        id: 9,
        subject: "Mathematics",
        grade: "Grade 11-B",
        time: "2:30 PM - 3:30 PM",
        room: "Room 201",
        students: 28,
        type: "tutorial",
      },
    ],
  },
  {
    id: 5,
    day: "Friday",
    classes: [
      {
        id: 10,
        subject: "Physics",
        grade: "Grade 11-B",
        time: "9:30 AM - 10:30 AM",
        room: "Lab 201",
        students: 28,
        type: "practical",
      },
      {
        id: 11,
        subject: "Mathematics",
        grade: "Grade 10-A",
        time: "1:30 PM - 2:30 PM",
        room: "Room 101",
        students: 32,
        type: "lecture",
      },
    ],
  },
]

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

export default function SchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState("current")
  const [selectedView, setSelectedView] = useState("weekly")
  const [selectedDay, setSelectedDay] = useState("Monday")

  const getClassTypeColor = (type: string) => {
    const colors = {
      "lecture": "bg-blue-100 text-blue-800 border-blue-200",
      "tutorial": "bg-green-100 text-green-800 border-green-200",
      "practical": "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getCurrentDaySchedule = () => {
    return weeklySchedule.find(day => day.day === selectedDay)?.classes || []
  }

  const getTotalWeeklyHours = () => {
    return weeklySchedule.reduce((total, day) => total + day.classes.length, 0) * 1 // Assuming 1 hour per class
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
            <p className="text-muted-foreground">
              View and manage your teaching schedule and timetable
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
            <Button variant="outline">
              <IconEdit className="mr-2 h-4 w-4" />
              Edit Schedule
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Classes</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalWeeklyHours()}</div>
              <p className="text-xs text-muted-foreground">
                Teaching hours this week
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
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <IconBook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Mathematics & Physics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Classes</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCurrentDaySchedule().length}</div>
              <p className="text-xs text-muted-foreground">
                Classes scheduled today
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="weekly" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">Previous Week</SelectItem>
                  <SelectItem value="current">Current Week</SelectItem>
                  <SelectItem value="next">Next Week</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-4">
              {weeklySchedule.map((daySchedule) => (
                <Card key={daySchedule.day}>
                  <CardHeader>
                    <CardTitle className="text-lg">{daySchedule.day}</CardTitle>
                    <CardDescription>
                      {daySchedule.classes.length} classes scheduled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {daySchedule.classes.map((class_) => (
                        <div key={class_.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-12 rounded ${getClassTypeColor(class_.type)}`} />
                            <div>
                              <p className="font-medium">{class_.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {class_.grade} • {class_.time} • {class_.room}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-2">
                              {class_.students} students
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {daySchedule.classes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <IconCalendar className="mx-auto h-8 w-8 mb-2" />
                          <p>No classes scheduled for {daySchedule.day}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weeklySchedule.map((day) => (
                    <SelectItem key={day.day} value={day.day}>
                      {day.day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {getCurrentDaySchedule().length} classes
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{selectedDay}&apos;s Schedule</CardTitle>
                <CardDescription>
                  Detailed view of your classes for {selectedDay.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCurrentDaySchedule().map((class_) => (
                    <div key={class_.id} className="flex items-center justify-between p-6 border rounded-lg">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-semibold text-lg">{class_.time.split(' - ')[0]}</p>
                          <p className="text-sm text-muted-foreground">to</p>
                          <p className="font-semibold text-lg">{class_.time.split(' - ')[1]}</p>
                        </div>
                        <div className={`w-1 h-16 rounded ${getClassTypeColor(class_.type)}`} />
                        <div>
                          <h3 className="font-semibold text-lg">{class_.subject}</h3>
                          <p className="text-muted-foreground">{class_.grade}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <IconMapPin className="h-4 w-4" />
                              {class_.room}
                            </div>
                            <div className="flex items-center gap-1">
                              <IconUsers className="h-4 w-4" />
                              {class_.students} students
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <IconEdit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {getCurrentDaySchedule().length === 0 && (
                    <div className="text-center py-12">
                      <IconCalendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Classes Today</h3>
                      <p className="text-muted-foreground">
                        You have no classes scheduled for {selectedDay.toLowerCase()}.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Overview</CardTitle>
                  <CardDescription>
                    Monthly view of your teaching schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconCalendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Calendar view coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule Summary</CardTitle>
                  <CardDescription>
                    Quick overview of your teaching load
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Weekly Hours</span>
                    <span className="font-semibold">{getTotalWeeklyHours()} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Classes per Week</span>
                    <span className="font-semibold">
                      {weeklySchedule.reduce((total, day) => total + day.classes.length, 0)} classes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Class Size</span>
                    <span className="font-semibold">32 students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Subjects Taught</span>
                    <span className="font-semibold">2 subjects</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}