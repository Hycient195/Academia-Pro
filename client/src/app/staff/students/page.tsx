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
import { Progress } from "@/components/ui/progress"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconUsers,
  IconSearch,
  IconFilter,
  IconEye,
  IconMessage,
  IconTrendingUp,
  IconTrendingDown,
  IconAward,
  IconAlertTriangle,
  IconBook,
  IconCalendar,
  IconMail,
} from "@tabler/icons-react"

// Sample student data
const students = [
  {
    id: 1,
    name: "Sarah Johnson",
    rollNumber: "001",
    grade: "Grade 10-A",
    avatar: "/avatars/student1.jpg",
    email: "sarah.johnson@school.com",
    phone: "+1 234 567 8901",
    attendance: 95,
    averageGrade: 88,
    subjects: ["Mathematics", "Physics", "English"],
    performance: "Excellent",
    lastActivity: "2 hours ago",
    parentContact: "john.johnson@email.com",
  },
  {
    id: 2,
    name: "Michael Chen",
    rollNumber: "002",
    grade: "Grade 10-A",
    avatar: "/avatars/student2.jpg",
    email: "michael.chen@school.com",
    phone: "+1 234 567 8902",
    attendance: 88,
    averageGrade: 85,
    subjects: ["Mathematics", "Physics", "English"],
    performance: "Good",
    lastActivity: "1 day ago",
    parentContact: "lisa.chen@email.com",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rollNumber: "003",
    grade: "Grade 10-A",
    avatar: "/avatars/student3.jpg",
    email: "emily.rodriguez@school.com",
    phone: "+1 234 567 8903",
    attendance: 92,
    averageGrade: 90,
    subjects: ["Mathematics", "Physics", "English"],
    performance: "Excellent",
    lastActivity: "3 hours ago",
    parentContact: "carlos.rodriguez@email.com",
  },
  {
    id: 4,
    name: "David Kim",
    rollNumber: "004",
    grade: "Grade 10-A",
    avatar: "/avatars/student4.jpg",
    email: "david.kim@school.com",
    phone: "+1 234 567 8904",
    attendance: 85,
    averageGrade: 82,
    subjects: ["Mathematics", "Physics", "English"],
    performance: "Good",
    lastActivity: "5 hours ago",
    parentContact: "sung.kim@email.com",
  },
  {
    id: 5,
    name: "Lisa Wang",
    rollNumber: "005",
    grade: "Grade 10-A",
    avatar: "/avatars/student5.jpg",
    email: "lisa.wang@school.com",
    phone: "+1 234 567 8905",
    attendance: 78,
    averageGrade: 75,
    subjects: ["Mathematics", "Physics", "English"],
    performance: "Needs Improvement",
    lastActivity: "2 days ago",
    parentContact: "ming.wang@email.com",
  },
]

const getPerformanceColor = (performance: string) => {
  const colors = {
    "Excellent": "bg-green-100 text-green-800",
    "Good": "bg-blue-100 text-blue-800",
    "Average": "bg-yellow-100 text-yellow-800",
    "Needs Improvement": "bg-red-100 text-red-800",
  }
  return colors[performance as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

const getAttendanceColor = (attendance: number) => {
  if (attendance >= 90) return "text-green-600"
  if (attendance >= 80) return "text-yellow-600"
  return "text-red-600"
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.rollNumber.includes(searchTerm) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
    const matchesPerformance = performanceFilter === "all" || student.performance === performanceFilter

    return matchesSearch && matchesGrade && matchesPerformance
  })

  // Pagination logic
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  const getClassStats = () => {
    const total = students.length
    const excellent = students.filter(s => s.performance === "Excellent").length
    const good = students.filter(s => s.performance === "Good").length
    const needsImprovement = students.filter(s => s.performance === "Needs Improvement").length
    const avgAttendance = students.reduce((sum, s) => sum + s.attendance, 0) / total
    const avgGrade = students.reduce((sum, s) => sum + s.averageGrade, 0) / total

    return { total, excellent, good, needsImprovement, avgAttendance, avgGrade }
  }

  const stats = getClassStats()

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
            <p className="text-muted-foreground">
              Manage and monitor your students' progress and performance
            </p>
          </div>
          <Button>
            <IconUsers className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                In your classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <IconAward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgGrade.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Class average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.excellent}</div>
              <p className="text-xs text-muted-foreground">
                Excellent performance
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Student List</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>Student performance breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Excellent</span>
                    </div>
                    <span className="font-medium">{stats.excellent} students</span>
                  </div>
                  <Progress value={(stats.excellent / stats.total) * 100} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Good</span>
                    </div>
                    <span className="font-medium">{stats.good} students</span>
                  </div>
                  <Progress value={(stats.good / stats.total) * 100} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">Needs Improvement</span>
                    </div>
                    <span className="font-medium">{stats.needsImprovement} students</span>
                  </div>
                  <Progress value={(stats.needsImprovement / stats.total) * 100} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest student activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.lastActivity}</p>
                      </div>
                      <Badge variant="outline" className={getPerformanceColor(student.performance)}>
                        {student.performance}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Directory</CardTitle>
                <CardDescription>
                  Complete list of students in your classes
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
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                        <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                        <SelectItem value="Grade 11-A">Grade 11-A</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Performance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Performance</SelectItem>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Average">Average</SelectItem>
                        <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                {/* Students Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Average Grade</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback>
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                              {student.attendance}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{student.averageGrade}%</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPerformanceColor(student.performance)}>
                              {student.performance}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconMessage className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconMail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredStudents.length > 0 && (
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

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Average grades by subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mathematics</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Physics</span>
                      <span className="font-medium">84%</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>English</span>
                      <span className="font-medium">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Students Needing Attention</CardTitle>
                  <CardDescription>Students requiring extra support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {students.filter(s => s.performance === "Needs Improvement").map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Grade: {student.averageGrade}% • Attendance: {student.attendance}%
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <IconMessage className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parent Communication</CardTitle>
                <CardDescription>
                  Send messages to parents and track communication history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button className="h-20 flex-col gap-2">
                      <IconMail className="h-6 w-6" />
                      <span>Send Bulk Message</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <IconMessage className="h-6 w-6" />
                      <span>Individual Messages</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Communications</h4>
                    {students.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}'s Parent</p>
                            <p className="text-sm text-muted-foreground">Last contacted: 2 days ago</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}