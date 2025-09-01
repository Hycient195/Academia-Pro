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
  IconUsers,
  IconSearch,
  IconPlus,
  IconFileText,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCircleCheck,
  IconCurrencyDollar,
  IconCalendar,
  IconSpeakerphone,
  IconClock,
  IconClipboardList,
  IconFilter,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react"

// Sample administrative data
const feeRecords = [
  {
    id: 1,
    studentName: "Sarah Johnson",
    studentId: "STU001",
    grade: "Grade 10-A",
    feeType: "Tuition Fee",
    amount: 2500,
    dueDate: "2024-01-15",
    status: "paid",
    paymentDate: "2024-01-10",
    avatar: "/avatars/student1.jpg",
  },
  {
    id: 2,
    studentName: "Michael Chen",
    studentId: "STU002",
    grade: "Grade 10-A",
    feeType: "Tuition Fee",
    amount: 2500,
    dueDate: "2024-01-15",
    status: "pending",
    paymentDate: null,
    avatar: "/avatars/student2.jpg",
  },
  {
    id: 3,
    studentName: "Emily Rodriguez",
    studentId: "STU003",
    grade: "Grade 10-A",
    feeType: "Library Fee",
    amount: 100,
    dueDate: "2024-01-20",
    status: "overdue",
    paymentDate: null,
    avatar: "/avatars/student3.jpg",
  },
]

const announcements = [
  {
    id: 1,
    title: "School Holiday Notice",
    content: "School will remain closed on Monday due to public holiday.",
    audience: "All Students & Parents",
    priority: "High",
    createdDate: "2024-01-14",
    status: "Published",
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    content: "PTM scheduled for next Saturday from 9 AM to 12 PM.",
    audience: "Grade 10 Parents",
    priority: "Normal",
    createdDate: "2024-01-13",
    status: "Published",
  },
  {
    id: 3,
    title: "Sports Day Registration",
    content: "Registration for annual sports day is now open.",
    audience: "All Students",
    priority: "Normal",
    createdDate: "2024-01-12",
    status: "Draft",
  },
]

const studentRecords = [
  {
    id: 1,
    name: "Sarah Johnson",
    rollNumber: "001",
    grade: "Grade 10-A",
    admissionDate: "2023-06-15",
    status: "Active",
    contact: "+1 234 567 8901",
    parentContact: "+1 234 567 8902",
    avatar: "/avatars/student1.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    rollNumber: "002",
    grade: "Grade 10-A",
    admissionDate: "2023-06-15",
    status: "Active",
    contact: "+1 234 567 8903",
    parentContact: "+1 234 567 8904",
    avatar: "/avatars/student2.jpg",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rollNumber: "003",
    grade: "Grade 10-A",
    admissionDate: "2023-06-15",
    status: "Active",
    contact: "+1 234 567 8905",
    parentContact: "+1 234 567 8906",
    avatar: "/avatars/student3.jpg",
  },
]

const getFeeStatusBadge = (status: string) => {
  const variants = {
    "paid": "default",
    "pending": "secondary",
    "overdue": "destructive",
  }
  const icons = {
    "paid": <IconCircleCheck className="w-3 h-3 mr-1" />,
    "pending": <IconClock className="w-3 h-3 mr-1" />,
    "overdue": <IconAlertTriangle className="w-3 h-3 mr-1" />,
  }
  return (
    <Badge variant={variants[status as keyof typeof variants] as any} className="flex items-center">
      {icons[status as keyof typeof icons]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getPriorityBadge = (priority: string) => {
  const variants = {
    "High": "destructive",
    "Normal": "default",
    "Low": "secondary",
  }
  return (
    <Badge variant={variants[priority as keyof typeof variants] as any}>
      {priority}
    </Badge>
  )
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [feeFilter, setFeeFilter] = useState("all")
  const [recordFilter, setRecordFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredFeeRecords = feeRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.studentId.includes(searchTerm)
    const matchesFilter = feeFilter === "all" || record.status === feeFilter

    return matchesSearch && matchesFilter
  })

  const filteredRecords = studentRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.rollNumber.includes(searchTerm)
    const matchesFilter = recordFilter === "all" || record.status === recordFilter

    return matchesSearch && matchesFilter
  })

  // Pagination logic
  const totalFeeItems = filteredFeeRecords.length
  const totalRecordItems = filteredRecords.length
  const totalFeePages = Math.ceil(totalFeeItems / pageSize)
  const totalRecordPages = Math.ceil(totalRecordItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedFeeRecords = filteredFeeRecords.slice(startIndex, endIndex)
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  const getFeeStats = () => {
    const totalFees = feeRecords.reduce((sum, record) => sum + record.amount, 0)
    const paidFees = feeRecords.filter(r => r.status === "paid").reduce((sum, record) => sum + record.amount, 0)
    const pendingFees = feeRecords.filter(r => r.status === "pending").reduce((sum, record) => sum + record.amount, 0)
    const overdueFees = feeRecords.filter(r => r.status === "overdue").reduce((sum, record) => sum + record.amount, 0)

    return { totalFees, paidFees, pendingFees, overdueFees }
  }

  const feeStats = getFeeStats()

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrative Dashboard</h1>
            <p className="text-muted-foreground">
              Manage student records, fees, and school administration
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline">
              <IconUpload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${feeStats.paidFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Collected this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${feeStats.pendingFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <IconSpeakerphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.filter(a => a.status === "Published").length}</div>
              <p className="text-xs text-muted-foreground">
                Active announcements
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records">Student Records</TabsTrigger>
            <TabsTrigger value="fees">Fee Management</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Records Management</CardTitle>
                <CardDescription>
                  View and manage student enrollment records and information
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
                    <Select value={recordFilter} onValueChange={setRecordFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                    <Button variant="outline">
                      <IconFilter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>

                {/* Student Records Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Admission Date</TableHead>
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
                                  {record.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{record.name}</p>
                                <p className="text-sm text-muted-foreground">{record.parentContact}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{record.rollNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.status === "Active" ? "default" : "secondary"}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.contact}</TableCell>
                          <TableCell>{new Date(record.admissionDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                Edit
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
                        totalPages={totalRecordPages}
                        totalItems={totalRecordItems}
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

          <TabsContent value="fees" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Collection Overview</CardTitle>
                  <CardDescription>
                    Monthly fee collection statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Paid Fees</span>
                      <span className="font-medium">${feeStats.paidFees.toLocaleString()}</span>
                    </div>
                    <Progress value={(feeStats.paidFees / feeStats.totalFees) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pending Fees</span>
                      <span className="font-medium">${feeStats.pendingFees.toLocaleString()}</span>
                    </div>
                    <Progress value={(feeStats.pendingFees / feeStats.totalFees) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overdue Fees</span>
                      <span className="font-medium text-red-600">${feeStats.overdueFees.toLocaleString()}</span>
                    </div>
                    <Progress value={(feeStats.overdueFees / feeStats.totalFees) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common fee management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Generate Fee Receipt
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconAlertTriangle className="mr-2 h-4 w-4" />
                    Send Payment Reminders
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconTrendingUp className="mr-2 h-4 w-4" />
                    View Fee Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fee Records</CardTitle>
                <CardDescription>
                  Detailed fee payment records and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search fee records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={feeFilter} onValueChange={setFeeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconDownload className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {paginatedFeeRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={record.avatar} />
                          <AvatarFallback>
                            {record.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.studentId} • {record.grade} • {record.feeType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${record.amount}</p>
                        <p className="text-sm text-muted-foreground">Due: {record.dueDate}</p>
                        {getFeeStatusBadge(record.status)}
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">School Announcements</h2>
                <p className="text-muted-foreground">
                  Create and manage school-wide announcements
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
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>
                      Create a new announcement for students, parents, or staff.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input placeholder="Announcement title" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="Announcement content..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Audience</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students & Parents</SelectItem>
                          <SelectItem value="students">All Students</SelectItem>
                          <SelectItem value="parents">All Parents</SelectItem>
                          <SelectItem value="grade10">Grade 10 Parents</SelectItem>
                          <SelectItem value="staff">All Staff</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button>Publish</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{announcement.title}</h3>
                          {getPriorityBadge(announcement.priority)}
                          <Badge variant={announcement.status === "Published" ? "default" : "secondary"}>
                            {announcement.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Audience: {announcement.audience}</span>
                          <span>Created: {announcement.createdDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Report</CardTitle>
                  <CardDescription>
                    Student enrollment statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconUsers className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-muted-foreground">Total Students</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee Collection Report</CardTitle>
                  <CardDescription>
                    Monthly fee collection summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconCurrencyDollar className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <p className="text-2xl font-bold">$245,678</p>
                    <p className="text-muted-foreground">Collected This Month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Report</CardTitle>
                  <CardDescription>
                    Overall attendance statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconCircleCheck className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                    <p className="text-2xl font-bold">94.2%</p>
                    <p className="text-muted-foreground">Average Attendance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate Custom Reports</CardTitle>
                <CardDescription>
                  Create detailed reports for various administrative needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <IconFileText className="h-6 w-6" />
                    <span>Student Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <IconCurrencyDollar className="h-6 w-6" />
                    <span>Fee Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <IconCalendar className="h-6 w-6" />
                    <span>Attendance Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <IconClipboardList className="h-6 w-6" />
                    <span>Custom Report</span>
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