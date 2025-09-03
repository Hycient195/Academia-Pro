"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconUpload,
  IconX,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react"

interface StudentModalProps {
  isOpen: boolean
  onClose: () => void
  student?: any
  mode: 'create' | 'edit' | 'view'
}

export function StudentModal({ isOpen, onClose, student, mode }: StudentModalProps) {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    phone: student?.phone || '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    grade: student?.grade || '',
    rollNumber: student?.rollNumber || '',
    address: student?.address || '',
    emergencyContact: student?.emergencyContact || '',
    medicalInfo: student?.medicalInfo || '',
    transportation: student?.transportation || false,
    hostel: student?.hostel || false,
    scholarship: student?.scholarship || false,
  })

  const [activeTab, setActiveTab] = useState("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            {mode === 'create' ? 'Add New Student' : mode === 'edit' ? 'Edit Student' : 'Student Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Enter the student information to create a new record.'}
            {mode === 'edit' && 'Update the student information and save changes.'}
            {mode === 'view' && 'View student details and information.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student?.avatar} />
              <AvatarFallback className="text-lg">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName[0]}${formData.lastName[0]}`
                  : 'ST'
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`
                  : 'New Student'
                }
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{formData.grade || 'Grade'}</Badge>
                <Badge variant="secondary">{formData.rollNumber || 'Roll No'}</Badge>
                {formData.scholarship && <Badge className="bg-green-100 text-green-800">Scholarship</Badge>}
              </div>
            </div>
            {mode !== 'view' && (
              <Button variant="outline" size="sm">
                <IconUpload className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={mode === 'view'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={mode === 'view'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalInfo">Medical Information</Label>
                <Textarea
                  id="medicalInfo"
                  placeholder="Any medical conditions, allergies, or special needs..."
                  value={formData.medicalInfo}
                  onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                  disabled={mode === 'view'}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade *</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => handleInputChange('grade', value)}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 9">Grade 9</SelectItem>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="e.g., 2024001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Academic Services</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportation"
                      checked={formData.transportation}
                      onCheckedChange={(checked) => handleInputChange('transportation', checked)}
                      disabled={mode === 'view'}
                    />
                    <Label htmlFor="transportation" className="text-sm">
                      School Transportation Service
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hostel"
                      checked={formData.hostel}
                      onCheckedChange={(checked) => handleInputChange('hostel', checked)}
                      disabled={mode === 'view'}
                    />
                    <Label htmlFor="hostel" className="text-sm">
                      Hostel Accommodation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scholarship"
                      checked={formData.scholarship}
                      onCheckedChange={(checked) => handleInputChange('scholarship', checked)}
                      disabled={mode === 'view'}
                    />
                    <Label htmlFor="scholarship" className="text-sm">
                      Scholarship Program
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={mode === 'view'}
                  placeholder="student@school.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={mode === 'view'}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Home Address</Label>
                <Textarea
                  id="address"
                  placeholder="Complete home address..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={mode === 'view'}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Textarea
                  id="emergencyContact"
                  placeholder="Parent/Guardian name and contact information..."
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  disabled={mode === 'view'}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enrollment Summary</CardTitle>
                  <CardDescription>Review all entered information before saving</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Full Name:</span>
                      <p>{formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Grade:</span>
                      <p>{formData.grade || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Roll Number:</span>
                      <p>{formData.rollNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p>{formData.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Services:</h4>
                    <div className="flex gap-2">
                      {formData.transportation && <Badge>Transportation</Badge>}
                      {formData.hostel && <Badge>Hostel</Badge>}
                      {formData.scholarship && <Badge>Scholarship</Badge>}
                      {!formData.transportation && !formData.hostel && !formData.scholarship && (
                        <span className="text-sm text-muted-foreground">No additional services selected</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <IconAlertTriangle className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Create Student' : 'Save Changes'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}