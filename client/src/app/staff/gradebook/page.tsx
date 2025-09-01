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
  IconBook,
  IconPlus,
  IconEdit,
  IconSearch,
  IconFilter,
  IconTrendingUp,
  IconTrendingDown,
  IconAward,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconFileText,
  IconClipboardList,
  IconEye,
} from "@tabler/icons-react"

// Sample gradebook data
const students = [
  {
    id: 1,
    name: "Sarah Johnson",
    rollNumber: "001",
    avatar: "/avatars/student1.jpg",
    grades: {
      "Mathematics": { midterm: 88, final: 92, assignments: 85, total: 90 },
      "Physics": { midterm: 85, final: 88, assignments: 82, total: 86 },
      "English": { midterm: 90, final: 94, assignments: 88, total: 91 },
    },
    overallGrade: "A",
    attendance: 95,
  },
  {
    id: 2,
    name: "Michael Chen",
    rollNumber: "002",
    avatar: "/avatars/student2.jpg",
    grades: {
      "Mathematics": { midterm: 82, final: 85, assignments: 80, total: 83 },
      "Physics": { midterm: 88, final: 90, assignments: 85, total: 88 },
      "English": { midterm: 85, final: 87, assignments: 83, total: 85 },
    },
    overallGrade: "B+",
    attendance: 88,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rollNumber: "003",
    avatar: "/avatars/student3.jpg",
    grades: {
      "Mathematics": { midterm: 95, final: 97, assignments: 92, total: 95 },
      "Physics": { midterm: 90, final: 93, assignments: 88, total: 91 },
      "English": { midterm: 92, final: 95, assignments: 90, total: 93 },
    },
    overallGrade: "A",
    attendance: 92,
  },
]

const assignments = [
  {
    id: 1,
    title: "Algebra Problem Set",
    subject: "Mathematics",
    dueDate: "2024-01-20",
    totalPoints: 100,
    submissions: 28,
    totalStudents: 32,
    status: "Graded",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    subject: "Physics",
    dueDate: "2024-01-18",
    totalPoints: 50,
    submissions: 25,
    totalStudents: 32,
    status: "Graded",
  },
  {
    id: 3,
    title: "Essay: Modern Literature",
    subject: "English",
    dueDate: "2024-01-25",
    totalPoints: 100,
    submissions: 15,
    totalStudents: 32,
    status: "Pending",
  },
]

export default function GradebookPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.rollNumber.includes(searchTerm)
    const matchesGrade = selectedGrade === "all" || student.overallGrade === selectedGrade

    return matchesSearch && matchesGrade
  })

  // Pagination logic
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  const getGradeColor = (grade: string) => {
    const colors = {
      "A": "bg-green-100 text-green-800",
      "A-": "bg-green-100 text-green-800",
      "B+": "bg-blue-100 text-blue-800",
      "B": "bg-blue-100 text-blue-800",
      "B-": "bg-yellow-100 text-yellow-800",
      "C+": "bg-yellow-100 text-yellow-800",
      "C": "bg-orange-100 text-orange-800",
      "D": "bg-red-100 text-red-800",
      "F": "bg-red-100 text-red-800",
    }
    return colors[grade as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getClassStats = () => {
    const total = students.length
    const avgMath = students.reduce((sum, s) => sum + s.grades.Mathematics.total, 0) / total
    const avgPhysics = students.reduce((sum, s) => sum + s.grades.Physics.total, 0) / total
    const avgEnglish = students.reduce((sum, s) => sum + s.grades.English.total, 0) / total
    const excellentCount = students.filter(s => s.overallGrade.startsWith("A")).length
    const passingCount = students.filter(s => !s.overallGrade.startsWith("F")).length

    return { avgMath, avgPhysics, avgEnglish, excellentCount, passingCount, total }
  }

  const stats = getClassStats()

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
            <p className="text-muted-foreground">
              Manage student grades, assignments, and assessments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Export Grades
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment for your students.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignment Title</label>
                    <Input placeholder="Enter assignment title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Points</label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Assignment description and instructions..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Publish Assignment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.5%</div>
              <p className="text-xs text-muted-foreground">
                Overall class performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excellent Students</CardTitle>
              <IconAward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.excellentCount}</div>
              <p className="text-xs text-muted-foreground">
                Grade A or A-
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95.2%</div>
              <p className="text-xs text-muted-foreground">
                Students passing
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades">Student Grades</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Gradebook</CardTitle>
                <CardDescription>
                  View and manage grades for all your students
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
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>

                {/* Grades Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Mathematics</TableHead>
                        <TableHead>Physics</TableHead>
                        <TableHead>English</TableHead>
                        <TableHead>Overall</TableHead>
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
                                <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium">{student.grades.Mathematics.total}%</p>
                              <p className="text-xs text-muted-foreground">
                                Mid: {student.grades.Mathematics.midterm}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium">{student.grades.Physics.total}%</p>
                              <p className="text-xs text-muted-foreground">
                                Mid: {student.grades.Physics.midterm}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium">{student.grades.English.total}%</p>
                              <p className="text-xs text-muted-foreground">
                                Mid: {student.grades.English.midterm}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(student.overallGrade)}>
                              {student.overallGrade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
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

          <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Overview</CardTitle>
                  <CardDescription>
                    Track assignment submissions and grading status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <Badge variant={assignment.status === "Graded" ? "default" : "secondary"}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {assignment.subject} • Due: {assignment.dueDate}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Submissions: {assignment.submissions}/{assignment.totalStudents}</span>
                        <span>{assignment.totalPoints} points</span>
                      </div>
                      <Progress
                        value={(assignment.submissions / assignment.totalStudents) * 100}
                        className="h-2 mt-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common grading and assignment tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create New Assignment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconEdit className="mr-2 h-4 w-4" />
                    Grade Pending Assignments
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Generate Report Cards
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconClipboardList className="mr-2 h-4 w-4" />
                    View Submission Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Center</CardTitle>
                <CardDescription>
                  Create and manage quizzes, tests, and assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-6 border rounded-lg">
                    <IconBook className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="font-semibold mb-1">Quizzes</h3>
                    <p className="text-sm text-muted-foreground">Create quick assessments</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <IconFileText className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <h3 className="font-semibold mb-1">Tests</h3>
                    <p className="text-sm text-muted-foreground">Full-length examinations</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <IconClipboardList className="mx-auto h-8 w-8 text-orange-500 mb-2" />
                    <h3 className="font-semibold mb-1">Projects</h3>
                    <p className="text-sm text-muted-foreground">Long-term assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Overall class performance breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>A Grade (90-100%)</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>B Grade (80-89%)</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>C Grade (70-79%)</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>D/F Grade (Below 70%)</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mathematics</span>
                    <span className="font-semibold">{stats.avgMath.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Physics</span>
                    <span className="font-semibold">{stats.avgPhysics.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">English</span>
                    <span className="font-semibold">{stats.avgEnglish.toFixed(1)}%</span>
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