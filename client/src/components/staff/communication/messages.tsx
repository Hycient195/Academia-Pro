import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconMail,
  IconSend,
  IconInbox,
  IconArchive,
  IconTrash,
} from "@tabler/icons-react"

// Sample messages data
const messages = [
  {
    id: 1,
    sender: "John Smith",
    senderRole: "Parent",
    subject: "Question about homework assignment",
    preview: "Hi, I wanted to ask about the math homework due tomorrow...",
    timestamp: "2024-12-15 10:30 AM",
    isRead: false,
    priority: "normal",
  },
  {
    id: 2,
    sender: "Sarah Johnson",
    senderRole: "Student",
    subject: "Request for extension",
    preview: "I would like to request an extension for the science project...",
    timestamp: "2024-12-15 09:15 AM",
    isRead: true,
    priority: "high",
  },
  {
    id: 3,
    sender: "Principal Davis",
    senderRole: "Administrator",
    subject: "Staff meeting reminder",
    preview: "This is a reminder about tomorrow's staff meeting at 2 PM...",
    timestamp: "2024-12-14 04:00 PM",
    isRead: true,
    priority: "normal",
  },
]

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

export default function MessagesComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Manage incoming and outgoing messages with students and parents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconArchive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button>
              <IconSend className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        </div>

        {/* Message Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <IconInbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <IconSend className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parent Messages</CardTitle>
              <IconMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <IconMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">
                Average response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest messages from students and parents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    !message.isRead ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/${message.sender.toLowerCase().replace(' ', '-')}.jpg`} />
                    <AvatarFallback>{getInitials(message.sender)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{message.sender}</p>
                      <Badge variant="outline" className="text-xs">
                        {message.senderRole}
                      </Badge>
                      {message.priority === 'high' && (
                        <Badge className={`${getPriorityColor(message.priority)} text-xs`}>
                          High Priority
                        </Badge>
                      )}
                      {!message.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="font-medium text-sm mb-1">{message.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                    <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <IconMail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconArchive className="h-4 w-4" />
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