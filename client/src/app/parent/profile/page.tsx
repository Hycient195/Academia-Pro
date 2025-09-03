import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconEdit,
  IconCamera,
  IconShield,
  IconKey,
  IconBell,
  IconPalette,
  IconGlobe,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"

// Sample parent profile data
const parentProfile = {
  id: "PAR001",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1980-05-15",
  address: "123 Main Street, Springfield, IL 62701",
  occupation: "Software Engineer",
  employer: "Tech Solutions Inc.",
  emergencyContact: "+1 (555) 987-6543",
  relationship: "Mother",
  avatar: "/avatars/parent.jpg",

  // Children information
  children: [
    {
      id: "STU001",
      name: "Emma Johnson",
      grade: "10th Grade",
      relationship: "Daughter",
    },
    {
      id: "STU002",
      name: "Michael Johnson",
      grade: "8th Grade",
      relationship: "Son",
    },
  ],

  // Account settings
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true,
    theme: "system",
    language: "English",
    timezone: "America/Chicago",
  },

  // Security info
  security: {
    twoFactorEnabled: false,
    lastLogin: "2024-01-15T10:30:00",
    passwordLastChanged: "2023-12-01",
  },
}

export default function ParentProfilePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
          <Button>
            <IconEdit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={parentProfile.avatar} alt={parentProfile.name} />
                    <AvatarFallback className="text-lg">
                      {parentProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <IconCamera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{parentProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Parent ID: {parentProfile.id}
                  </p>
                  <Badge className="mt-2">
                    {parentProfile.relationship}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parentProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parentProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parentProfile.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parentProfile.occupation} at {parentProfile.employer}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Emergency: {parentProfile.emergencyContact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconShield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      2FA: {parentProfile.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Notifications: {parentProfile.preferences.emailNotifications ? "On" : "Off"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconGlobe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parentProfile.preferences.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Information */}
        <Card>
          <CardHeader>
            <CardTitle>My Children</CardTitle>
            <CardDescription>
              Children enrolled in the school system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {parentProfile.children.map((child) => (
                <div key={child.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {child.grade} • {child.relationship}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Student ID: {child.id}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={parentProfile.name} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={parentProfile.email} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={parentProfile.phone} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" value={parentProfile.dateOfBirth} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" value={parentProfile.occupation} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="employer">Employer</Label>
                    <Input id="employer" value={parentProfile.employer} readOnly />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Address and emergency contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={parentProfile.address}
                      readOnly
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input id="emergency" value={parentProfile.emergencyContact} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="relationship">Relationship to Children</Label>
                    <Input id="relationship" value={parentProfile.relationship} readOnly />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch checked={parentProfile.preferences.emailNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive urgent updates via SMS
                      </p>
                    </div>
                    <Switch checked={parentProfile.preferences.smsNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Newsletter</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive school newsletter and updates
                      </p>
                    </div>
                    <Switch checked={parentProfile.preferences.newsletter} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>
                    Customize your portal appearance and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={parentProfile.preferences.theme === "light" ? "default" : "outline"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <IconSun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button
                        variant={parentProfile.preferences.theme === "dark" ? "default" : "outline"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <IconMoon className="h-4 w-4" />
                        Dark
                      </Button>
                      <Button
                        variant={parentProfile.preferences.theme === "system" ? "default" : "outline"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <IconDeviceDesktop className="h-4 w-4" />
                        System
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      className="w-full p-2 border rounded-md"
                      value={parentProfile.preferences.language}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="w-full p-2 border rounded-md"
                      value={parentProfile.preferences.timezone}
                    >
                      <option>America/New_York</option>
                      <option>America/Chicago</option>
                      <option>America/Denver</option>
                      <option>America/Los_Angeles</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch checked={parentProfile.security.twoFactorEnabled} />
                  </div>

                  <div className="space-y-2">
                    <Label>Change Password</Label>
                    <Button variant="outline" className="w-full">
                      <IconKey className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Login History</Label>
                    <div className="text-sm text-muted-foreground">
                      Last login: {new Date(parentProfile.security.lastLogin).toLocaleString()}
                    </div>
                    <Button variant="outline" size="sm">
                      View Full History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Activity</CardTitle>
                  <CardDescription>
                    Recent account activity and security events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Password Changed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(parentProfile.security.passwordLastChanged).toLocaleDateString()}
                        </p>
                      </div>
                      <IconKey className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Last Login</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(parentProfile.security.lastLogin).toLocaleString()}
                        </p>
                      </div>
                      <IconShield className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Profile Updated</p>
                        <p className="text-xs text-muted-foreground">
                          2 days ago
                        </p>
                      </div>
                      <IconUser className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}