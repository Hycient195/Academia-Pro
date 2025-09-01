import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  IconFileText,
  IconDownload,
  IconPrinter,
  IconTrendingUp,
  IconTrendingDown,
  IconAward,
  IconCalendar,
  IconChartBar,
  IconCircleCheck,
} from "@tabler/icons-react"

// Sample comprehensive results data
const studentInfo = {
  name: "John Doe",
  rollNumber: "STU001",
  grade: "12th Grade",
  section: "A",
  academicYear: "2023-2024",
}

const semesterResults = {
  current: {
    semester: "Spring 2024",
    gpa: 3.8,
    totalCredits: 24,
    earnedCredits: 24,
    status: "Pass",
    subjects: [
      { code: "MATH101", name: "Advanced Mathematics", credits: 4, grade: "A", points: 16, percentage: 94 },
      { code: "PHY201", name: "Physics", credits: 3, grade: "B+", points: 10.5, percentage: 87 },
      { code: "CHEM301", name: "Chemistry", credits: 3, grade: "A-", points: 11.1, percentage: 91 },
      { code: "ENG401", name: "English Literature", credits: 3, grade: "A", points: 12, percentage: 96 },
      { code: "HIST501", name: "World History", credits: 2, grade: "B+", points: 7, percentage: 88 },
      { code: "CS601", name: "Computer Science", credits: 3, grade: "A-", points: 11.1, percentage: 92 },
      { code: "BIO701", name: "Biology", credits: 3, grade: "B", points: 9, percentage: 83 },
      { code: "ART801", name: "Fine Arts", credits: 2, grade: "A", points: 8, percentage: 95 },
    ]
  },
  previous: [
    {
      semester: "Fall 2023",
      gpa: 3.6,
      totalCredits: 22,
      earnedCredits: 22,
      status: "Pass",
      subjects: [
        { code: "MATH101", name: "Advanced Mathematics", credits: 4, grade: "A-", points: 14.8, percentage: 92 },
        { code: "PHY201", name: "Physics", credits: 3, grade: "B", points: 9, percentage: 85 },
        { code: "CHEM301", name: "Chemistry", credits: 3, grade: "B+", points: 10.5, percentage: 88 },
        { code: "ENG401", name: "English Literature", credits: 3, grade: "A", points: 12, percentage: 94 },
        { code: "HIST501", name: "World History", credits: 2, grade: "B", points: 6, percentage: 80 },
        { code: "CS601", name: "Computer Science", credits: 3, grade: "A-", points: 11.1, percentage: 90 },
        { code: "ECO901", name: "Economics", credits: 2, grade: "B+", points: 7, percentage: 86 },
      ]
    },
    {
      semester: "Spring 2023",
      gpa: 3.4,
      totalCredits: 20,
      earnedCredits: 20,
      status: "Pass",
      subjects: [
        { code: "MATH101", name: "Advanced Mathematics", credits: 4, grade: "B+", points: 13.5, percentage: 88 },
        { code: "PHY201", name: "Physics", credits: 3, grade: "B-", points: 7.5, percentage: 78 },
        { code: "CHEM301", name: "Chemistry", credits: 3, grade: "B+", points: 10.5, percentage: 86 },
        { code: "ENG401", name: "English Literature", credits: 3, grade: "A-", points: 11.1, percentage: 91 },
        { code: "HIST501", name: "World History", credits: 2, grade: "B", points: 6, percentage: 82 },
        { code: "GEO1001", name: "Geography", credits: 2, grade: "B+", points: 7, percentage: 87 },
        { code: "PE1101", name: "Physical Education", credits: 1, grade: "A", points: 4, percentage: 98 },
      ]
    }
  ]
}

const overallStats = {
  cumulativeGPA: 3.6,
  totalCreditsEarned: 66,
  totalCreditsAttempted: 66,
  academicStanding: "Good Standing",
  honors: ["Dean's List - Spring 2024", "Honor Roll - Fall 2023"],
  rank: "Top 15%",
  attendance: 94.2,
}

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return "bg-green-100 text-green-800"
  if (grade === 'B+') return "bg-blue-100 text-blue-800"
  if (grade === 'B') return "bg-blue-100 text-blue-800"
  if (grade === 'B-') return "bg-yellow-100 text-yellow-800"
  if (grade === 'C') return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}

const getGradePoints = (grade: string) => {
  switch (grade) {
    case 'A': return 4.0
    case 'A-': return 3.7
    case 'B+': return 3.3
    case 'B': return 3.0
    case 'B-': return 2.7
    case 'C+': return 2.3
    case 'C': return 2.0
    case 'C-': return 1.7
    case 'D': return 1.0
    case 'F': return 0.0
    default: return 0.0
  }
}

export default function ResultsPage() {
  const currentSemester = semesterResults.current
  const allSemesters = [currentSemester, ...semesterResults.previous]

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
            <p className="text-muted-foreground">
              Complete result sheet and academic performance overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">
              <IconPrinter className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{studentInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{studentInfo.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grade & Section</p>
                <p className="font-medium">{studentInfo.grade} - {studentInfo.section}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-medium">{studentInfo.academicYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.cumulativeGPA}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" />
                  +0.2 from last semester
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
              <IconAward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalCreditsEarned}</div>
              <p className="text-xs text-muted-foreground">
                Out of {overallStats.totalCreditsAttempted} attempted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Standing</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallStats.academicStanding}</div>
              <p className="text-xs text-muted-foreground">
                Rank: {overallStats.rank}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.attendance}%</div>
              <p className="text-xs text-muted-foreground">
                Academic year average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="all">All Semesters</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{currentSemester.semester} Results</CardTitle>
                <CardDescription>
                  Detailed breakdown of your current semester performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Semester Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Semester GPA</p>
                      <p className="text-2xl font-bold">{currentSemester.gpa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Credits Earned</p>
                      <p className="text-2xl font-bold">{currentSemester.earnedCredits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credits</p>
                      <p className="text-2xl font-bold">{currentSemester.totalCredits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="bg-green-100 text-green-800">{currentSemester.status}</Badge>
                    </div>
                  </div>

                  {/* Subject-wise Results */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Code</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Grade Points</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSemester.subjects.map((subject, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{subject.code}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>{subject.credits}</TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(subject.grade)}>
                              {subject.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>{subject.points}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{subject.percentage}%</span>
                              <Progress value={subject.percentage} className="w-16 h-2" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Semester Results</CardTitle>
                <CardDescription>
                  Complete academic history across all semesters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {allSemesters.map((semester, semesterIndex) => (
                    <div key={semesterIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{semester.semester}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">GPA: {semester.gpa}</span>
                          <Badge className="bg-green-100 text-green-800">{semester.status}</Badge>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semester.subjects.map((subject, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{subject.name}</TableCell>
                              <TableCell>{subject.credits}</TableCell>
                              <TableCell>
                                <Badge className={getGradeColor(subject.grade)}>
                                  {subject.grade}
                                </Badge>
                              </TableCell>
                              <TableCell>{subject.points}</TableCell>
                              <TableCell>{subject.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcript" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Transcript</CardTitle>
                <CardDescription>
                  Official academic record and honors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Academic Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{overallStats.cumulativeGPA}</p>
                      <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{overallStats.totalCreditsEarned}</p>
                      <p className="text-sm text-muted-foreground">Credits Earned</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{allSemesters.length}</p>
                      <p className="text-sm text-muted-foreground">Semesters Completed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{overallStats.rank}</p>
                      <p className="text-sm text-muted-foreground">Class Rank</p>
                    </div>
                  </div>

                  {/* Honors and Awards */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Honors and Awards</h3>
                    <div className="space-y-2">
                      {overallStats.honors.map((honor, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <IconAward className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium">{honor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPA Trend */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">GPA Trend</h3>
                    <div className="space-y-3">
                      {allSemesters.map((semester, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{semester.semester}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm">GPA: {semester.gpa}</span>
                            <Progress value={semester.gpa * 25} className="w-24 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
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