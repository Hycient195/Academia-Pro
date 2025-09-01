import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUser,
  IconDownload,
  IconPrinter,
} from "@tabler/icons-react"

// Sample timetable data
const weeklySchedule = {
  monday: [
    { time: "9:00 AM", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 201", type: "Lecture" },
    { time: "10:30 AM", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "Lab" },
    { time: "2:00 PM", subject: "English Literature", teacher: "Ms. Davis", room: "Room 105", type: "Lecture" },
  ],
  tuesday: [
    { time: "9:00 AM", subject: "Chemistry", teacher: "Mrs. Wilson", room: "Lab 2", type: "Lab" },
    { time: "11:00 AM", subject: "History", teacher: "Mr. Brown", room: "Room 301", type: "Lecture" },
    { time: "1:30 PM", subject: "Physical Education", teacher: "Coach Miller", room: "Gym", type: "Practical" },
  ],
  wednesday: [
    { time: "9:00 AM", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 201", type: "Lecture" },
    { time: "10:30 AM", subject: "Biology", teacher: "Ms. Green", room: "Lab 1", type: "Lab" },
    { time: "2:00 PM", subject: "Computer Science", teacher: "Mr. Tech", room: "Computer Lab", type: "Practical" },
  ],
  thursday: [
    { time: "9:00 AM", subject: "Physics", teacher: "Dr. Smith", room: "Lab 3", type: "Lab" },
    { time: "11:00 AM", subject: "English Literature", teacher: "Ms. Davis", room: "Room 105", type: "Lecture" },
    { time: "1:30 PM", subject: "Chemistry", teacher: "Mrs. Wilson", room: "Lab 2", type: "Lab" },
  ],
  friday: [
    { time: "9:00 AM", subject: "History", teacher: "Mr. Brown", room: "Room 301", type: "Lecture" },
    { time: "10:30 AM", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 201", type: "Lecture" },
    { time: "2:00 PM", subject: "Art", teacher: "Ms. Creative", room: "Art Room", type: "Practical" },
  ],
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "Lecture": return "bg-blue-100 text-blue-800"
    case "Lab": return "bg-green-100 text-green-800"
    case "Practical": return "bg-purple-100 text-purple-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getDayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

export default function TimetablePage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentDay = today

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
            <p className="text-muted-foreground">
              View your class schedule and manage your academic calendar
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">
              <IconPrinter className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Today's Schedule Highlight */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-primary" />
              Today&apos;s Schedule ({getDayName(currentDay)})
            </CardTitle>
            <CardDescription>
              Your classes for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklySchedule[currentDay as keyof typeof weeklySchedule]?.map((class_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <IconClock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{class_.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {class_.teacher} • {class_.room}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{class_.time}</p>
                    <Badge className={getTypeColor(class_.type)}>
                      {class_.type}
                    </Badge>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  No classes scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Tabs defaultValue={currentDay} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="monday">Mon</TabsTrigger>
            <TabsTrigger value="tuesday">Tue</TabsTrigger>
            <TabsTrigger value="wednesday">Wed</TabsTrigger>
            <TabsTrigger value="thursday">Thu</TabsTrigger>
            <TabsTrigger value="friday">Fri</TabsTrigger>
          </TabsList>

          {Object.entries(weeklySchedule).map(([day, classes]) => (
            <TabsContent key={day} value={day} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{getDayName(day)} Schedule</CardTitle>
                  <CardDescription>
                    Your classes for {getDayName(day).toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classes.map((class_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <IconUser className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{class_.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              {class_.teacher}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <IconMapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{class_.room}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{class_.time}</p>
                          <Badge className={getTypeColor(class_.type)}>
                            {class_.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lab Sessions</CardTitle>
              <IconUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22.5</div>
              <p className="text-xs text-muted-foreground">
                Hours per week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Periods</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}