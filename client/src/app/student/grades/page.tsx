import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconDownload,
  IconEye,
} from "@tabler/icons-react"

// Sample grade data
const currentSemesterGrades = [
  {
    subject: "Mathematics",
    grade: "A",
    percentage: 94,
    teacher: "Mr. Johnson",
    credits: 4,
    status: "Excellent",
  },
  {
    subject: "Physics",
    grade: "B+",
    percentage: 87,
    teacher: "Dr. Smith",
    credits: 3,
    status: "Good",
  },
  {
    subject: "English Literature",
    grade: "A-",
    percentage: 91,
    teacher: "Ms. Davis",
    credits: 3,
    status: "Excellent",
  },
  {
    subject: "Chemistry",
    grade: "B",
    percentage: 83,
    teacher: "Mrs. Wilson",
    credits: 3,
    status: "Good",
  },
  {
    subject: "History",
    grade: "A",
    percentage: 96,
    teacher: "Mr. Brown",
    credits: 2,
    status: "Excellent",
  },
]

const previousSemesterGrades = [
  {
    subject: "Mathematics",
    grade: "A-",
    percentage: 92,
    teacher: "Mr. Johnson",
    credits: 4,
    semester: "Fall 2023",
  },
  {
    subject: "Physics",
    grade: "B",
    percentage: 85,
    teacher: "Dr. Smith",
    credits: 3,
    semester: "Fall 2023",
  },
  {
    subject: "English Literature",
    grade: "B+",
    percentage: 88,
    teacher: "Ms. Davis",
    credits: 3,
    semester: "Fall 2023",
  },
]

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return "bg-green-100 text-green-800"
  if (grade.startsWith('B')) return "bg-blue-100 text-blue-800"
  if (grade.startsWith('C')) return "bg-yellow-100 text-yellow-800"
  if (grade.startsWith('D')) return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Excellent": return "text-green-600"
    case "Good": return "text-blue-600"
    case "Average": return "text-yellow-600"
    case "Needs Improvement": return "text-orange-600"
    default: return "text-gray-600"
  }
}

export default function GradesPage() {
  const currentGPA = 3.8
  const totalCredits = currentSemesterGrades.reduce((sum, grade) => sum + grade.credits, 0)
  const weightedGPA = currentSemesterGrades.reduce((sum, grade) => {
    const gradePoints = grade.grade === 'A' ? 4.0 : grade.grade === 'A-' ? 3.7 :
                       grade.grade === 'B+' ? 3.3 : grade.grade === 'B' ? 3.0 : 2.7
    return sum + (gradePoints * grade.credits)
  }, 0) / totalCredits

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
            <p className="text-muted-foreground">
              View your academic performance and progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button variant="outline">
              <IconEye className="mr-2 h-4 w-4" />
              Detailed View
            </Button>
          </div>
        </div>

        {/* GPA Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weightedGPA.toFixed(2)}</div>
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
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grade Trend</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Improving</div>
              <p className="text-xs text-muted-foreground">
                Consistent progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grades Tabs */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="previous">Previous Semesters</TabsTrigger>
            <TabsTrigger value="trends">Grade Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Semester Grades</CardTitle>
                <CardDescription>
                  Your performance in ongoing courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentSemesterGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <IconChartBar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{grade.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {grade.teacher} • {grade.credits} credits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getGradeColor(grade.grade)}>
                            {grade.grade} ({grade.percentage}%)
                          </Badge>
                          <span className={`text-sm font-medium ${getStatusColor(grade.status)}`}>
                            {grade.status}
                          </span>
                        </div>
                        <Progress value={grade.percentage} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="previous" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Previous Semester Grades</CardTitle>
                <CardDescription>
                  Historical academic performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previousSemesterGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <IconChartBar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{grade.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {grade.teacher} • {grade.credits} credits • {grade.semester}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getGradeColor(grade.grade)}>
                          {grade.grade} ({grade.percentage}%)
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade Trends</CardTitle>
                <CardDescription>
                  Track your academic progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mathematics</span>
                      <span>Improving</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      A- → A (92% → 94%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Physics</span>
                      <span>Stable</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      B → B+ (85% → 87%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>English</span>
                      <span>Improving</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      B+ → A- (88% → 91%)
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