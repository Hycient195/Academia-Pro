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
  IconBook,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconTrash,
  IconUsers,
  IconCalendar,
  IconClipboardList,
  IconTrendingUp,
  IconAward,
  IconClock,
} from "@tabler/icons-react"

// Sample subjects data
const subjects = [
  {
    id: 1,
    name: "Mathematics",
    code: "MATH101",
    grade: "Grade 10",
    teacher: "Mr. John Davis",
    teacherAvatar: "/avatars/teacher1.jpg",
    students: 45,
    schedule: "Mon, Wed, Fri - 9:00 AM",
    status: "Active",
    progress: 75,
  },
  {
    id: 2,
    name: "Physics",
    code: "PHY201",
    grade: "Grade 11",
    teacher: "Ms. Emily Chen",
    teacherAvatar: "/avatars/teacher2.jpg",
    students: 38,
    schedule: "Tue, Thu - 10:30 AM",
    status: "Active",
    progress: 68,
  },
  {
    id: 3,
    name: "Chemistry",
    code: "CHEM301",
    grade: "Grade 12",
    teacher: "Dr. Robert Wilson",
    teacherAvatar: "/avatars/teacher3.jpg",
    students: 32,
    schedule: "Mon, Wed - 2:00 PM",
    status: "Active",
    progress: 82,
  },
  {
    id: 4,
    name: "English Literature",
    code: "ENG401",
    grade: "Grade 10",
    teacher: "Ms. Sarah Johnson",
    teacherAvatar: "/avatars/teacher4.jpg",
    students: 42,
    schedule: "Tue, Thu, Sat - 11:00 AM",
    status: "Active",
    progress: 71,
  },
]

const grades = [
  { name: "Grade 9", subjects: 8, students: 156, avgScore: 78 },
  { name: "Grade 10", subjects: 9, students: 142, avgScore: 82 },
  { name: "Grade 11", subjects: 10, students: 128, avgScore: 79 },
  { name: "Grade 12", subjects: 11, students: 98, avgScore: 85 },
]

export default function AcademicPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = gradeFilter === "all" || subject.grade === gradeFilter
    const matchesSubject = subjectFilter === "all" || subject.name === subjectFilter

    return matchesSearch && matchesGrade && matchesSubject
  })

  // Pagination logic
  const totalItems = filteredSubjects.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedSubjects = filteredSubjects.slice(startIndex, endIndex)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
            <p className="text-muted-foreground">
              Manage subjects, curriculum, grades, and academic performance
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <IconBook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Across all grades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                Teaching staff
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <IconAward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">81%</div>
              <p className="text-xs text-muted-foreground">
                Overall average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Hours</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject Management</CardTitle>
                <CardDescription>
                  Manage subjects, teachers, and academic progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search subjects..."
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
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="English Literature">English Literature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>

                {/* Subjects Table */}
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-sm text-muted-foreground">{subject.code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subject.grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={subject.teacherAvatar} />
                                <AvatarFallback className="text-xs">
                                  {subject.teacher.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{subject.teacher}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconUsers className="h-4 w-4 text-muted-foreground" />
                              <span>{subject.students}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconCalendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{subject.schedule}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{subject.progress}%</span>
                              </div>
                              <Progress value={subject.progress} className="h-2 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
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
                {filteredSubjects.length > 0 && (
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

          <TabsContent value="grades" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {grades.map((grade) => (
                <Card key={grade.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{grade.name}</h3>
                      <Badge variant="secondary">{grade.students} students</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subjects:</span>
                        <span className="font-medium">{grade.subjects}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Score:</span>
                        <span className="font-medium text-green-600">{grade.avgScore}%</span>
                      </div>
                      <Progress value={grade.avgScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Overview</CardTitle>
                <CardDescription>
                  Manage curriculum standards and learning objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Core Subjects</h4>
                    <div className="space-y-2">
                      {["Mathematics", "Science", "English", "History"].map((subject) => (
                        <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{subject}</span>
                          <Badge variant="outline">Required</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Elective Subjects</h4>
                    <div className="space-y-2">
                      {["Art", "Music", "Computer Science", "Physical Education"].map((subject) => (
                        <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{subject}</span>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Timetable</CardTitle>
                <CardDescription>
                  View and manage class schedules across all grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Today's Schedule</h4>
                    <Select defaultValue="grade10">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade9">Grade 9</SelectItem>
                        <SelectItem value="grade10">Grade 10</SelectItem>
                        <SelectItem value="grade11">Grade 11</SelectItem>
                        <SelectItem value="grade12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {[
                      { time: "9:00 AM - 10:00 AM", subject: "Mathematics", teacher: "Mr. Davis", room: "Room 101" },
                      { time: "10:15 AM - 11:15 AM", subject: "Physics", teacher: "Ms. Chen", room: "Lab 201" },
                      { time: "11:30 AM - 12:30 PM", subject: "English", teacher: "Ms. Johnson", room: "Room 105" },
                      { time: "2:00 PM - 3:00 PM", subject: "Chemistry", teacher: "Dr. Wilson", room: "Lab 202" },
                    ].map((class_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 text-sm font-medium">{class_.time}</div>
                          <div>
                            <p className="font-medium">{class_.subject}</p>
                            <p className="text-sm text-muted-foreground">{class_.teacher} • {class_.room}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <IconClipboardList className="mr-2 h-4 w-4" />
                          View Details
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