"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  IconCalculator,
  IconTrendingUp,
  IconUsers,
  IconBook,
  IconCircleCheck,
  IconAlertTriangle,
  IconDownload,
  IconEye,
  IconFileText,
  IconAward,
  IconTarget,
} from "@tabler/icons-react"

// Sample computed results data
const classResults = [
  {
    studentId: "001",
    studentName: "Sarah Johnson",
    avatar: "/avatars/student1.jpg",
    class: "Grade 10-A",
    subjects: {
      mathematics: { grade: "A", score: 92, weight: 25 },
      english: { grade: "A-", score: 88, weight: 20 },
      physics: { grade: "A", score: 90, weight: 15 },
      chemistry: { grade: "B+", score: 85, weight: 15 },
      biology: { grade: "A-", score: 87, weight: 15 },
      history: { grade: "B", score: 82, weight: 10 },
    },
    finalGrade: "A-",
    finalScore: 88.5,
    gpa: 3.7,
    rank: 1,
    status: "Completed",
  },
  {
    studentId: "002",
    studentName: "Michael Chen",
    avatar: "/avatars/student2.jpg",
    class: "Grade 10-A",
    subjects: {
      mathematics: { grade: "B+", score: 87, weight: 25 },
      english: { grade: "A", score: 91, weight: 20 },
      physics: { grade: "B", score: 83, weight: 15 },
      chemistry: { grade: "B+", score: 86, weight: 15 },
      biology: { grade: "A-", score: 89, weight: 15 },
      history: { grade: "B-", score: 78, weight: 10 },
    },
    finalGrade: "B+",
    finalScore: 85.2,
    gpa: 3.3,
    rank: 2,
    status: "Completed",
  },
  {
    studentId: "003",
    studentName: "Emily Rodriguez",
    avatar: "/avatars/student3.jpg",
    class: "Grade 10-A",
    subjects: {
      mathematics: { grade: "A", score: 94, weight: 25 },
      english: { grade: "A", score: 93, weight: 20 },
      physics: { grade: "A-", score: 89, weight: 15 },
      chemistry: { grade: "A", score: 92, weight: 15 },
      biology: { grade: "A", score: 91, weight: 15 },
      history: { grade: "A-", score: 88, weight: 10 },
    },
    finalGrade: "A",
    finalScore: 91.8,
    gpa: 4.0,
    rank: 3,
    status: "Completed",
  },
  {
    studentId: "004",
    studentName: "David Kim",
    avatar: "/avatars/student4.jpg",
    class: "Grade 10-A",
    subjects: {
      mathematics: { grade: "B", score: 84, weight: 25 },
      english: { grade: "B-", score: 79, weight: 20 },
      physics: { grade: "C+", score: 76, weight: 15 },
      chemistry: { grade: "B-", score: 81, weight: 15 },
      biology: { grade: "B", score: 83, weight: 15 },
      history: { grade: "C", score: 74, weight: 10 },
    },
    finalGrade: "B-",
    finalScore: 80.1,
    gpa: 2.7,
    rank: 4,
    status: "Completed",
  },
  {
    studentId: "005",
    studentName: "Lisa Wang",
    avatar: "/avatars/student5.jpg",
    class: "Grade 10-A",
    subjects: {
      mathematics: { grade: "A-", score: 89, weight: 25 },
      english: { grade: "B+", score: 86, weight: 20 },
      physics: { grade: "B+", score: 87, weight: 15 },
      chemistry: { grade: "A-", score: 88, weight: 15 },
      biology: { grade: "A", score: 92, weight: 15 },
      history: { grade: "B+", score: 85, weight: 10 },
    },
    finalGrade: "A-",
    finalScore: 87.9,
    gpa: 3.7,
    rank: 5,
    status: "Completed",
  },
]

const subjectWeights = {
  mathematics: 25,
  english: 20,
  physics: 15,
  chemistry: 15,
  biology: 15,
  history: 10,
}

export default function ResultsOverviewPage() {
  const [selectedClass, setSelectedClass] = useState("grade-10-a")
  const [selectedView, setSelectedView] = useState("summary")

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

  const calculateWeightedScore = (subjects: any) => {
    let totalWeightedScore = 0
    let totalWeight = 0

    Object.entries(subjects).forEach(([subject, data]: [string, any]) => {
      if (data.score && data.weight) {
        totalWeightedScore += (data.score * data.weight) / 100
        totalWeight += data.weight
      }
    })

    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0
  }

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return "A"
    if (score >= 85) return "A-"
    if (score >= 80) return "B+"
    if (score >= 75) return "B"
    if (score >= 70) return "B-"
    if (score >= 65) return "C+"
    if (score >= 60) return "C"
    if (score >= 55) return "C-"
    if (score >= 50) return "D"
    return "F"
  }

  const getGPAFromGrade = (grade: string) => {
    const gpaMap = {
      "A+": 4.0, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D": 1.0, "F": 0.0
    }
    return gpaMap[grade as keyof typeof gpaMap] || 0
  }

  const classStats = {
    totalStudents: classResults.length,
    averageScore: classResults.reduce((sum, student) => sum + student.finalScore, 0) / classResults.length,
    averageGPA: classResults.reduce((sum, student) => sum + student.gpa, 0) / classResults.length,
    gradeDistribution: {
      A: classResults.filter(s => s.finalGrade.startsWith('A')).length,
      B: classResults.filter(s => s.finalGrade.startsWith('B')).length,
      C: classResults.filter(s => s.finalGrade.startsWith('C')).length,
      D: classResults.filter(s => s.finalGrade.startsWith('D') || s.finalGrade === 'F').length,
    },
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Results Overview</h1>
            <p className="text-muted-foreground">
              View computed final results and class performance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade-10-a">Grade 10-A</SelectItem>
                <SelectItem value="grade-10-b">Grade 10-B</SelectItem>
                <SelectItem value="grade-11-a">Grade 11-A</SelectItem>
                <SelectItem value="grade-11-b">Grade 11-B</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Class Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Overall class performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
              <IconAward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats.averageGPA.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Grade point average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <IconTarget className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Emily R.</div>
              <p className="text-xs text-muted-foreground">
                {classResults[2]?.finalScore.toFixed(1)}% - Rank 1
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">
                All results computed
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary View</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Results Summary</CardTitle>
                <CardDescription>
                  Final computed results for Grade 10-A
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classResults.map((student, index) => (
                    <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
                          #{student.rank}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.studentName} />
                          <AvatarFallback>
                            {student.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-sm text-muted-foreground">ID: {student.studentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getGradeColor(student.finalGrade)} mb-2`}>
                          {student.finalGrade}
                        </Badge>
                        <p className="text-sm font-medium">{student.finalScore.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">GPA: {student.gpa.toFixed(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Subject Breakdown</CardTitle>
                <CardDescription>
                  Individual subject grades and weighted contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Mathematics (25%)</TableHead>
                      <TableHead>English (20%)</TableHead>
                      <TableHead>Physics (15%)</TableHead>
                      <TableHead>Chemistry (15%)</TableHead>
                      <TableHead>Biology (15%)</TableHead>
                      <TableHead>History (10%)</TableHead>
                      <TableHead>Final Grade</TableHead>
                      <TableHead>GPA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classResults.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatar} alt={student.studentName} />
                              <AvatarFallback className="text-xs">
                                {student.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.studentName}</p>
                              <p className="text-xs text-muted-foreground">{student.studentId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(student.subjects.mathematics.grade)}>
                            {student.subjects.mathematics.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.subjects.mathematics.score}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(student.subjects.english.grade)}>
                            {student.subjects.english.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.subjects.english.score}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(student.subjects.physics.grade)}>
                            {student.subjects.physics.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.subjects.physics.score}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(student.subjects.chemistry.grade)}>
                            {student.subjects.chemistry.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.subjects.chemistry.score}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(student.subjects.biology.grade)}>
                            {student.subjects.biology.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.subjects.biology.score}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(student.subjects.history.grade)}>
                            {student.subjects.history.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.subjects.history.score}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getGradeColor(student.finalGrade)} font-medium`}>
                            {student.finalGrade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.finalScore.toFixed(1)}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{student.gpa.toFixed(1)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>
                    Distribution of final grades in the class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>A Grades (90-100%)</span>
                      <span className="font-medium">{classStats.gradeDistribution.A} students</span>
                    </div>
                    <Progress value={(classStats.gradeDistribution.A / classStats.totalStudents) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>B Grades (80-89%)</span>
                      <span className="font-medium">{classStats.gradeDistribution.B} students</span>
                    </div>
                    <Progress value={(classStats.gradeDistribution.B / classStats.totalStudents) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>C Grades (70-79%)</span>
                      <span className="font-medium">{classStats.gradeDistribution.C} students</span>
                    </div>
                    <Progress value={(classStats.gradeDistribution.C / classStats.totalStudents) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>D/F Grades (Below 70%)</span>
                      <span className="font-medium">{classStats.gradeDistribution.D} students</span>
                    </div>
                    <Progress value={(classStats.gradeDistribution.D / classStats.totalStudents) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>
                    Average performance by subject
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(subjectWeights).map(([subject, weight]) => {
                    const avgScore = classResults.reduce((sum, student) =>
                      sum + student.subjects[subject as keyof typeof student.subjects].score, 0
                    ) / classResults.length

                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{subject}</span>
                          <span className="font-medium">{avgScore.toFixed(1)}% ({weight}%)</span>
                        </div>
                        <Progress value={avgScore} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconTrendingUp className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Strength</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mathematics shows the highest average performance at 89.2%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium">Improvement Area</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      History has the lowest average at 81.4% and may need additional support
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconAward className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Top Performer</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Emily Rodriguez leads with 91.8% and a perfect 4.0 GPA
                    </p>
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