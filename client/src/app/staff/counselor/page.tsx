"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconUser,
  IconCalendar,
  IconMessage,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconUsers,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react"

// Sample counselor data
const appointments = [
  {
    id: 1,
    studentName: "Sarah Johnson",
    studentId: "001",
    avatar: "/avatars/student1.jpg",
    date: "2024-01-15",
    time: "2:00 PM",
    type: "Academic Counseling",
    status: "scheduled",
    priority: "High",
    notes: "Struggling with mathematics, needs extra support",
  },
  {
    id: 2,
    studentName: "Michael Chen",
    studentId: "002",
    avatar: "/avatars/student2.jpg",
    date: "2024-01-16",
    time: "10:00 AM",
    type: "Personal Counseling",
    status: "completed",
    priority: "Medium",
    notes: "Family issues affecting concentration",
  },
  {
    id: 3,
    studentName: "Emily Rodriguez",
    studentId: "003",
    avatar: "/avatars/student3.jpg",
    date: "2024-01-17",
    time: "3:30 PM",
    type: "Career Guidance",
    status: "scheduled",
    priority: "Low",
    notes: "Exploring college options and career paths",
  },
]

const supportCases = [
  {
    id: 1,
    studentName: "David Kim",
    issue: "Bullying",
    severity: "High",
    status: "Active",
    lastUpdate: "2024-01-14",
    assignedTo: "School Counselor",
  },
  {
    id: 2,
    studentName: "Lisa Wang",
    issue: "Academic Stress",
    severity: "Medium",
    status: "In Progress",
    lastUpdate: "2024-01-13",
    assignedTo: "School Counselor",
  },
  {
    id: 3,
    studentName: "Alex Thompson",
    issue: "Family Issues",
    severity: "High",
    status: "Active",
    lastUpdate: "2024-01-12",
    assignedTo: "School Counselor",
  },
]

export default function CounselorPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    const matchesType = typeFilter === "all" || appointment.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination logic
  const totalItems = filteredAppointments.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    const variants = {
      "scheduled": "default",
      "completed": "secondary",
      "cancelled": "destructive",
    }
    const icons = {
      "scheduled": <IconClock className="w-3 h-3 mr-1" />,
      "completed": <IconCircleCheck className="w-3 h-3 mr-1" />,
      "cancelled": <IconAlertTriangle className="w-3 h-3 mr-1" />,
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="flex items-center">
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "Low": "bg-green-100 text-green-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-orange-100 text-orange-800",
      "Low": "bg-yellow-100 text-yellow-800",
    }
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCaseStatusColor = (status: string) => {
    const colors = {
      "Active": "bg-red-100 text-red-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Resolved": "bg-green-100 text-green-800",
      "Closed": "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const stats = {
    totalAppointments: appointments.length,
    todayAppointments: appointments.filter(a => a.date === "2024-01-15").length,
    activeCases: supportCases.filter(c => c.status === "Active").length,
    completedSessions: appointments.filter(a => a.status === "completed").length,
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Counseling Center</h1>
            <p className="text-muted-foreground">
              Manage student counseling appointments and support cases
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Create a new counseling appointment for a student.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student Name</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                      <SelectItem value="emily">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Appointment Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Counseling</SelectItem>
                      <SelectItem value="personal">Personal Counseling</SelectItem>
                      <SelectItem value="career">Career Guidance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Additional notes or concerns..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Schedule Appointment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.activeCases}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="cases">Support Cases</TabsTrigger>
            <TabsTrigger value="students">Student Support</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Counseling Appointments</CardTitle>
                <CardDescription>
                  Manage and track student counseling appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Academic Counseling">Academic</SelectItem>
                        <SelectItem value="Personal Counseling">Personal</SelectItem>
                        <SelectItem value="Career Guidance">Career</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                {/* Appointments Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={appointment.avatar} />
                                <AvatarFallback>
                                  {appointment.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{appointment.studentName}</p>
                                <p className="text-sm text-muted-foreground">ID: {appointment.studentId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{appointment.date}</p>
                              <p className="text-sm text-muted-foreground">{appointment.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{appointment.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(appointment.priority)}>
                              {appointment.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconMessage className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredAppointments.length > 0 && (
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Cases</CardTitle>
                <CardDescription>
                  Track and manage student support cases and interventions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportCases.map((case_) => (
                    <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-12 rounded ${getSeverityColor(case_.severity)}`} />
                        <div>
                          <p className="font-medium">{case_.studentName}</p>
                          <p className="text-sm text-muted-foreground">{case_.issue}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getSeverityColor(case_.severity)}>
                              {case_.severity} Priority
                            </Badge>
                            <Badge className={getCaseStatusColor(case_.status)}>
                              {case_.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last updated: {case_.lastUpdate}</p>
                        <p className="text-sm">Assigned to: {case_.assignedTo}</p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconMessage className="mr-2 h-4 w-4" />
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Students Needing Support</CardTitle>
                  <CardDescription>Students who may benefit from counseling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/student1.jpg" />
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">Grade 10-A</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Academic Stress
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/student2.jpg" />
                          <AvatarFallback>MC</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Michael Chen</p>
                          <p className="text-sm text-muted-foreground">Grade 10-A</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        Attendance Issues
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Programs</CardTitle>
                  <CardDescription>Available counseling programs and resources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Study Skills Workshop</h4>
                      <p className="text-sm text-muted-foreground">Improve academic performance</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Enroll Students
                      </Button>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Stress Management</h4>
                      <p className="text-sm text-muted-foreground">Coping strategies and techniques</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Counseling Statistics</CardTitle>
                  <CardDescription>Monthly counseling activity overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Academic Counseling</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Personal Counseling</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Career Guidance</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case Resolution Rate</CardTitle>
                  <CardDescription>Effectiveness of support interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-green-600 mb-2">87%</div>
                    <p className="text-sm text-muted-foreground">Cases resolved successfully</p>
                    <div className="mt-4">
                      <Progress value={87} className="h-3" />
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