import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  IconBell,
  IconMail,
  IconMessage,
  IconCalendar,
  IconAlertTriangle,
  IconCircleCheck,
  IconSettings,
} from "@tabler/icons-react"

// Sample notification settings
const notificationCategories = [
  {
    id: "academic",
    title: "Academic Notifications",
    description: "Grades, assignments, and academic progress",
    icon: IconCircleCheck,
    enabled: true,
    subSettings: [
      { label: "Grade posted", enabled: true },
      { label: "Assignment due", enabled: true },
      { label: "Missing work", enabled: false },
      { label: "Academic alerts", enabled: true },
    ],
  },
  {
    id: "attendance",
    title: "Attendance Notifications",
    description: "Absences, tardiness, and attendance patterns",
    icon: IconCalendar,
    enabled: true,
    subSettings: [
      { label: "Student absent", enabled: true },
      { label: "Tardy notification", enabled: false },
      { label: "Attendance patterns", enabled: true },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    description: "Messages from teachers and administrators",
    icon: IconMessage,
    enabled: true,
    subSettings: [
      { label: "Teacher messages", enabled: true },
      { label: "Admin announcements", enabled: true },
      { label: "Parent communications", enabled: false },
    ],
  },
  {
    id: "system",
    title: "System Notifications",
    description: "Platform updates and maintenance alerts",
    icon: IconAlertTriangle,
    enabled: false,
    subSettings: [
      { label: "System updates", enabled: false },
      { label: "Maintenance alerts", enabled: true },
      { label: "Security alerts", enabled: true },
    ],
  },
]

// Sample recent notifications
const recentNotifications = [
  {
    id: 1,
    title: "Grade Posted",
    message: "Mathematics grade posted for Sarah Johnson",
    type: "academic",
    timestamp: "2024-12-15 10:30 AM",
    read: false,
  },
  {
    id: 2,
    title: "Assignment Due",
    message: "Science project due tomorrow",
    type: "academic",
    timestamp: "2024-12-15 09:15 AM",
    read: true,
  },
  {
    id: 3,
    title: "Parent Message",
    message: "John Smith sent a message about homework",
    type: "communication",
    timestamp: "2024-12-14 04:00 PM",
    read: false,
  },
]

const getNotificationIcon = (type: string) => {
  const icons = {
    "academic": IconCircleCheck,
    "attendance": IconCalendar,
    "communication": IconMessage,
    "system": IconAlertTriangle,
  }
  return icons[type as keyof typeof icons] || IconBell
}

const getTypeColor = (type: string) => {
  const colors = {
    "academic": "bg-green-100 text-green-800",
    "attendance": "bg-blue-100 text-blue-800",
    "communication": "bg-purple-100 text-purple-800",
    "system": "bg-orange-100 text-orange-800",
  }
  return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

export default function NotificationsComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Configure notification preferences and manage notification settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconSettings className="mr-2 h-4 w-4" />
              Advanced Settings
            </Button>
            <Button>
              <IconBell className="mr-2 h-4 w-4" />
              Test Notifications
            </Button>
          </div>
        </div>

        {/* Notification Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
              <IconBell className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Email Notifications</CardTitle>
              <IconMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                Delivery rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Push Notifications</CardTitle>
              <IconBell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67%</div>
              <p className="text-xs text-muted-foreground">
                Open rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">
                Average response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notificationCategories.map((category) => {
                  const CategoryIcon = category.icon
                  return (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{category.title}</p>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <Switch checked={category.enabled} />
                      </div>

                      {category.enabled && (
                        <div className="ml-8 space-y-2">
                          {category.subSettings.map((setting, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{setting.label}</span>
                              <Switch checked={setting.enabled} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotifications.map((notification) => {
                  const NotificationIcon = getNotificationIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-muted/50'
                      }`}
                    >
                      <NotificationIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge className={`${getTypeColor(notification.type)} text-xs`}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconMail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Receive via email</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconBell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser notifications</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconMessage className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">Text message alerts</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}