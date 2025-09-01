"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconMail,
  IconPlus,
  IconSearch,
  IconSend,
  IconUsers,
  IconMessage,
  IconBell,
  IconPhone,
  IconEye,
  IconTrash,
  IconPaperclip,
  IconCalendar,
  IconUserCheck,
} from "@tabler/icons-react"

// Sample communication data
const announcements = [
  {
    id: 1,
    title: "School Holiday Notice",
    content: "School will be closed on Monday due to public holiday. Classes will resume on Tuesday.",
    type: "Holiday",
    priority: "High",
    audience: "All Students & Parents",
    sentBy: "Principal",
    sentDate: "2024-01-15",
    status: "Sent",
    recipients: 1247,
    readCount: 892,
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    content: "PTM scheduled for next Friday. Please ensure your ward attends with report card.",
    type: "Meeting",
    priority: "Medium",
    audience: "Grade 10 Parents",
    sentBy: "Class Teacher",
    sentDate: "2024-01-14",
    status: "Sent",
    recipients: 156,
    readCount: 134,
  },
  {
    id: 3,
    title: "Fee Payment Reminder",
    content: "Monthly fee payment is due by 25th of this month. Late fees will apply after due date.",
    type: "Payment",
    priority: "High",
    audience: "All Parents",
    sentBy: "Admin Office",
    sentDate: "2024-01-13",
    status: "Draft",
    recipients: 0,
    readCount: 0,
  },
]

const messages = [
  {
    id: 1,
    from: "Sarah Johnson",
    to: "Class Teacher",
    subject: "Absence Request",
    content: "My child will be absent tomorrow due to medical appointment.",
    type: "Parent to Teacher",
    status: "Unread",
    date: "2024-01-15",
    priority: "Normal",
  },
  {
    id: 2,
    from: "Mr. Davis",
    to: "Principal",
    subject: "Lab Equipment Request",
    content: "Requesting additional chemistry lab equipment for practical sessions.",
    type: "Staff to Admin",
    status: "Read",
    date: "2024-01-14",
    priority: "Normal",
  },
  {
    id: 3,
    from: "Admin Office",
    to: "All Teachers",
    subject: "Staff Meeting Tomorrow",
    content: "Mandatory staff meeting at 3 PM in the conference room.",
    type: "Admin to Staff",
    status: "Read",
    date: "2024-01-13",
    priority: "High",
  },
]

export default function CommunicationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || announcement.type === typeFilter

    return matchesSearch && matchesType
  })

  // Pagination logic
  const totalItems = filteredAnnouncements.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex)

  const getPriorityBadge = (priority: string) => {
    const colors = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "Normal": "bg-blue-100 text-blue-800",
    }
    return (
      <Badge className={colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {priority}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "Sent": "default",
      "Draft": "secondary",
      "Scheduled": "outline",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
            <p className="text-muted-foreground">
              Manage announcements, messages, and communication with parents and staff
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Send important announcements to students, parents, or staff.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your announcement here..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audience</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students & Parents</SelectItem>
                        <SelectItem value="parents">All Parents</SelectItem>
                        <SelectItem value="students">All Students</SelectItem>
                        <SelectItem value="staff">All Staff</SelectItem>
                        <SelectItem value="grade">Specific Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="schedule" />
                  <label htmlFor="schedule" className="text-sm">Schedule for later</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>
                  <IconSend className="mr-2 h-4 w-4" />
                  Send Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <IconMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <IconBell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Sent this month
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
                Average read rate
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

        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Announcement Management</CardTitle>
                <CardDescription>
                  Create and manage school announcements and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search announcements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Holiday">Holiday</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Payment">Payment</SelectItem>
                        <SelectItem value="Exam">Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconPaperclip className="mr-2 h-4 w-4" />
                    Bulk Actions
                  </Button>
                </div>

                {/* Announcements Table */}
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Announcement</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAnnouncements.map((announcement) => (
                        <TableRow key={announcement.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{announcement.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {announcement.content}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{announcement.type}</Badge>
                          </TableCell>
                          <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                          <TableCell className="text-sm">{announcement.audience}</TableCell>
                          <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{announcement.recipients}</p>
                              <p className="text-muted-foreground">
                                {announcement.readCount} read
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconSend className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredAnnouncements.length > 0 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Inbox</CardTitle>
                <CardDescription>
                  View and manage messages from parents, students, and staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/avatars/${message.from.toLowerCase().replace(' ', '')}.jpg`} />
                        <AvatarFallback>
                          {message.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{message.from}</p>
                            <Badge variant="outline" className="text-xs">{message.type}</Badge>
                            {message.priority === "High" && (
                              <IconBell className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{message.date}</span>
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

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <IconCalendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Holiday Notice</h3>
                      <p className="text-sm text-muted-foreground">School closure announcements</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pre-formatted template for holiday and closure notifications
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
                      <h3 className="font-semibold">PTM Reminder</h3>
                      <p className="text-sm text-muted-foreground">Parent-teacher meeting notifications</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template for parent-teacher meeting reminders and updates
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <IconMail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Fee Reminder</h3>
                      <p className="text-sm text-muted-foreground">Payment due notifications</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template for fee payment reminders and overdue notices
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Analytics</CardTitle>
                  <CardDescription>Message delivery and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Messages Sent</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Read Rate</span>
                    <span className="font-semibold">87.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Rate</span>
                    <span className="font-semibold">23.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Recipients</span>
                    <span className="font-semibold">1,156</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Message Types Distribution</CardTitle>
                  <CardDescription>Breakdown of communication types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Announcements</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Direct Messages</span>
                      <span>35%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Notifications</span>
                      <span>20%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
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