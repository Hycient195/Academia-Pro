import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconSpeakerphone,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconSend,
} from "@tabler/icons-react"

// Sample announcements data
const announcements = [
  {
    id: 1,
    title: "Winter Break Schedule",
    content: "School will be closed from December 20th to January 5th for winter break...",
    author: "Principal Davis",
    targetAudience: "All Students & Parents",
    status: "Published",
    publishDate: "2024-12-10",
    views: 245,
    priority: "high",
  },
  {
    id: 2,
    title: "Parent-Teacher Conference",
    content: "PTC will be held on December 18th from 9 AM to 4 PM...",
    author: "Mrs. Johnson",
    targetAudience: "Parents Only",
    status: "Published",
    publishDate: "2024-12-08",
    views: 189,
    priority: "normal",
  },
  {
    id: 3,
    title: "New Library Books Available",
    content: "We have added new books to our library collection...",
    author: "Mr. Thompson",
    targetAudience: "Students Only",
    status: "Draft",
    publishDate: null,
    views: 0,
    priority: "low",
  },
]

const getStatusColor = (status: string) => {
  const colors = {
    "Published": "bg-green-100 text-green-800",
    "Draft": "bg-yellow-100 text-yellow-800",
    "Scheduled": "bg-blue-100 text-blue-800",
  }
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

const getPriorityColor = (priority: string) => {
  const colors = {
    "high": "bg-red-100 text-red-800",
    "normal": "bg-blue-100 text-blue-800",
    "low": "bg-gray-100 text-gray-800",
  }
  return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function AnnouncementsComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">
              Create and manage school-wide announcements and important notices
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconEye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Announcement Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
              <IconSpeakerphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <IconSend className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                Live announcements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <IconEye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <IconEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Pending publication
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Manage your school announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/${announcement.author.toLowerCase().replace(' ', '-')}.jpg`} />
                    <AvatarFallback>{getInitials(announcement.author)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{announcement.title}</h3>
                      <Badge className={`${getStatusColor(announcement.status)} text-xs`}>
                        {announcement.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(announcement.priority)} text-xs`}>
                        {announcement.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {announcement.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{announcement.targetAudience}</span>
                      <span>•</span>
                      <span>{announcement.views} views</span>
                      {announcement.publishDate && (
                        <>
                          <span>•</span>
                          <span>Published {announcement.publishDate}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconSend className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}