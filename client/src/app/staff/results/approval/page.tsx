"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconCheck,
  IconX,
  IconEye,
  IconFileText,
  IconAlertTriangle,
  IconUsers,
  IconClock,
  IconCircleCheck,
  IconMessage,
  IconSend,
} from "@tabler/icons-react"

// Sample approval data
const pendingApprovals = [
  {
    id: 1,
    className: "Grade 10-A",
    classTeacher: "Mrs. Anderson",
    totalStudents: 30,
    computedResults: 30,
    submittedDate: "2024-12-18",
    submittedBy: "System",
    status: "Pending",
    comments: "",
    studentResults: [
      {
        id: 1,
        name: "Sarah Johnson",
        finalGrade: "A-",
        finalScore: 88.5,
        gpa: 3.7,
        subjects: {
          mathematics: { grade: "A", score: 92 },
          english: { grade: "A-", score: 88 },
          physics: { grade: "A", score: 90 },
          chemistry: { grade: "B+", score: 85 },
          biology: { grade: "A-", score: 87 },
          history: { grade: "B", score: 82 },
        }
      },
      {
        id: 2,
        name: "Michael Chen",
        finalGrade: "B+",
        finalScore: 85.2,
        gpa: 3.3,
        subjects: {
          mathematics: { grade: "B+", score: 87 },
          english: { grade: "A", score: 91 },
          physics: { grade: "B", score: 83 },
          chemistry: { grade: "B+", score: 86 },
          biology: { grade: "A-", score: 89 },
          history: { grade: "B-", score: 78 },
        }
      },
    ]
  },
  {
    id: 2,
    className: "Grade 10-B",
    classTeacher: "Mr. Thompson",
    totalStudents: 28,
    computedResults: 28,
    submittedDate: "2024-12-17",
    submittedBy: "System",
    status: "Pending",
    comments: "",
    studentResults: []
  },
  {
    id: 3,
    className: "Grade 11-A",
    classTeacher: "Dr. Rodriguez",
    totalStudents: 32,
    computedResults: 32,
    submittedDate: "2024-12-16",
    submittedBy: "System",
    status: "Approved",
    comments: "Results look good. All grades are consistent with student performance.",
    approvedDate: "2024-12-18",
    approvedBy: "Dr. Rodriguez"
  },
]

const approvalHistory = [
  {
    id: 1,
    className: "Grade 11-A",
    action: "Approved",
    date: "2024-12-18",
    approvedBy: "Dr. Rodriguez",
    comments: "Results look good. All grades are consistent with student performance."
  },
  {
    id: 2,
    className: "Grade 9-B",
    action: "Approved",
    date: "2024-12-15",
    approvedBy: "Mrs. Wilson",
    comments: "Approved with minor adjustments to borderline cases."
  },
  {
    id: 3,
    className: "Grade 10-A",
    action: "Rejected",
    date: "2024-12-14",
    approvedBy: "Mrs. Anderson",
    comments: "Mathematics grades need review. Some scores don't match assessment records."
  },
]

export default function ResultsApprovalPage() {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [selectedApprovals, setSelectedApprovals] = useState<number[]>([])
  const [approvalComments, setApprovalComments] = useState("")
  const [selectedClass, setSelectedClass] = useState<any>(null)

  const handleApproval = (classId: number, action: "approve" | "reject") => {
    // In a real app, this would make an API call
    console.log(`${action} class ${classId} with comments: ${approvalComments}`)
    setApprovalComments("")
  }

  const handleBulkApproval = (action: "approve" | "reject") => {
    selectedApprovals.forEach(classId => {
      handleApproval(classId, action)
    })
    setSelectedApprovals([])
  }

  const handleSelectApproval = (classId: number) => {
    setSelectedApprovals(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "Approved": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
      "Under Review": "bg-blue-100 text-blue-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
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

  const pendingCount = pendingApprovals.filter(p => p.status === "Pending").length
  const approvedCount = pendingApprovals.filter(p => p.status === "Approved").length

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Results Approval</h1>
            <p className="text-muted-foreground">
              Review and approve computed final results
            </p>
          </div>
          <div className="flex gap-2">
            {selectedApprovals.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleBulkApproval("approve")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <IconCheck className="mr-2 h-4 w-4" />
                  Approve Selected ({selectedApprovals.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkApproval("reject")}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <IconX className="mr-2 h-4 w-4" />
                  Reject Selected
                </Button>
              </div>
            )}
            <Button variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Classes awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                Classes approved this term
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingApprovals.reduce((sum, cls) => sum + cls.totalStudents, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Students in approval queue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3</div>
              <p className="text-xs text-muted-foreground">
                Days to approve results
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approval ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved Results</TabsTrigger>
            <TabsTrigger value="history">Approval History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classes Awaiting Approval</CardTitle>
                <CardDescription>
                  Review computed results and provide approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals
                    .filter(cls => cls.status === "Pending")
                    .map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedApprovals.includes(classItem.id)}
                          onCheckedChange={() => handleSelectApproval(classItem.id)}
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <IconUsers className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{classItem.className}</p>
                          <p className="text-sm text-muted-foreground">
                            Class Teacher: {classItem.classTeacher}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {classItem.computedResults}/{classItem.totalStudents} results computed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(classItem.status)} mb-2`}>
                          {classItem.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {classItem.submittedDate}
                        </p>
                        <div className="flex gap-1 mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <IconEye className="mr-2 h-4 w-4" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Review Results - {classItem.className}</DialogTitle>
                                <DialogDescription>
                                  Review computed final results before approval
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid gap-4">
                                  {classItem.studentResults.map((student) => (
                                    <Card key={student.id}>
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarFallback>
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">{student.name}</p>
                                              <p className="text-sm text-muted-foreground">
                                                GPA: {student.gpa} | Score: {student.finalScore}%
                                              </p>
                                            </div>
                                          </div>
                                          <Badge className={getGradeColor(student.finalGrade)}>
                                            {student.finalGrade}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                          {Object.entries(student.subjects).map(([subject, data]: [string, any]) => (
                                            <div key={subject} className="text-center p-2 bg-muted rounded">
                                              <p className="text-xs font-medium capitalize">{subject}</p>
                                              <Badge className={`${getGradeColor(data.grade)} text-xs mt-1`}>
                                                {data.grade} ({data.score}%)
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleApproval(classItem.id, "approve")}
                                    className="flex-1"
                                  >
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Approve Results
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleApproval(classItem.id, "reject")}
                                    className="flex-1"
                                  >
                                    <IconX className="mr-2 h-4 w-4" />
                                    Reject & Request Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(classItem.id, "approve")}
                          >
                            <IconCheck className="mr-2 h-4 w-4" />
                            Quick Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Results</CardTitle>
                <CardDescription>
                  Classes with approved final results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals
                    .filter(cls => cls.status === "Approved")
                    .map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <IconCircleCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{classItem.className}</p>
                          <p className="text-sm text-muted-foreground">
                            Class Teacher: {classItem.classTeacher}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Approved by: {classItem.approvedBy} on {classItem.approvedDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(classItem.status)} mb-2`}>
                          {classItem.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {classItem.comments}
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

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>
                  Complete history of result approvals and rejections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvalHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.className}</TableCell>
                        <TableCell>
                          <Badge className={
                            item.action === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }>
                            {item.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.approvedBy}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.comments}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}