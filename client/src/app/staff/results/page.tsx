"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconBook,
  IconCalculator,
  IconCircleCheck,
  IconClipboardList,
  IconFileText,
  IconTrendingUp,
  IconUsers,
  IconAlertTriangle,
  IconClock,
  IconEdit,
  IconEye,
} from "@tabler/icons-react"

// Sample results data
const currentTerm = {
  name: "First Term 2024/2025",
  startDate: "2024-09-01",
  endDate: "2024-12-20",
  status: "Active",
}

const gradeProgress = {
  totalSubjects: 8,
  completedSubjects: 6,
  pendingSubjects: 2,
  totalStudents: 120,
  gradedStudents: 95,
  pendingStudents: 25,
}

const subjectGrades = [
  {
    subject: "Mathematics",
    teacher: "Mr. Johnson",
    totalStudents: 120,
    gradedStudents: 120,
    status: "Completed",
    lastUpdated: "2024-12-15",
  },
  {
    subject: "English",
    teacher: "Mrs. Davis",
    totalStudents: 120,
    gradedStudents: 118,
    status: "In Progress",
    lastUpdated: "2024-12-14",
  },
  {
    subject: "Physics",
    teacher: "Dr. Wilson",
    totalStudents: 120,
    gradedStudents: 120,
    status: "Completed",
    lastUpdated: "2024-12-13",
  },
  {
    subject: "Chemistry",
    teacher: "Ms. Brown",
    totalStudents: 120,
    gradedStudents: 115,
    status: "In Progress",
    lastUpdated: "2024-12-12",
  },
  {
    subject: "Biology",
    teacher: "Mr. Green",
    totalStudents: 120,
    gradedStudents: 0,
    status: "Pending",
    lastUpdated: null,
  },
  {
    subject: "History",
    teacher: "Mrs. White",
    totalStudents: 120,
    gradedStudents: 0,
    status: "Pending",
    lastUpdated: null,
  },
]

const classResults = [
  {
    className: "Grade 10-A",
    classTeacher: "Mrs. Anderson",
    totalStudents: 30,
    completedResults: 28,
    status: "Almost Complete",
    averageGrade: "B+",
    topPerformer: "Sarah Johnson",
  },
  {
    className: "Grade 10-B",
    classTeacher: "Mr. Thompson",
    totalStudents: 30,
    completedResults: 25,
    status: "In Progress",
    averageGrade: "B",
    topPerformer: "Michael Chen",
  },
  {
    className: "Grade 11-A",
    classTeacher: "Dr. Rodriguez",
    totalStudents: 30,
    completedResults: 30,
    status: "Completed",
    averageGrade: "A-",
    topPerformer: "Emily Davis",
  },
]

export default function ResultsPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const getStatusColor = (status: string) => {
    const colors = {
      "Completed": "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Almost Complete": "bg-orange-100 text-orange-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getGradeColor = (grade: string) => {
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

  const completionPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
            <p className="text-muted-foreground">
              Manage student grades, compute final results, and generate reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Generate Reports
            </Button>
            <Button>
              <IconEdit className="mr-2 h-4 w-4" />
              Enter Grades
            </Button>
          </div>
        </div>

        {/* Current Term Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconBook className="h-5 w-5" />
                  {currentTerm.name}
                </CardTitle>
                <CardDescription>
                  {currentTerm.startDate} to {currentTerm.endDate}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(currentTerm.status)}>
                {currentTerm.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">
                    {completionPercentage(gradeProgress.completedSubjects, gradeProgress.totalSubjects)}%
                  </span>
                </div>
                <Progress
                  value={completionPercentage(gradeProgress.completedSubjects, gradeProgress.totalSubjects)}
                  className="h-2"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {gradeProgress.completedSubjects}/{gradeProgress.totalSubjects}
                </div>
                <p className="text-sm text-muted-foreground">Subjects Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {gradeProgress.gradedStudents}/{gradeProgress.totalStudents}
                </div>
                <p className="text-sm text-muted-foreground">Students Graded</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {gradeProgress.pendingStudents}
                </div>
                <p className="text-sm text-muted-foreground">Pending Grades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subject Grades</TabsTrigger>
            <TabsTrigger value="classes">Class Results</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconTrendingUp className="h-5 w-5" />
                    Grade Distribution
                  </CardTitle>
                  <CardDescription>Overall grade distribution for current term</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>A Grade (90-100%)</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>B Grade (80-89%)</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>C Grade (70-79%)</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
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
                  <CardTitle className="flex items-center gap-2">
                    <IconAlertTriangle className="h-5 w-5" />
                    Attention Required
                  </CardTitle>
                  <CardDescription>Items needing immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <IconAlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">2 Subjects Pending</p>
                      <p className="text-xs text-muted-foreground">Biology and History grades not entered</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <IconClock className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">25 Students Pending</p>
                      <p className="text-xs text-muted-foreground">Final results not computed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <IconCircleCheck className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Grade Approval Pending</p>
                      <p className="text-xs text-muted-foreground">3 classes awaiting approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject Grade Entry Status</CardTitle>
                <CardDescription>Track grade submission progress by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectGrades.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <IconBook className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{subject.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            Teacher: {subject.teacher}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {subject.gradedStudents}/{subject.totalStudents} students graded
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(subject.status)} mb-2`}>
                          {subject.status}
                        </Badge>
                        <p className="text-sm">
                          {completionPercentage(subject.gradedStudents, subject.totalStudents)}% Complete
                        </p>
                        <Progress
                          value={completionPercentage(subject.gradedStudents, subject.totalStudents)}
                          className="w-20 h-2 mt-1"
                        />
                        {subject.lastUpdated && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated: {subject.lastUpdated}
                          </p>
                        )}
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

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Results Overview</CardTitle>
                <CardDescription>Final computed results for each class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classResults.map((classResult, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <IconUsers className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{classResult.className}</p>
                          <p className="text-sm text-muted-foreground">
                            Class Teacher: {classResult.classTeacher}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {classResult.completedResults}/{classResult.totalStudents} results computed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(classResult.status)} mb-2`}>
                          {classResult.status}
                        </Badge>
                        <Badge className={`${getGradeColor(classResult.averageGrade)} mb-2 ml-2`}>
                          Avg: {classResult.averageGrade}
                        </Badge>
                        <p className="text-sm">
                          {completionPercentage(classResult.completedResults, classResult.totalStudents)}% Complete
                        </p>
                        <Progress
                          value={completionPercentage(classResult.completedResults, classResult.totalStudents)}
                          className="w-20 h-2 mt-1"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Top: {classResult.topPerformer}
                        </p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconFileText className="mr-2 h-4 w-4" />
                            Generate Report
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
                  <CardTitle>Available Reports</CardTitle>
                  <CardDescription>Generate various result reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Individual Student Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Class Performance Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Subject-wise Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconFileText className="mr-2 h-4 w-4" />
                    Grade Distribution Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconTrendingUp className="mr-2 h-4 w-4" />
                    Performance Trends
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common result management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <IconCalculator className="mr-2 h-4 w-4" />
                    Compute Final Results
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconCircleCheck className="mr-2 h-4 w-4" />
                    Approve Results
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconClipboardList className="mr-2 h-4 w-4" />
                    Bulk Grade Entry
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconUsers className="mr-2 h-4 w-4" />
                    Student Rankings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <IconAlertTriangle className="mr-2 h-4 w-4" />
                    Missing Grades Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}