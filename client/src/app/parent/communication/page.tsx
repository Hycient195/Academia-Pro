import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconMessage,
  IconMail,
  IconPhone,
  IconCalendar,
  IconSend,
  IconUser,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconPlus,
} from "@tabler/icons-react"

// Sample communication data
const teachers = [
  {
    id: 1,
    name: "Mr. Johnson",
    subject: "Mathematics",
    email: "johnson@school.com",
    phone: "+1 (555) 100-0001",
    avatar: "/avatars/teacher1.jpg",
    status: "online",
    lastMessage: "Regarding Emma's recent test performance",
    unreadCount: 2,
  },
  {
    id: 2,
    name: "Dr. Smith",
    subject: "Physics",
    email: "smith@school.com",
    phone: "+1 (555) 100-0002",
    avatar: "/avatars/teacher2.jpg",
    status: "offline",
    lastMessage: "Physics project submission confirmed",
    unreadCount: 0,
  },
  {
    id: 3,
    name: "Mrs. Wilson",
    subject: "Chemistry",
    email: "wilson@school.com",
    phone: "+1 (555) 100-0003",
    avatar: "/avatars/teacher3.jpg",
    status: "online",
    lastMessage: "Lab safety guidelines update",
    unreadCount: 1,
  },
  {
    id: 4,
    name: "Ms. Davis",
    subject: "English Literature",
    email: "davis@school.com",
    phone: "+1 (555) 100-0004",
    avatar: "/avatars/teacher4.jpg",
    status: "away",
    lastMessage: "Essay grading completed",
    unreadCount: 0,
  },
]

const messages = [
  {
    id: 1,
    teacherId: 1,
    teacherName: "Mr. Johnson",
    subject: "Mathematics Test Results",
    message: "Emma performed well on her recent mathematics test. She scored 94% and showed excellent understanding of algebraic concepts. Keep up the good work!",
    timestamp: "2024-01-15T10:30:00",
    type: "academic",
    read: false,
    priority: "normal",
  },
  {
    id: 2,
    teacherId: 2,
    teacherName: "Dr. Smith",
    subject: "Physics Project",
    message: "Michael's physics project on renewable energy sources has been submitted and graded. He received an A- for his innovative approach and detailed research.",
    timestamp: "2024-01-14T14:20:00",
    type: "assignment",
    read: true,
    priority: "normal",
  },
  {
    id: 3,
    teacherId: 3,
    teacherName: "Mrs. Wilson",
    subject: "Chemistry Lab Safety",
    message: "Important reminder: All students must wear safety goggles during chemistry lab sessions. Emma has been reminded of this safety protocol.",
    timestamp: "2024-01-13T09:15:00",
    type: "announcement",
    read: true,
    priority: "high",
  },
  {
    id: 4,
    teacherId: 1,
    teacherName: "Mr. Johnson",
    subject: "Homework Assignment",
    message: "Please ensure Emma completes the algebra homework assignment due tomorrow. The problems focus on quadratic equations.",
    timestamp: "2024-01-12T16:45:00",
    type: "homework",
    read: false,
    priority: "normal",
  },
]

const upcomingMeetings = [
  {
    id: 1,
    teacherName: "Mr. Johnson",
    childName: "Emma Johnson",
    subject: "Mathematics",
    date: "2024-01-20",
    time: "2:00 PM",
    type: "Parent-Teacher Meeting",
    status: "scheduled",
  },
  {
    id: 2,
    teacherName: "Dr. Smith",
    childName: "Michael Johnson",
    subject: "Physics",
    date: "2024-01-22",
    time: "3:30 PM",
    type: "Progress Discussion",
    status: "scheduled",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "online": return "bg-green-500"
    case "away": return "bg-yellow-500"
    case "offline": return "bg-gray-500"
    default: return "bg-gray-500"
  }
}

const getMessageTypeColor = (type: string) => {
  switch (type) {
    case "academic": return "bg-blue-100 text-blue-800"
    case "assignment": return "bg-green-100 text-green-800"
    case "announcement": return "bg-purple-100 text-purple-800"
    case "homework": return "bg-orange-100 text-orange-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getPriorityBadge = (priority: string) => {
  if (priority === "high") {
    return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
  }
  return null
}

export default function CommunicationPage() {
  const unreadMessages = messages.filter(m => !m.read).length
  const upcomingMeetingsCount = upcomingMeetings.length

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
            <p className="text-muted-foreground">
              Connect with teachers and stay updated on your children's progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconCalendar className="mr-2 h-4 w-4" />
              Schedule Meeting ({upcomingMeetingsCount})
            </Button>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>

        {/* Communication Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <IconMessage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <IconUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.filter(t => t.status === "online").length}</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetingsCount}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">
                Average response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Communication Tabs */}
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
            <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
            <TabsTrigger value="meetings">Meetings ({upcomingMeetingsCount})</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Inbox</CardTitle>
                <CardDescription>
                  Communications from teachers and school staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg ${
                        !message.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={teachers.find(t => t.id === message.teacherId)?.avatar}
                              alt={message.teacherName}
                            />
                            <AvatarFallback>
                              {message.teacherName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{message.teacherName}</h3>
                              <Badge className={getMessageTypeColor(message.type)}>
                                {message.type}
                              </Badge>
                              {getPriorityBadge(message.priority)}
                              {!message.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">
                              {message.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <IconMessage className="mr-1 h-3 w-3" />
                            Reply
                          </Button>
                          {!message.read && (
                            <Button variant="outline" size="sm">
                              <IconCircleCheck className="mr-1 h-3 w-3" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Directory</CardTitle>
                <CardDescription>
                  Contact information for your children's teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={teacher.avatar} alt={teacher.name} />
                            <AvatarFallback>
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(teacher.status)}`}></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{teacher.name}</h3>
                          <p className="text-sm text-muted-foreground">{teacher.subject} Teacher</p>
                          {teacher.unreadCount > 0 && (
                            <Badge className="bg-orange-100 text-orange-800 mt-1">
                              {teacher.unreadCount} unread
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <IconMail className="h-4 w-4 text-muted-foreground" />
                          <span>{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <IconPhone className="h-4 w-4 text-muted-foreground" />
                          <span>{teacher.phone}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last message: {teacher.lastMessage}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <IconMessage className="mr-1 h-3 w-3" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <IconPhone className="mr-1 h-3 w-3" />
                          Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Meetings</CardTitle>
                <CardDescription>
                  Upcoming parent-teacher meetings and discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <IconCalendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{meeting.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              with {meeting.teacherName} • {meeting.subject}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {meeting.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium">{meeting.date} at {meeting.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Regarding</p>
                          <p className="font-medium">{meeting.childName}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <IconCalendar className="mr-1 h-3 w-3" />
                          Add to Calendar
                        </Button>
                        <Button variant="outline" size="sm">
                          <IconMessage className="mr-1 h-3 w-3" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  ))}

                  {upcomingMeetings.length === 0 && (
                    <div className="text-center py-8">
                      <IconCalendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No upcoming meetings scheduled
                      </p>
                      <Button className="mt-4">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Schedule Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>
                  Send a message to teachers or school staff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Select a teacher...</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Regarding Child</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Select child...</option>
                      <option>Emma Johnson</option>
                      <option>Michael Johnson</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Enter message subject..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button>
                    <IconSend className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}