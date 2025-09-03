import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  IconUsers,
  IconMessage,
  IconEye,
  IconCalendar,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react"

// Sample parent portal data
const parentStats = {
  totalParents: 245,
  activeParents: 189,
  messagesSent: 1250,
  eventsAttended: 45,
  documentsViewed: 890,
}

const recentActivities = [
  {
    id: 1,
    parent: "John Smith",
    student: "Sarah Smith",
    action: "Viewed Report Card",
    timestamp: "2024-12-15 02:30 PM",
    type: "document",
  },
  {
    id: 2,
    parent: "Maria Garcia",
    student: "Carlos Garcia",
    action: "RSVP'd to Parent-Teacher Conference",
    timestamp: "2024-12-15 11:45 AM",
    type: "event",
  },
  {
    id: 3,
    parent: "David Chen",
    student: "Emily Chen",
    action: "Sent Message to Teacher",
    timestamp: "2024-12-15 09:20 AM",
    type: "message",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Parent-Teacher Conference",
    date: "2024-12-18",
    time: "2:00 PM - 6:00 PM",
    attendees: 45,
    totalParents: 245,
  },
  {
    id: 2,
    title: "Winter Concert",
    date: "2024-12-20",
    time: "7:00 PM - 9:00 PM",
    attendees: 23,
    totalParents: 245,
  },
]

const getActivityIcon = (type: string) => {
  const icons = {
    "document": IconFileText,
    "event": IconCalendar,
    "message": IconMessage,
  }
  return icons[type as keyof typeof icons] || IconFileText
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function ParentPortalComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Parent Portal</h1>
            <p className="text-muted-foreground">
              Monitor parent engagement and manage parent-school communications
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Send Newsletter
            </Button>
            <Button>
              <IconMessage className="mr-2 h-4 w-4" />
              Broadcast Message
            </Button>
          </div>
        </div>

        {/* Parent Portal Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentStats.totalParents}</div>
              <p className="text-xs text-muted-foreground">
                Registered parents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentStats.activeParents}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((parentStats.activeParents / parentStats.totalParents) * 100)}% engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <IconMessage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentStats.messagesSent}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentStats.eventsAttended}</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Viewed</CardTitle>
              <IconEye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentStats.documentsViewed}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Parent Activities</CardTitle>
              <CardDescription>Latest interactions from the parent portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <ActivityIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.parent}</p>
                        <p className="text-xs text-muted-foreground">
                          Student: {activity.student}
                        </p>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events requiring parent participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline">
                        {event.attendees}/{event.totalParents} RSVPs
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{event.date} • {event.time}</p>
                    </div>
                    <Progress
                      value={(event.attendees / event.totalParents) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {Math.round((event.attendees / event.totalParents) * 100)}% response rate
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parent Engagement Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Engagement Overview</CardTitle>
            <CardDescription>Monthly engagement statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Portal Logins</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-muted-foreground">Parents active this month</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Message Responses</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">Response rate to messages</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Event Participation</span>
                  <span className="font-medium">42%</span>
                </div>
                <Progress value={42} className="h-2" />
                <p className="text-xs text-muted-foreground">Average event attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}