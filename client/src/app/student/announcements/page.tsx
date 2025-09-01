import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconBell,
  IconCalendar,
  IconAlertTriangle,
  IconInfoCircle,
  IconCircleCheck,
  IconPin,
  IconEye,
  IconThumbUp,
} from "@tabler/icons-react"

// Sample announcements data
const announcements = [
  {
    id: 1,
    title: "School Holiday Notice",
    content: "Dear students, please be informed that the school will remain closed on Monday, January 20th due to a public holiday. Classes will resume normally on Tuesday.",
    type: "important",
    priority: "high",
    date: "2024-01-18",
    author: "Principal's Office",
    pinned: true,
    read: false,
    likes: 45,
  },
  {
    id: 2,
    title: "Final Examination Schedule Released",
    content: "The final examination schedule for Spring 2024 has been released. Please check your student portal for detailed timings and subjects. Remember to bring your admit cards.",
    type: "academic",
    priority: "high",
    date: "2024-01-15",
    author: "Examination Department",
    pinned: false,
    read: true,
    likes: 78,
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    content: "The quarterly parent-teacher meeting is scheduled for January 25th from 9:00 AM to 4:00 PM. Parents are requested to book their slots in advance through the portal.",
    type: "meeting",
    priority: "medium",
    date: "2024-01-12",
    author: "Academic Coordinator",
    pinned: false,
    read: true,
    likes: 32,
  },
  {
    id: 4,
    title: "Library Book Return Reminder",
    content: "Students with overdue library books are requested to return them immediately to avoid fines. The library will be closed for inventory on January 22nd.",
    type: "reminder",
    priority: "medium",
    date: "2024-01-10",
    author: "Library Department",
    pinned: false,
    read: false,
    likes: 12,
  },
  {
    id: 5,
    title: "Sports Day Registration Open",
    content: "Registration for the annual Sports Day events is now open. Students interested in participating can register through their respective class teachers by January 25th.",
    type: "event",
    priority: "low",
    date: "2024-01-08",
    author: "Physical Education Department",
    pinned: false,
    read: true,
    likes: 67,
  },
  {
    id: 6,
    title: "New Cafeteria Menu",
    content: "Starting next week, we will have an updated cafeteria menu with healthier options. The new menu includes organic salads, fresh juices, and vegetarian alternatives.",
    type: "general",
    priority: "low",
    date: "2024-01-05",
    author: "Cafeteria Management",
    pinned: false,
    read: true,
    likes: 23,
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "important":
      return <IconAlertTriangle className="h-5 w-5 text-red-600" />
    case "academic":
      return <IconCircleCheck className="h-5 w-5 text-blue-600" />
    case "meeting":
      return <IconCalendar className="h-5 w-5 text-purple-600" />
    case "reminder":
      return <IconBell className="h-5 w-5 text-orange-600" />
    case "event":
      return <IconCalendar className="h-5 w-5 text-green-600" />
    default:
      return <IconInfoCircle className="h-5 w-5 text-gray-600" />
  }
}

const getTypeBadge = (type: string) => {
  const variants = {
    "important": "bg-red-100 text-red-800",
    "academic": "bg-blue-100 text-blue-800",
    "meeting": "bg-purple-100 text-purple-800",
    "reminder": "bg-orange-100 text-orange-800",
    "event": "bg-green-100 text-green-800",
    "general": "bg-gray-100 text-gray-800",
  }
  return variants[type as keyof typeof variants] || variants.general
}

const getPriorityBadge = (priority: string) => {
  const variants = {
    "high": "bg-red-100 text-red-800",
    "medium": "bg-yellow-100 text-yellow-800",
    "low": "bg-green-100 text-green-800",
  }
  return variants[priority as keyof typeof variants] || variants.low
}

export default function AnnouncementsPage() {
  const unreadCount = announcements.filter(a => !a.read).length
  const pinnedCount = announcements.filter(a => a.pinned).length
  const recentCount = announcements.filter(a => {
    const announcementDate = new Date(a.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return announcementDate >= weekAgo
  }).length

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest news and important notices from school
            </p>
          </div>
          <Button>
            <IconBell className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
              <IconBell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pinned</CardTitle>
              <IconPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pinnedCount}</div>
              <p className="text-xs text-muted-foreground">
                Important notices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentCount}</div>
              <p className="text-xs text-muted-foreground">
                Recent updates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({announcements.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="pinned">Pinned ({pinnedCount})</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Announcements</CardTitle>
                <CardDescription>
                  Complete list of school announcements and notices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-4 border rounded-lg ${
                        announcement.pinned ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      } ${!announcement.read ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(announcement.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{announcement.title}</h3>
                              {announcement.pinned && (
                                <IconPin className="h-4 w-4 text-blue-600" />
                              )}
                              {!announcement.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700 mb-3">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeBadge(announcement.type)}>
                                {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                              </Badge>
                              <Badge className={getPriorityBadge(announcement.priority)}>
                                {announcement.priority} Priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <IconThumbUp className="mr-1 h-3 w-3" />
                            {announcement.likes}
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unread Announcements</CardTitle>
                <CardDescription>
                  Announcements you haven't read yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.filter(a => !a.read).map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(announcement.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{announcement.title}</h3>
                              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700 mb-3">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeBadge(announcement.type)}>
                                {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                              </Badge>
                              <Badge className={getPriorityBadge(announcement.priority)}>
                                {announcement.priority} Priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <IconEye className="mr-1 h-3 w-3" />
                          Mark Read
                        </Button>
                      </div>
                    </div>
                  ))}
                  {announcements.filter(a => !a.read).length === 0 && (
                    <div className="text-center py-8">
                      <IconCircleCheck className="mx-auto h-12 w-12 text-green-600 mb-4" />
                      <p className="text-muted-foreground">
                        All caught up! No unread announcements.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pinned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pinned Announcements</CardTitle>
                <CardDescription>
                  Important notices that are pinned for visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.filter(a => a.pinned).map((announcement) => (
                    <div key={announcement.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-start gap-3 mb-3">
                        <IconPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-blue-900">{announcement.title}</h3>
                          <p className="text-sm text-blue-700 mb-2">
                            {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-blue-800 mb-3">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeBadge(announcement.type)}>
                              {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                            </Badge>
                            <Badge className={getPriorityBadge(announcement.priority)}>
                              {announcement.priority} Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="important" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Important Announcements</CardTitle>
                <CardDescription>
                  High-priority announcements that require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.filter(a => a.priority === "high").map((announcement) => (
                    <div key={announcement.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-3 mb-3">
                        <IconAlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-red-900">{announcement.title}</h3>
                          <p className="text-sm text-red-700 mb-2">
                            {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-red-800 mb-3">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeBadge(announcement.type)}>
                              {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                            </Badge>
                            <Badge className="bg-red-100 text-red-800">
                              High Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}