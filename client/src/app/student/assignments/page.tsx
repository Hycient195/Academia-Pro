import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconClipboardList,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconUpload,
  IconEye,
  IconDownload,
} from "@tabler/icons-react"

// Sample assignments data
const pendingAssignments = [
  {
    id: 1,
    title: "Chemistry Lab Report",
    subject: "Chemistry",
    dueDate: "2024-01-20",
    status: "pending",
    priority: "high",
    description: "Complete the acid-base titration experiment report",
    progress: 75,
    submitted: false,
  },
  {
    id: 2,
    title: "History Research Paper",
    subject: "History",
    dueDate: "2024-01-25",
    status: "in_progress",
    priority: "medium",
    description: "Research paper on World War II causes and effects",
    progress: 40,
    submitted: false,
  },
  {
    id: 3,
    title: "Mathematics Problem Set",
    subject: "Mathematics",
    dueDate: "2024-01-18",
    status: "pending",
    priority: "high",
    description: "Complete exercises 15-30 from Chapter 7",
    progress: 0,
    submitted: false,
  },
]

const submittedAssignments = [
  {
    id: 4,
    title: "Physics Quiz",
    subject: "Physics",
    submittedDate: "2024-01-15",
    grade: "A",
    feedback: "Excellent work on the mechanics problems!",
    status: "graded",
  },
  {
    id: 5,
    title: "English Literature Essay",
    subject: "English",
    submittedDate: "2024-01-12",
    grade: "B+",
    feedback: "Good analysis, but could use more textual evidence.",
    status: "graded",
  },
  {
    id: 6,
    title: "Biology Worksheet",
    subject: "Biology",
    submittedDate: "2024-01-10",
    grade: "A-",
    feedback: "Well-structured answers with clear explanations.",
    status: "graded",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800"
    case "medium": return "bg-yellow-100 text-yellow-800"
    case "low": return "bg-green-100 text-green-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string, submitted: boolean) => {
  if (submitted) {
    return <IconCircleCheck className="h-5 w-5 text-green-600" />
  }
  if (status === "pending") {
    return <IconClock className="h-5 w-5 text-orange-600" />
  }
  return <IconAlertTriangle className="h-5 w-5 text-blue-600" />
}

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function AssignmentsPage() {
  const pendingCount = pendingAssignments.length
  const submittedCount = submittedAssignments.length
  const overdueCount = pendingAssignments.filter(a => getDaysUntilDue(a.dueDate) < 0).length

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">
              Manage your assignments, track progress, and view grades
            </p>
          </div>
          <Button>
            <IconUpload className="mr-2 h-4 w-4" />
            Submit Assignment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <IconClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Assignments to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedCount}</div>
              <p className="text-xs text-muted-foreground">
                Assignments submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Due this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedCount})</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Assignments</CardTitle>
                <CardDescription>
                  Assignments that need to be completed or submitted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAssignments.map((assignment) => {
                    const daysUntilDue = getDaysUntilDue(assignment.dueDate)
                    const isOverdue = daysUntilDue < 0
                    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                    return (
                      <div key={assignment.id} className={`p-4 border rounded-lg ${
                        isOverdue ? 'border-red-200 bg-red-50' :
                        isDueSoon ? 'border-orange-200 bg-orange-50' :
                        'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(assignment.status, assignment.submitted)}
                            <div>
                              <h3 className="font-medium">{assignment.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {assignment.subject} • Due {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(assignment.priority)}>
                              {assignment.priority}
                            </Badge>
                            {isOverdue && (
                              <Badge className="bg-red-100 text-red-800">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {assignment.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{assignment.progress}%</span>
                            </div>
                            <Progress value={assignment.progress} className="h-2" />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <IconEye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button size="sm">
                              <IconUpload className="mr-1 h-3 w-3" />
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submitted Assignments</CardTitle>
                <CardDescription>
                  Assignments you've submitted and their grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submittedAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <IconCircleCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {assignment.subject} • Submitted {new Date(assignment.submittedDate).toLocaleDateString()}
                          </p>
                          {assignment.feedback && (
                            <p className="text-sm text-muted-foreground mt-1">
                              "{assignment.feedback}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`mb-2 ${
                          assignment.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                          assignment.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.grade}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconDownload className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Calendar</CardTitle>
                <CardDescription>
                  View all assignments in calendar format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <IconClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Calendar view will be implemented here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}