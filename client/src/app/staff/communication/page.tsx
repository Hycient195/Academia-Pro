"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  IconMail,
  IconPlus,
  IconSend,
  IconUsers,
  IconMessage,
  IconPhone,
  IconSearch,
  IconFilter,
  IconEye,
  IconTrash,
  IconPaperclip,
  IconBell,
  IconUserCheck,
} from "@tabler/icons-react"

// Sample communication data
const messages = [
  {
    id: 1,
    from: "Sarah Johnson",
    fromType: "Parent",
    to: "Mathematics Teacher",
    subject: "Absence Request",
    content: "My child will be absent tomorrow due to medical appointment.",
    type: "Parent to Teacher",
    status: "Unread",
    date: "2024-01-15",
    priority: "Normal",
    avatar: "/avatars/student1.jpg",
  },
  {
    id: 2,
    from: "Principal Office",
    fromType: "Admin",
    to: "All Teachers",
    subject: "Staff Meeting Tomorrow",
    content: "Mandatory staff meeting at 3 PM in the conference room.",
    type: "Admin to Staff",
    status: "Read",
    date: "2024-01-14",
    priority: "High",
    avatar: "/avatars/admin.jpg",
  },
  {
    id: 3,
    from: "Michael Chen",
    fromType: "Student",
    to: "Mathematics Teacher",
    subject: "Assignment Question",
    content: "I need help with question 5 on the algebra assignment.",
    type: "Student to Teacher",
    status: "Read",
    date: "2024-01-13",
    priority: "Normal",
    avatar: "/avatars/student2.jpg",
  },
]

const announcements = [
  {
    id: 1,
    title: "Mathematics Test Next Week",
    content: "Grade 10-A Mathematics test on Algebra will be held next Monday. Please prepare well.",
    audience: "Grade 10-A Students",
    sentDate: "2024-01-15",
    readCount: 28,
    totalRecipients: 32,
  },
  {
    id: 2,
    title: "Homework Reminder",
    content: "Please complete the physics lab report by Friday.",
    audience: "Grade 11-B Students",
    sentDate: "2024-01-14",
    readCount: 24,
    totalRecipients: 28,
  },
]

export default function CommunicationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [messageTypeFilter, setMessageTypeFilter] = useState("all")
  const [selectedMessage, setSelectedMessage] = useState(null)

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = messageTypeFilter === "all" || message.type === messageTypeFilter

    return matchesSearch && matchesType
  })

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "bg-red-100 text-red-800",
      "Normal": "bg-blue-100 text-blue-800",
      "Low": "bg-gray-100 text-gray-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getMessageTypeIcon = (type: string) => {
    const icons = {
      "Parent to Teacher": <IconUsers className="w-4 h-4" />,
      "Admin to Staff": <IconBell className="w-4 h-4" />,
      "Student to Teacher": <IconUserCheck className="w-4 h-4" />,
    }
    return icons[type as keyof typeof icons] || <IconMessage className="w-4 h-4" />
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
            <p className="text-muted-foreground">
              Communicate with students, parents, and colleagues
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
                <DialogDescription>
                  Send messages to students, parents, or colleagues.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">My Students</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                      <SelectItem value="staff">Other Staff</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Message subject" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="urgent" />
                  <label htmlFor="urgent" className="text-sm">Mark as urgent</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>
                  <IconSend className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <IconMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Messages to review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <IconSend className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <IconUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.3%</div>
              <p className="text-xs text-muted-foreground">
                Average response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <IconMessage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Ongoing conversations
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inbox" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Inbox</CardTitle>
                <CardDescription>
                  Messages from students, parents, and colleagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Parent to Teacher">Parent to Teacher</SelectItem>
                        <SelectItem value="Admin to Staff">Admin to Staff</SelectItem>
                        <SelectItem value="Student to Teacher">Student to Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>
                          {message.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{message.from}</p>
                            <Badge variant="outline" className="text-xs">{message.fromType}</Badge>
                            {message.priority === "High" && (
                              <IconBell className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{message.date}</span>
                            {message.status === "Unread" && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getMessageTypeIcon(message.type)}
                          <Badge variant="outline" className="text-xs">{message.type}</Badge>
                        </div>
                        <p className="font-medium">{message.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconSend className="mr-2 h-4 w-4" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
                <CardDescription>
                  Messages you've sent to students, parents, and colleagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <IconMail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <span className="text-sm text-muted-foreground">{announcement.sentDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>To: {announcement.audience}</span>
                          <span>Read: {announcement.readCount}/{announcement.totalRecipients}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(announcement.readCount / announcement.totalRecipients) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Announcement</CardTitle>
                  <CardDescription>
                    Send important announcements to your students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Announcement title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Type your announcement..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Audience</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade10a">Grade 10-A</SelectItem>
                        <SelectItem value="grade11b">Grade 11-B</SelectItem>
                        <SelectItem value="all">All My Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <IconSend className="mr-2 h-4 w-4" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                  <CardDescription>
                    Your recently sent announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm mb-1">{announcement.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {announcement.content.substring(0, 60)}...
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{announcement.sentDate}</span>
                          <span>{announcement.readCount}/{announcement.totalRecipients} read</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <IconBell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Test Reminder</h3>
                      <p className="text-sm text-muted-foreground">Upcoming test notifications</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template for reminding students about upcoming tests and exams
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <IconUsers className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Homework Notice</h3>
                      <p className="text-sm text-muted-foreground">Assignment notifications</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template for homework and assignment announcements
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <IconPhone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Parent Contact</h3>
                      <p className="text-sm text-muted-foreground">Parent communication</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template for contacting parents about student performance
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}