import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  IconBook,
  IconPlus,
  IconEdit,
  IconEye,
  IconTarget,
  IconCircleCheck,
} from "@tabler/icons-react"

// Sample curriculum data
const curriculumData = [
  {
    id: 1,
    grade: "Grade 10",
    subject: "Mathematics",
    topic: "Algebra",
    subtopic: "Linear Equations",
    status: "Completed",
    completionRate: 100,
    studentsCompleted: 28,
    totalStudents: 32,
  },
  {
    id: 2,
    grade: "Grade 10",
    subject: "Mathematics",
    topic: "Geometry",
    subtopic: "Triangles",
    status: "In Progress",
    completionRate: 65,
    studentsCompleted: 21,
    totalStudents: 32,
  },
  {
    id: 3,
    grade: "Grade 11",
    subject: "Physics",
    topic: "Mechanics",
    subtopic: "Newton's Laws",
    status: "Not Started",
    completionRate: 0,
    studentsCompleted: 0,
    totalStudents: 28,
  },
]

const subjects = [
  { name: "Mathematics", topics: 12, completion: 85 },
  { name: "English", topics: 8, completion: 92 },
  { name: "Physics", topics: 10, completion: 78 },
  { name: "Chemistry", topics: 9, completion: 71 },
  { name: "Biology", topics: 11, completion: 88 },
]

const getStatusColor = (status: string) => {
  const colors = {
    "Completed": "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Not Started": "bg-gray-100 text-gray-800",
    "Review": "bg-yellow-100 text-yellow-800",
  }
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

export default function CurriculumComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Curriculum Management</h1>
            <p className="text-muted-foreground">
              Track curriculum progress and manage learning objectives
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconEye className="mr-2 h-4 w-4" />
              View Standards
            </Button>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Topic
            </Button>
          </div>
        </div>

        {/* Curriculum Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
              <IconBook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Topics</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                64% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Objectives</CardTitle>
              <IconTarget className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Defined objectives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <IconBook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                Student completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Progress Overview</CardTitle>
            <CardDescription>
              Completion status for each subject curriculum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-muted-foreground">
                      {subject.topics} topics • {subject.completion}% complete
                    </span>
                  </div>
                  <Progress value={subject.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Curriculum Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Topics</CardTitle>
            <CardDescription>
              Detailed view of curriculum progress by topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {curriculumData.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <IconBook className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{topic.topic}</h3>
                      <Badge variant="outline">{topic.grade}</Badge>
                      <Badge variant="outline">{topic.subject}</Badge>
                      <Badge className={`${getStatusColor(topic.status)} text-xs`}>
                        {topic.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {topic.subtopic}
                    </p>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground mb-3">
                      <span>{topic.studentsCompleted}/{topic.totalStudents} students completed</span>
                      <span>•</span>
                      <span>{topic.completionRate}% completion rate</span>
                    </div>

                    <Progress value={topic.completionRate} className="h-2" />
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
            <CardDescription>
              Key learning outcomes and assessment criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Knowledge Objectives</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <IconCircleCheck className="h-4 w-4 text-green-500" />
                    <span>Understand fundamental concepts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCircleCheck className="h-4 w-4 text-green-500" />
                    <span>Recall important facts and formulas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCircleCheck className="h-4 w-4 text-blue-500" />
                    <span>Apply knowledge to solve problems</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Skills Objectives</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <IconCircleCheck className="h-4 w-4 text-green-500" />
                    <span>Demonstrate analytical thinking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCircleCheck className="h-4 w-4 text-green-500" />
                    <span>Use appropriate tools and methods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCircleCheck className="h-4 w-4 text-blue-500" />
                    <span>Communicate solutions effectively</span>
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