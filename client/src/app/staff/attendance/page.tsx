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
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconUserCheck,
  IconSearch,
  IconFilter,
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconTrendingUp,
} from "@tabler/icons-react"

// Sample attendance data
const attendanceData = [
  {
    id: 1,
    name: "Sarah Johnson",
    rollNumber: "001",
    avatar: "/avatars/student1.jpg",
    status: "present",
    timeMarked: "9:15 AM",
  },
  {
    id: 2,
    name: "Michael Chen",
    rollNumber: "002",
    avatar: "/avatars/student2.jpg",
    status: "present",
    timeMarked: "9:12 AM",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rollNumber: "003",
    avatar: "/avatars/student3.jpg",
    status: "absent",
    timeMarked: null,
  },
  {
    id: 4,
    name: "David Kim",
    rollNumber: "004",
    avatar: "/avatars/student4.jpg",
    status: "late",
    timeMarked: "9:45 AM",
  },
  {
    id: 5,
    name: "Lisa Wang",
    rollNumber: "005",
    avatar: "/avatars/student5.jpg",
    status: "present",
    timeMarked: "9:08 AM",
  },
]

const classes = [
  { id: 1, name: "Mathematics Grade 10-A", time: "9:00 AM", students: 32 },
  { id: 2, name: "Physics Grade 11-B", time: "10:30 AM", students: 28 },
  { id: 3, name: "Mathematics Grade 9-C", time: "2:00 PM", students: 35 },
]

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("math-10a")
  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [attendanceRecords, setAttendanceRecords] = useState(attendanceData)

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredRecords = attendanceRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.rollNumber.includes(searchTerm)
  )

  // Pagination logic
  const totalItems = filteredRecords.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  const updateAttendance = (studentId: number, status: string) => {
    setAttendanceRecords(records =>
      records.map(record =>
        record.id === studentId
          ? { ...record, status, timeMarked: status !== "absent" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null }
          : record
      )
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "present": "default",
      "absent": "destructive",
      "late": "secondary",
    }
    const icons = {
      "present": <IconCheck className="w-3 h-3 mr-1" />,
      "absent": <IconX className="w-3 h-3 mr-1" />,
      "late": <IconClock className="w-3 h-3 mr-1" />,
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="flex items-center">
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getAttendanceStats = () => {
    const present = attendanceRecords.filter(r => r.status === "present").length
    const absent = attendanceRecords.filter(r => r.status === "absent").length
    const late = attendanceRecords.filter(r => r.status === "late").length
    const total = attendanceRecords.length
    const rate = total > 0 ? ((present + late) / total * 100).toFixed(1) : "0"

    return { present, absent, late, total, rate }
  }

  const stats = getAttendanceStats()

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
            <p className="text-muted-foreground">
              Mark and manage student attendance for your classes
            </p>
          </div>
          <Button>
            <IconUserCheck className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <IconCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground">
                Students present today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <IconX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground">
                Students absent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <IconClock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <p className="text-xs text-muted-foreground">
                Students arrived late
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.rate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall attendance rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mark-attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view-records">View Records</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="mark-attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>
                  Select a class and mark attendance for students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((class_) => (
                          <SelectItem key={class_.id} value={`class-${class_.id}`}>
                            {class_.name} ({class_.time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter Options
                  </Button>
                </div>

                {/* Attendance Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time Marked</TableHead>
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
                              <span className="font-medium">{record.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{record.rollNumber}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.timeMarked || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant={record.status === "present" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateAttendance(record.id, "present")}
                              >
                                <IconCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={record.status === "absent" ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => updateAttendance(record.id, "absent")}
                              >
                                <IconX className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={record.status === "late" ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => updateAttendance(record.id, "late")}
                              >
                                <IconClock className="h-4 w-4" />
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

          <TabsContent value="view-records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  View historical attendance data for your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((class_) => (
                        <SelectItem key={class_.id} value={`class-${class_.id}`}>
                          {class_.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center py-8">
                  <IconCalendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Historical Records</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View past attendance records and generate reports
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Report</CardTitle>
                  <CardDescription>Attendance summary for this week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Monday</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tuesday</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wednesday</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Thursday</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Friday</span>
                    <span className="font-medium">91%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Attendance patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconTrendingUp className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm font-medium">Improving Trend</p>
                    <p className="text-sm text-muted-foreground">
                      Attendance rate has improved by 3.2% this month
                    </p>
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