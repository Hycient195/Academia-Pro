"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  IconFileText,
  IconDownload,
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconChartPie,
  IconTable,
  IconCalendar,
  IconUsers,
  IconBook,
  IconAward,
  IconTarget,
  IconFilter,
} from "@tabler/icons-react"

// Sample analytics data
const termAnalytics = {
  currentTerm: "First Term 2024/2025",
  totalStudents: 450,
  averageScore: 78.5,
  gradeDistribution: {
    A: 85, // count of students
    B: 145,
    C: 120,
    D: 65,
    F: 35,
  },
  subjectPerformance: [
    { subject: "Mathematics", average: 82.3, trend: "up", change: 3.2 },
    { subject: "English", average: 79.1, trend: "up", change: 1.8 },
    { subject: "Physics", average: 76.8, trend: "down", change: -2.1 },
    { subject: "Chemistry", average: 75.2, trend: "up", change: 0.9 },
    { subject: "Biology", average: 81.5, trend: "up", change: 4.3 },
    { subject: "History", average: 73.9, trend: "down", change: -1.5 },
  ],
  classPerformance: [
    { class: "Grade 10-A", average: 84.2, students: 30, topPerformer: "Sarah Johnson" },
    { class: "Grade 10-B", average: 81.8, students: 28, topPerformer: "Michael Chen" },
    { class: "Grade 11-A", average: 79.5, students: 32, topPerformer: "Emily Rodriguez" },
    { class: "Grade 11-B", average: 76.3, students: 29, topPerformer: "David Kim" },
    { class: "Grade 12-A", average: 77.9, students: 31, topPerformer: "Lisa Wang" },
  ],
}

const reportTemplates = [
  {
    id: "individual",
    name: "Individual Student Report",
    description: "Detailed report for each student with all subject grades",
    icon: IconUsers,
    fields: ["Student Info", "Subject Grades", "Final Grade", "GPA", "Comments"],
  },
  {
    id: "class-summary",
    name: "Class Summary Report",
    description: "Overview of class performance with statistics",
    icon: IconBook,
    fields: ["Class Average", "Grade Distribution", "Subject Performance", "Rankings"],
  },
  {
    id: "subject-analysis",
    name: "Subject Analysis Report",
    description: "Detailed analysis of performance in each subject",
    icon: IconChartBar,
    fields: ["Subject Averages", "Grade Distribution", "Improvement Areas", "Recommendations"],
  },
  {
    id: "progress-report",
    name: "Progress Report",
    description: "Student progress comparison across terms",
    icon: IconTrendingUp,
    fields: ["Term Comparison", "Improvement Tracking", "Areas of Concern"],
  },
  {
    id: "honor-roll",
    name: "Honor Roll Report",
    description: "List of high-achieving students",
    icon: IconAward,
    fields: ["Top Performers", "Grade Thresholds", "Achievements"],
  },
]

export default function ResultsReportsPage() {
  const [selectedReport, setSelectedReport] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [dateRange, setDateRange] = useState("current-term")

  const generateReport = (reportType: string) => {
    // In a real app, this would trigger report generation
    console.log(`Generating ${reportType} report for class: ${selectedClass}, subject: ${selectedSubject}`)
  }

  const exportData = (format: "pdf" | "excel" | "csv") => {
    // In a real app, this would export the data
    console.log(`Exporting data in ${format} format`)
  }

  const getGradeDistributionPercentage = (count: number) => {
    return ((count / termAnalytics.totalStudents) * 100).toFixed(1)
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up"
      ? <IconTrendingUp className="h-4 w-4 text-green-600" />
      : <IconTrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = (change: number) => {
    return change > 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Results Reports</h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports and analyze academic performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button>
              <IconFileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Customize your report parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Student</SelectItem>
                    <SelectItem value="class-summary">Class Summary</SelectItem>
                    <SelectItem value="subject-analysis">Subject Analysis</SelectItem>
                    <SelectItem value="progress">Progress Report</SelectItem>
                    <SelectItem value="honor-roll">Honor Roll</SelectItem>
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
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="grade-10-a">Grade 10-A</SelectItem>
                    <SelectItem value="grade-10-b">Grade 10-B</SelectItem>
                    <SelectItem value="grade-11-a">Grade 11-A</SelectItem>
                    <SelectItem value="grade-11-b">Grade 11-B</SelectItem>
                    <SelectItem value="grade-12-a">Grade 12-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-term">Current Term</SelectItem>
                    <SelectItem value="previous-term">Previous Term</SelectItem>
                    <SelectItem value="academic-year">Academic Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Report Templates</TabsTrigger>
            <TabsTrigger value="export">Export Options</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                  <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{termAnalytics.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.3% from last term
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A Grade Students</CardTitle>
                  <IconAward className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{termAnalytics.gradeDistribution.A}</div>
                  <p className="text-xs text-muted-foreground">
                    {getGradeDistributionPercentage(termAnalytics.gradeDistribution.A)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
                  <IconTarget className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {termAnalytics.gradeDistribution.F + termAnalytics.gradeDistribution.D}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Need intervention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Performing Class</CardTitle>
                  <IconBook className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Grade 10-A</div>
                  <p className="text-xs text-muted-foreground">
                    84.2% average
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of final grades across all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>A Grades (90-100%)</span>
                      <span className="font-medium">
                        {termAnalytics.gradeDistribution.A} students ({getGradeDistributionPercentage(termAnalytics.gradeDistribution.A)}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(getGradeDistributionPercentage(termAnalytics.gradeDistribution.A))} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>B Grades (80-89%)</span>
                      <span className="font-medium">
                        {termAnalytics.gradeDistribution.B} students ({getGradeDistributionPercentage(termAnalytics.gradeDistribution.B)}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(getGradeDistributionPercentage(termAnalytics.gradeDistribution.B))} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>C Grades (70-79%)</span>
                      <span className="font-medium">
                        {termAnalytics.gradeDistribution.C} students ({getGradeDistributionPercentage(termAnalytics.gradeDistribution.C)}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(getGradeDistributionPercentage(termAnalytics.gradeDistribution.C))} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>D Grades (60-69%)</span>
                      <span className="font-medium">
                        {termAnalytics.gradeDistribution.D} students ({getGradeDistributionPercentage(termAnalytics.gradeDistribution.D)}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(getGradeDistributionPercentage(termAnalytics.gradeDistribution.D))} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>F Grades (Below 60%)</span>
                      <span className="font-medium">
                        {termAnalytics.gradeDistribution.F} students ({getGradeDistributionPercentage(termAnalytics.gradeDistribution.F)}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(getGradeDistributionPercentage(termAnalytics.gradeDistribution.F))} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>
                    Average scores and trends by subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {termAnalytics.subjectPerformance.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-20 text-sm font-medium">{subject.subject}</div>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(subject.trend)}
                            <span className={`text-sm ${getTrendColor(subject.change)}`}>
                              {subject.change > 0 ? '+' : ''}{subject.change}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{subject.average}%</div>
                          <Progress value={subject.average} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Rankings</CardTitle>
                  <CardDescription>
                    Performance comparison across classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {termAnalytics.classPerformance.map((classData, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{classData.class}</p>
                            <p className="text-sm text-muted-foreground">
                              {classData.students} students
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{classData.average}%</div>
                          <p className="text-sm text-muted-foreground">
                            Top: {classData.topPerformer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {template.fields.map((field, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={() => generateReport(template.id)}
                        >
                          Generate Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Download your data in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => exportData("pdf")}
                  >
                    <IconFileText className="h-8 w-8" />
                    <span>PDF Report</span>
                    <span className="text-xs text-muted-foreground">Formatted document</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => exportData("excel")}
                  >
                    <IconTable className="h-8 w-8" />
                    <span>Excel Sheet</span>
                    <span className="text-xs text-muted-foreground">Spreadsheet format</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => exportData("csv")}
                  >
                    <IconDownload className="h-8 w-8" />
                    <span>CSV File</span>
                    <span className="text-xs text-muted-foreground">Raw data export</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Set up automatic report generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Progress Report</p>
                      <p className="text-sm text-muted-foreground">
                        Generated every Friday at 5:00 PM
                      </p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Class Summary</p>
                      <p className="text-sm text-muted-foreground">
                        Generated on the last day of each month
                      </p>
                    </div>
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <IconCalendar className="mr-2 h-4 w-4" />
                    Schedule New Report
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