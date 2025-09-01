"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconEdit,
  IconDeviceFloppy,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconDownload,
  IconUpload,
  IconCalculator,
  IconAlertTriangle,
  IconUsers,
  IconBook,
  IconTrendingUp,
  IconFileText,
} from "@tabler/icons-react"

// Sample student data for grade entry
const students = [
  {
    id: 1,
    name: "Sarah Johnson",
    studentId: "001",
    avatar: "/avatars/student1.jpg",
    class: "Grade 10-A",
    currentGrade: "",
    previousGrade: "A-",
    attendance: 95,
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Chen",
    studentId: "002",
    avatar: "/avatars/student2.jpg",
    class: "Grade 10-A",
    currentGrade: "",
    previousGrade: "B+",
    attendance: 88,
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    studentId: "003",
    avatar: "/avatars/student3.jpg",
    class: "Grade 10-A",
    currentGrade: "",
    previousGrade: "A",
    attendance: 92,
    status: "Active",
  },
  {
    id: 4,
    name: "David Kim",
    studentId: "004",
    avatar: "/avatars/student4.jpg",
    class: "Grade 10-A",
    currentGrade: "",
    previousGrade: "B",
    attendance: 85,
    status: "Active",
  },
  {
    id: 5,
    name: "Lisa Wang",
    studentId: "005",
    avatar: "/avatars/student5.jpg",
    class: "Grade 10-A",
    currentGrade: "",
    previousGrade: "A-",
    attendance: 90,
    status: "Active",
  },
]

const gradeOptions = [
  { value: "A+", label: "A+ (90-100%)" },
  { value: "A", label: "A (85-89%)" },
  { value: "A-", label: "A- (80-84%)" },
  { value: "B+", label: "B+ (75-79%)" },
  { value: "B", label: "B (70-74%)" },
  { value: "B-", label: "B- (65-69%)" },
  { value: "C+", label: "C+ (60-64%)" },
  { value: "C", label: "C (55-59%)" },
  { value: "C-", label: "C- (50-54%)" },
  { value: "D", label: "D (45-49%)" },
  { value: "F", label: "F (Below 45%)" },
]

export default function GradeEntryPage() {
  const [selectedSubject, setSelectedSubject] = useState("mathematics")
  const [selectedClass, setSelectedClass] = useState("grade-10-a")
  const [studentGrades, setStudentGrades] = useState(students)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkGrade, setBulkGrade] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const subjects = [
    { id: "mathematics", name: "Mathematics", teacher: "Mr. Johnson" },
    { id: "english", name: "English", teacher: "Mrs. Davis" },
    { id: "physics", name: "Physics", teacher: "Dr. Wilson" },
    { id: "chemistry", name: "Chemistry", teacher: "Ms. Brown" },
    { id: "biology", name: "Biology", teacher: "Mr. Green" },
  ]

  const classes = [
    { id: "grade-10-a", name: "Grade 10-A", students: 30 },
    { id: "grade-10-b", name: "Grade 10-B", students: 28 },
    { id: "grade-11-a", name: "Grade 11-A", students: 32 },
    { id: "grade-11-b", name: "Grade 11-B", students: 29 },
  ]

  const filteredStudents = studentGrades.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  )

  const handleGradeChange = (studentId: number, grade: string) => {
    setStudentGrades(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, currentGrade: grade }
          : student
      )
    )
  }

  const handleBulkGradeUpdate = () => {
    if (bulkGrade && selectedRows.length > 0) {
      setStudentGrades(prev =>
        prev.map(student =>
          selectedRows.includes(student.id)
            ? { ...student, currentGrade: bulkGrade }
            : student
        )
      )
      setSelectedRows([])
      setBulkGrade("")
    }
  }

  const handleRowSelect = (studentId: number) => {
    setSelectedRows(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === filteredStudents.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredStudents.map(student => student.id))
    }
  }

  const getGradeColor = (grade: string) => {
    if (!grade) return "bg-gray-100 text-gray-800"
    const colors = {
      "A+": "bg-green-100 text-green-800",
      "A": "bg-green-100 text-green-800",
      "A-": "bg-green-100 text-green-800",
      "B+": "bg-blue-100 text-blue-800",
      "B": "bg-blue-100 text-blue-800",
      "B-": "bg-blue-100 text-blue-800",
      "C+": "bg-yellow-100 text-yellow-800",
      "C": "bg-yellow-100 text-yellow-800",
      "C-": "bg-yellow-100 text-yellow-800",
      "D": "bg-orange-100 text-orange-800",
      "F": "bg-red-100 text-red-800",
    }
    return colors[grade as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const completedGrades = studentGrades.filter(student => student.currentGrade).length
  const completionPercentage = (completedGrades / studentGrades.length) * 100

  const currentSubject = subjects.find(s => s.id === selectedSubject)
  const currentClass = classes.find(c => c.id === selectedClass)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grade Entry</h1>
            <p className="text-muted-foreground">
              Enter and manage student grades for your subjects
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Template
            </Button>
            <Button variant="outline">
              <IconUpload className="mr-2 h-4 w-4" />
              Import Grades
            </Button>
            <Button>
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Subject and Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Entry Configuration</CardTitle>
            <CardDescription>
              Select the subject and class for grade entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} - {subject.teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name} ({classItem.students} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment Type</label>
                <Select defaultValue="final-exam">
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mid-term">Mid-term Exam</SelectItem>
                    <SelectItem value="final-exam">Final Exam</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Grade Entry Progress
            </CardTitle>
            <CardDescription>
              {currentSubject?.name} - {currentClass?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completedGrades}/{studentGrades.length}
                </div>
                <p className="text-sm text-muted-foreground">Grades Entered</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(completionPercentage)}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {studentGrades.length - completedGrades}
                </div>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedRows.length}
                </div>
                <p className="text-sm text-muted-foreground">Selected</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Grade Entry Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Grades</CardTitle>
            <CardDescription>
              Enter grades for each student. Use bulk actions for efficiency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex flex-1 gap-4">
                <div className="relative max-w-sm">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Select value={bulkGrade} onValueChange={setBulkGrade}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Bulk grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkGradeUpdate} size="sm">
                      Apply to {selectedRows.length} selected
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <IconCalculator className="mr-2 h-4 w-4" />
                  Calculate GPA
                </Button>
              </div>
            </div>

            {/* Grade Entry Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.length === filteredStudents.length && filteredStudents.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Previous Grade</TableHead>
                    <TableHead>Current Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(student.id)}
                          onCheckedChange={() => handleRowSelect(student.id)}
                          aria-label={`Select ${student.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.class}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.studentId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.attendance} className="w-16 h-2" />
                          <span className="text-sm">{student.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.previousGrade && (
                          <Badge className={getGradeColor(student.previousGrade)}>
                            {student.previousGrade}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={student.currentGrade}
                          onValueChange={(value) => handleGradeChange(student.id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
            </div>

            {/* Summary Footer */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium mb-2">Grade Distribution</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>A Grades:</span>
                      <span className="font-medium">
                        {studentGrades.filter(s => s.currentGrade?.startsWith('A')).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>B Grades:</span>
                      <span className="font-medium">
                        {studentGrades.filter(s => s.currentGrade?.startsWith('B')).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>C Grades:</span>
                      <span className="font-medium">
                        {studentGrades.filter(s => s.currentGrade?.startsWith('C')).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Class Average</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    B+
                  </div>
                  <p className="text-sm text-muted-foreground">Based on entered grades</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button size="sm">
                      <IconCheck className="mr-2 h-4 w-4" />
                      Submit Grades
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}