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
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconAlertTriangle,
  IconPill,
  IconHeartbeat,
  IconStethoscope,
  IconAmbulance,
  IconClock,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react"

// Sample medical data
const healthRecords = [
  {
    id: 1,
    studentName: "Sarah Johnson",
    studentId: "001",
    avatar: "/avatars/student1.jpg",
    grade: "Grade 10-A",
    lastVisit: "2024-01-10",
    condition: "Allergic rhinitis",
    medications: ["Loratadine", "Nasal spray"],
    allergies: ["Pollen", "Dust mites"],
    emergencyContact: "John Johnson (Father)",
    bloodType: "A+",
    status: "Stable",
  },
  {
    id: 2,
    studentName: "Michael Chen",
    studentId: "002",
    avatar: "/avatars/student2.jpg",
    grade: "Grade 10-A",
    lastVisit: "2024-01-08",
    condition: "Asthma",
    medications: ["Albuterol inhaler"],
    allergies: ["Peanuts"],
    emergencyContact: "Lisa Chen (Mother)",
    bloodType: "O+",
    status: "Under monitoring",
  },
  {
    id: 3,
    studentName: "Emily Rodriguez",
    studentId: "003",
    avatar: "/avatars/student3.jpg",
    grade: "Grade 10-A",
    lastVisit: "2024-01-12",
    condition: "Healthy",
    medications: [],
    allergies: [],
    emergencyContact: "Carlos Rodriguez (Father)",
    bloodType: "B+",
    status: "Healthy",
  },
]

const medicalAppointments = [
  {
    id: 1,
    studentName: "David Kim",
    studentId: "004",
    avatar: "/avatars/student4.jpg",
    date: "2024-01-15",
    time: "9:00 AM",
    type: "Check-up",
    reason: "Annual physical examination",
    status: "scheduled",
    priority: "Routine",
  },
  {
    id: 2,
    studentName: "Lisa Wang",
    studentId: "005",
    avatar: "/avatars/student5.jpg",
    date: "2024-01-16",
    time: "2:00 PM",
    type: "Follow-up",
    reason: "Asthma medication review",
    status: "scheduled",
    priority: "Medium",
  },
]

const medicalInventory = [
  {
    id: 1,
    name: "Band-Aids",
    category: "First Aid",
    quantity: 150,
    minStock: 50,
    expiryDate: "2025-06-15",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Ibuprofen",
    category: "Medication",
    quantity: 25,
    minStock: 20,
    expiryDate: "2024-08-20",
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Albuterol Inhalers",
    category: "Emergency",
    quantity: 8,
    minStock: 5,
    expiryDate: "2024-12-31",
    status: "In Stock",
  },
]

export default function NursePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredRecords = healthRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredRecords.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    const variants = {
      "Healthy": "default",
      "Stable": "secondary",
      "Under monitoring": "outline",
      "Critical": "destructive",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    )
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      "Routine": "bg-blue-100 text-blue-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "High": "bg-orange-100 text-orange-800",
      "Emergency": "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getInventoryStatusColor = (status: string) => {
    const colors = {
      "In Stock": "bg-green-100 text-green-800",
      "Low Stock": "bg-yellow-100 text-yellow-800",
      "Out of Stock": "bg-red-100 text-red-800",
      "Expired": "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getAppointmentStatusBadge = (status: string) => {
    const variants = {
      "scheduled": "default",
      "completed": "secondary",
      "cancelled": "destructive",
      "no-show": "outline",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const stats = {
    totalStudents: healthRecords.length,
    healthyStudents: healthRecords.filter(r => r.status === "Healthy").length,
    studentsUnderMonitoring: healthRecords.filter(r => r.status === "Under monitoring").length,
    todayAppointments: medicalAppointments.filter(a => a.date === "2024-01-15").length,
    lowStockItems: medicalInventory.filter(i => i.status === "Low Stock").length,
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical Center</h1>
            <p className="text-muted-foreground">
              Manage student health records, appointments, and medical inventory
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
                <DialogTitle>Schedule Medical Appointment</DialogTitle>
                <DialogDescription>
                  Create a new medical appointment for a student.
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
                      <SelectItem value="checkup">Check-up</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
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
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea
                    placeholder="Reason for appointment..."
                    className="min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
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
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Health records on file
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy Students</CardTitle>
              <IconHeartbeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.healthyStudents}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.healthyStudents / stats.totalStudents) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="health-records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="health-records">Health Records</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="inventory">Medical Inventory</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="health-records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Health Records</CardTitle>
                <CardDescription>
                  Comprehensive health information for all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Healthy">Healthy</SelectItem>
                        <SelectItem value="Stable">Stable</SelectItem>
                        <SelectItem value="Under monitoring">Under monitoring</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Export Records
                  </Button>
                </div>

                {/* Health Records Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Medications</TableHead>
                        <TableHead>Allergies</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={record.avatar} />
                                <AvatarFallback>
                                  {record.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{record.studentName}</p>
                                <p className="text-sm text-muted-foreground">ID: {record.studentId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{record.condition}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {record.medications.slice(0, 2).map((med, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {med}
                                </Badge>
                              ))}
                              {record.medications.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{record.medications.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {record.allergies.slice(0, 2).map((allergy, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                              {record.allergies.length > 2 && (
                                <Badge variant="destructive" className="text-xs">
                                  +{record.allergies.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconFileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredRecords.length > 0 && (
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

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Appointments</CardTitle>
                <CardDescription>
                  Schedule and manage medical appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={appointment.avatar} />
                          <AvatarFallback>
                            {appointment.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} at {appointment.time}
                          </p>
                          <p className="text-sm">{appointment.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getPriorityColor(appointment.priority)} mb-2`}>
                          {appointment.priority}
                        </Badge>
                        <p className="text-sm">{getAppointmentStatusBadge(appointment.status)}</p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconEdit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Inventory</CardTitle>
                <CardDescription>
                  Track medical supplies, medications, and equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <IconPill className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Category: {item.category} • Expires: {item.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getInventoryStatusColor(item.status)} mb-2`}>
                          {item.status}
                        </Badge>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">Min: {item.minStock}</p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            <IconEdit className="mr-2 h-4 w-4" />
                            Update
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconPlus className="mr-2 h-4 w-4" />
                            Restock
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Health Statistics</CardTitle>
                  <CardDescription>Monthly health and wellness overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Healthy Students</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Students with Conditions</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Under Monitoring</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Health Issues</CardTitle>
                  <CardDescription>Most frequent health concerns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allergies</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asthma</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vision Problems</span>
                    <span className="font-semibold">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dental Issues</span>
                    <span className="font-semibold">10%</span>
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