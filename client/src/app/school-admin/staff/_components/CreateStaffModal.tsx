"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { FormText, FormTextArea, FormSelect, FormDateInput, FormPhoneInput, FormNumberInput } from "@/components/ui/form/form-components"
import { TEmploymentType, TDepartment } from "@academia-pro/types/staff"
import { useCreateStaffMutation } from "@/redux/api/school-admin/staffApis"
import { toast } from "sonner"

interface StaffModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  schoolId: string
}

export function StaffModal({ isOpen, onClose, onSuccess, schoolId }: StaffModalProps) {
  const [activeTab, setActiveTab] = useState("personal")

  const [formData, setFormData] = useState({
    schoolId,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: new Date(),
    gender: 'male' as 'male' | 'female' | 'other',
    staffType: TDepartment.ADMINISTRATIVE,
    department: '',
    designation: '',
    employmentType: TEmploymentType.FULL_TIME,
    joiningDate: new Date(),
    basicSalary: 0,
    currentAddress: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
    },
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  })

  const [createStaff, { isLoading: isSubmitting }] = useCreateStaffMutation()

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.basicSalary) {
      toast.error("Please fill in all required fields")
      return
    }

    createStaff(formData)
    .unwrap()
    .then(() => {
      toast.success("Staff member created successfully")
      onSuccess?.()
      onClose()
      setFormData({
        schoolId,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: new Date(),
        gender: 'male' as 'male' | 'female' | 'other',
        staffType: TDepartment.ADMINISTRATIVE,
        department: '',
        designation: '',
        employmentType: TEmploymentType.FULL_TIME,
        joiningDate: new Date(),
        basicSalary: 0,
        currentAddress: {
          street: '',
          city: '',
          state: '',
          country: 'Nigeria',
          postalCode: '',
        },
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
      })
    })
    .catch((error) => {
      console.error('Failed to create staff:', error)
      toast.error(error?.data?.message || "Failed to create staff member")
    })
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields like address.street
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }))
    } else {
      // Handle date fields
      if (field === 'dateOfBirth' || field === 'joiningDate') {
        setFormData(prev => ({ ...prev, [field]: value ? new Date(value) : new Date() }))
      } else {
        setFormData(prev => ({ ...prev, [field]: value }))
      }
    }
  }

  const departmentOptions = [
    { value: TDepartment.ADMINISTRATIVE, text: 'Administrative' },
    { value: TDepartment.ACADEMIC, text: 'Academic' },
    { value: TDepartment.MEDICAL, text: 'Medical' },
    { value: TDepartment.SECURITY, text: 'Security' },
    { value: TDepartment.TECHNICAL, text: 'Technical' },
    { value: TDepartment.SUPPORT, text: 'Support' },
    { value: TDepartment.LIBRARY, text: 'Library' },
    { value: TDepartment.SPORTS, text: 'Sports' },
  ]

  const positionOptions = [
    { value: 'Principal', text: 'Principal' },
    { value: 'Vice Principal', text: 'Vice Principal' },
    { value: 'Administrator', text: 'Administrator' },
    { value: 'Accountant', text: 'Accountant' },
    { value: 'Clerk', text: 'Clerk' },
    { value: 'Secretary', text: 'Secretary' },
    { value: 'Technician', text: 'Technician' },
    { value: 'Security Guard', text: 'Security Guard' },
    { value: 'Nurse', text: 'Nurse' },
    { value: 'Cook', text: 'Cook' },
    { value: 'Janitor', text: 'Janitor' },
    { value: 'Teacher', text: 'Teacher' },
    { value: 'Librarian', text: 'Librarian' },
  ]

  const employmentTypeOptions = [
    { value: TEmploymentType.FULL_TIME, text: 'Full Time' },
    { value: TEmploymentType.PART_TIME, text: 'Part Time' },
    { value: TEmploymentType.CONTRACT, text: 'Contract' },
    { value: TEmploymentType.TEMPORARY, text: 'Temporary' },
    { value: TEmploymentType.INTERN, text: 'Intern' },
  ]

  const genderOptions = [
    { value: 'male', text: 'Male' },
    { value: 'female', text: 'Female' },
    { value: 'other', text: 'Other' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            Enter the staff member information to create a new record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName[0]}${formData.lastName[0]}`
                  : 'SM'
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`
                  : 'New Staff Member'
                }
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{formData.designation || 'Position'}</Badge>
                <Badge variant="secondary">{formData.department || 'Department'}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <IconUpload className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormText
                  labelText="First Name *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
                <FormText
                  labelText="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormDateInput
                  labelText="Date of Birth"
                  value={formData.dateOfBirth?.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  placeholder="Select date of birth"
                />
                <FormSelect
                  labelText="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  options={genderOptions}
                  placeholder="Select gender"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormText
                  labelText="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="staff@school.com"
                  required
                />
                <FormPhoneInput
                  labelText="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  labelText="Department *"
                  value={formData.staffType}
                  onChange={(e) => handleInputChange('staffType', e.target.value)}
                  options={departmentOptions}
                  placeholder="Select department"
                  required
                />
                <FormText
                  labelText="Department Name"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Mathematics, Administration"
                />
                <FormSelect
                  labelText="Designation *"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  options={positionOptions}
                  placeholder="Select designation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  labelText="Employment Type *"
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  options={employmentTypeOptions}
                  placeholder="Select employment type"
                  required
                />
                <FormDateInput
                  labelText="Joining Date *"
                  value={formData.joiningDate?.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                  placeholder="Select joining date"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormNumberInput
                  labelText="Basic Salary (₦) *"
                  value={formData.basicSalary}
                  onChange={(e) => handleInputChange('basicSalary', Number(e.target.value))}
                  placeholder="Enter basic salary"
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee ID (Auto-generated)</label>
                  <div className="p-2 bg-muted rounded text-sm text-muted-foreground">
                    Will be generated automatically
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Home Address</h4>
                <FormText
                  labelText="Street Address"
                  value={formData.currentAddress?.street}
                  onChange={(e) => handleInputChange('currentAddress.street', e.target.value)}
                  placeholder="Enter street address"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="City"
                    value={formData.currentAddress?.city}
                    onChange={(e) => handleInputChange('currentAddress.city', e.target.value)}
                    placeholder="Enter city"
                  />
                  <FormText
                    labelText="State"
                    value={formData.currentAddress?.state}
                    onChange={(e) => handleInputChange('currentAddress.state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Country"
                    value={formData.currentAddress?.country}
                    onChange={(e) => handleInputChange('currentAddress.country', e.target.value)}
                    placeholder="Enter country"
                  />
                  <FormText
                    labelText="Postal Code"
                    value={formData.currentAddress?.postalCode}
                    onChange={(e) => handleInputChange('currentAddress.postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Enter contact name"
                  />
                  <FormText
                    labelText="Relationship"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    placeholder="e.g., Parent, Spouse"
                  />
                </div>
                <FormPhoneInput
                  labelText="Emergency Phone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Staff Information Summary</CardTitle>
                  <CardDescription>Review all entered information before creating the staff record</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Full Name:</span>
                      <p>{formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p>{formData.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p>{formData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>
                      <p>{formData.department || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Designation:</span>
                      <p>{formData.designation || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Employment Type:</span>
                      <p>{formData.employmentType?.replace('_', ' ') || 'Not selected'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Basic Salary:</span>
                      <p>{formData.basicSalary ? `₦${formData.basicSalary.toLocaleString()}` : 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Joining Date:</span>
                      <p>{formData.joiningDate ? formData.joiningDate.toLocaleDateString() : 'Not selected'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Address:</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.currentAddress?.street && formData.currentAddress?.city && formData.currentAddress?.state
                        ? `${formData.currentAddress.street}, ${formData.currentAddress.city}, ${formData.currentAddress.state}`
                        : 'Not provided'
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Emergency Contact:</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.emergencyContactName
                        ? `${formData.emergencyContactName} (${formData.emergencyContactRelation}) - ${formData.emergencyContactPhone}`
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <IconAlertTriangle className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 h-4 w-4" />
                  Create Staff Member
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}