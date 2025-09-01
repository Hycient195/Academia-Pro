import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconUsers,
  IconBook,
  IconCalendar,
  IconTrendingUp,
  IconMessage,
  IconEye,
  IconAward,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react"

// Sample children data with detailed information
const children = [
  {
    id: 1,
    name: "Emma Johnson",
    grade: "10th Grade",
    section: "A",
    rollNumber: "STU001",
    avatar: "/avatars/student1.jpg",
    dateOfBirth: "2007-03-15",
    gender: "Female",
    contact: "+1 (555) 123-4567",
    address: "123 Main Street, Springfield, IL 62701",

    // Academic Info
    gpa: 3.8,
    attendance: 95,
    rank: "Top 5%",
    academicStatus: "Excellent",

    // Current Semester
    currentSemester: "Spring 2024",
    enrolledSubjects: 8,
    completedCredits: 24,
    totalCredits: 24,

    // Performance by subject
    subjects: [
      { name: "Mathematics", grade: "A", attendance: 98, teacher: "Mr. Johnson" },
      { name: "Physics", grade: "B+", attendance: 95, teacher: "Dr. Smith" },
      { name: "Chemistry", grade: "A-", attendance: 97, teacher: "Mrs. Wilson" },
      { name: "English Literature", grade: "A", attendance: 100, teacher: "Ms. Davis" },
      { name: "World History", grade: "B+", attendance: 92, teacher: "Mr. Brown" },
      { name: "Computer Science", grade: "A-", attendance: 96, teacher: "Mr. Tech" },
      { name: "Biology", grade: "B", attendance: 93, teacher: "Ms. Green" },
      { name: "Fine Arts", grade: "A", attendance: 100, teacher: "Ms. Creative" },
    ],

    // Recent activities
    recentActivities: [
      { type: "grade", message: "Received A- in Mathematics final exam", date: "2024-01-15" },
      { type: "assignment", message: "Submitted Science project", date: "2024-01-12" },
      { type: "attendance", message: "Perfect attendance this month", date: "2024-01-10" },
    ],

    // Upcoming events
    upcomingEvents: [
      { title: "Parent-Teacher Meeting", date: "2024-01-20", time: "2:00 PM" },
      { title: "Basketball Tournament", date: "2024-01-28", time: "3:00 PM" },
    ],
  },
  {
    id: 2,
    name: "Michael Johnson",
    grade: "8th Grade",
    section: "B",
    rollNumber: "STU002",
    avatar: "/avatars/student2.jpg",
    dateOfBirth: "2009-07-22",
    gender: "Male",
    contact: "+1 (555) 234-5678",
    address: "123 Main Street, Springfield, IL 62701",

    gpa: 3.2,
    attendance: 88,
    rank: "Top 25%",
    academicStatus: "Good",

    currentSemester: "Spring 2024",
    enrolledSubjects: 7,
    completedCredits: 21,
    totalCredits: 21,

    subjects: [
      { name: "Mathematics", grade: "B+", attendance: 90, teacher: "Mr. Johnson" },
      { name: "Physics", grade: "B-", attendance: 85, teacher: "Dr. Smith" },
      { name: "Chemistry", grade: "B+", attendance: 88, teacher: "Mrs. Wilson" },
      { name: "English Literature", grade: "A-", attendance: 95, teacher: "Ms. Davis" },
      { name: "World History", grade: "B", attendance: 82, teacher: "Mr. Brown" },
      { name: "Geography", grade: "B+", attendance: 90, teacher: "Ms. Map" },
      { name: "Physical Education", grade: "A", attendance: 100, teacher: "Coach Miller" },
    ],

    recentActivities: [
      { type: "grade", message: "Received B+ in Chemistry lab", date: "2024-01-14" },
      { type: "assignment", message: "History essay submitted", date: "2024-01-11" },
      { type: "attendance", message: "Late arrival for Physics class", date: "2024-01-09" },
    ],

    upcomingEvents: [
      { title: "Science Fair", date: "2024-01-25", time: "9:00 AM" },
      { title: "School Play Auditions", date: "2024-01-30", time: "4:00 PM" },
    ],
  },
]

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return "bg-green-100 text-green-800"
  if (grade === 'B+') return "bg-blue-100 text-blue-800"
  if (grade === 'B') return "bg-blue-100 text-blue-800"
  if (grade === 'B-') return "bg-yellow-100 text-yellow-800"
  if (grade === 'C') return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}

const getStatusBadge = (status: string) => {
  const variants = {
    "Excellent": "bg-green-100 text-green-800",
    "Good": "bg-blue-100 text-blue-800",
    "Average": "bg-yellow-100 text-yellow-800",
    "Needs Attention": "bg-red-100 text-red-800",
  }
  return variants[status as keyof typeof variants] || variants.Good
}

export default function ChildrenPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
            <p className="text-muted-foreground">
              Detailed academic overview and progress tracking for each child
            </p>
          </div>
          <Button>
            <IconUsers className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </div>

        {/* Children Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.avatar} alt={child.name} />
                    <AvatarFallback className="text-lg">
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {child.grade} - Section {child.section} • Roll: {child.rollNumber}
                    </p>
                    <Badge className={getStatusBadge(child.academicStatus)}>
                      {child.academicStatus}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{child.gpa}</p>
                    <p className="text-xs text-muted-foreground">GPA</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{child.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <IconEye className="mr-1 h-3 w-3" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <IconMessage className="mr-1 h-3 w-3" />
                    Contact Teacher
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <IconBook className="mr-1 h-3 w-3" />
                    Academic Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Child Information */}
        <Tabs defaultValue={children[0]?.id.toString()} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            {children.map((child) => (
              <TabsTrigger key={child.id} value={child.id.toString()}>
                {child.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {children.map((child) => (
            <TabsContent key={child.id} value={child.id.toString()} className="space-y-4">
              {/* Academic Overview */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                    <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{child.gpa}</div>
                    <p className="text-xs text-muted-foreground">
                      {child.rank} in class
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{child.attendance}%</div>
                    <p className="text-xs text-muted-foreground">
                      This semester
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Credits</CardTitle>
                    <IconAward className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{child.completedCredits}/{child.totalCredits}</div>
                    <p className="text-xs text-muted-foreground">
                      Completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                    <IconBook className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{child.enrolledSubjects}</div>
                    <p className="text-xs text-muted-foreground">
                      Enrolled
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Subject-wise Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>
                    Detailed breakdown of {child.name}'s performance in each subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {child.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <IconBook className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{subject.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {subject.teacher} • {subject.attendance}% attendance
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getGradeColor(subject.grade)}>
                            {subject.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Grade Points: {getGradePoints(subject.grade)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities & Upcoming Events */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>
                      Latest updates and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {child.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {activity.type === 'grade' && <IconAward className="h-4 w-4 text-green-600" />}
                            {activity.type === 'assignment' && <IconBook className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'attendance' && <IconCircleCheck className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>
                      Important dates and activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {child.upcomingEvents.map((event, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <IconCalendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.date} at {event.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Basic details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{child.gender}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <p className="font-medium">{child.contact}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{child.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

// Helper function to calculate grade points
function getGradePoints(grade: string): number {
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