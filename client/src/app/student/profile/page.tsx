import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconEdit,
  IconCamera,
  IconShield,
  IconKey,
  IconBell,
  IconPalette,
} from "@tabler/icons-react"

// Sample student profile data
const studentProfile = {
  id: "STU001",
  name: "John Doe",
  email: "john.doe@student.school.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "2005-03-15",
  address: "123 Main Street, Springfield, IL 62701",
  grade: "12th Grade",
  section: "A",
  rollNumber: "001",
  admissionDate: "2022-08-15",
  guardianName: "Jane Doe",
  guardianPhone: "+1 (555) 987-6543",
  guardianEmail: "jane.doe@email.com",
  emergencyContact: "+1 (555) 111-2222",
  bloodGroup: "O+",
  medicalConditions: "None",
  avatar: "/avatars/student.jpg"
}

const academicInfo = {
  currentGPA: 3.8,
  totalCredits: 120,
  completedCredits: 95,
  currentSemester: "Spring 2024",
  expectedGraduation: "2025-05-30",
  academicStanding: "Good Standing",
  honors: ["Dean's List - Fall 2023", "Honor Roll - Spring 2023"],
  extracurricular: ["Basketball Team", "Science Club", "Debate Team"]
}

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
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
                    <AvatarImage src={studentProfile.avatar} alt={studentProfile.name} />
                    <AvatarFallback className="text-lg">
                      {studentProfile.name.split(' ').map(n => n[0]).join('')}
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
                  <h3 className="font-semibold text-lg">{studentProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Student ID: {studentProfile.id}
                  </p>
                  <Badge className="mt-2">
                    {studentProfile.grade} - Section {studentProfile.section}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{studentProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{studentProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{studentProfile.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">DOB: {new Date(studentProfile.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Guardian: {studentProfile.guardianName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Guardian: {studentProfile.guardianPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconShield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Blood Group: {studentProfile.bloodGroup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Admission: {new Date(studentProfile.admissionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    <Input id="fullName" value={studentProfile.name} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={studentProfile.email} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={studentProfile.phone} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" value={studentProfile.dateOfBirth} readOnly />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guardian Information</CardTitle>
                  <CardDescription>
                    Emergency contact and guardian details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input id="guardianName" value={studentProfile.guardianName} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianPhone">Guardian Phone</Label>
                    <Input id="guardianPhone" value={studentProfile.guardianPhone} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianEmail">Guardian Email</Label>
                    <Input id="guardianEmail" type="email" value={studentProfile.guardianEmail} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input id="emergency" value={studentProfile.emergencyContact} readOnly />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Health and medical details for emergency purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input id="bloodGroup" value={studentProfile.bloodGroup} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={studentProfile.medicalConditions}
                    readOnly
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academicInfo.currentGPA}</div>
                  <p className="text-xs text-muted-foreground">
                    Academic standing: {academicInfo.academicStanding}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits Completed</CardTitle>
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academicInfo.completedCredits}/{academicInfo.totalCredits}</div>
                  <p className="text-xs text-muted-foreground">
                    {((academicInfo.completedCredits / academicInfo.totalCredits) * 100).toFixed(1)}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expected Graduation</CardTitle>
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(academicInfo.expectedGraduation).getFullYear()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(academicInfo.expectedGraduation).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Honors</CardTitle>
                  <CardDescription>
                    Awards and recognitions received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {academicInfo.honors.map((honor, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                          <IconShield className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium">{honor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Extracurricular Activities</CardTitle>
                  <CardDescription>
                    Clubs and activities you're involved in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {academicInfo.extracurricular.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <IconUser className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <IconBell className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Privacy Settings</Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your information
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <IconShield className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Change Password</Label>
                      <p className="text-sm text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <IconKey className="mr-2 h-4 w-4" />
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>
                    Customize your portal appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <IconPalette className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Language</Label>
                      <p className="text-sm text-muted-foreground">
                        Select your language preference
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      English
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timezone</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your local timezone
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      UTC-5
                    </Button>
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