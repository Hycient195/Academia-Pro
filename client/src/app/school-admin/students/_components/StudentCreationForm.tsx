"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useCreateStudentMutation } from "@/redux/api/schoolAdminApi"
import type { ICreateStudentRequest, TStudentStage, TGradeCode, TEnrollmentType } from "@academia-pro/types/student/student.types"
import type { ISchoolAdminCreateStudentRequest } from "@academia-pro/types/school-admin"

// Import form components
import {
  FormText,
  FormSelect,
  FormDateInput,
  FormPhoneInput,
  FormTextArea,
  FormMultiSelect,
  FormCountrySelect,
  FormRegionSelect,
} from "@/components/ui/form/form-components"

// Constants for form options
const genderOptions = [
  { value: "male", text: "Male" },
  { value: "female", text: "Female" },
  { value: "other", text: "Other" },
]

const bloodGroupOptions = [
  { value: "A+", text: "A+" },
  { value: "A-", text: "A-" },
  { value: "B+", text: "B+" },
  { value: "B-", text: "B-" },
  { value: "AB+", text: "AB+" },
  { value: "AB-", text: "AB-" },
  { value: "O+", text: "O+" },
  { value: "O-", text: "O-" },
]

const stageOptions = [
  { value: "EY", text: "Early Years (EY)" },
  { value: "PRY", text: "Primary (PRY)" },
  { value: "JSS", text: "Junior Secondary (JSS)" },
  { value: "SSS", text: "Senior Secondary (SSS)" },
]

const gradeCodeOptions: Record<TStudentStage, Array<{ value: TGradeCode; text: string }>> = {
  EY: [
    { value: "CRECHE", text: "Creche" },
    { value: "N1", text: "Nursery 1" },
    { value: "N2", text: "Nursery 2" },
    { value: "KG1", text: "KG 1" },
    { value: "KG2", text: "KG 2" },
  ],
  PRY: [
    { value: "PRY1", text: "Primary 1" },
    { value: "PRY2", text: "Primary 2" },
    { value: "PRY3", text: "Primary 3" },
    { value: "PRY4", text: "Primary 4" },
    { value: "PRY5", text: "Primary 5" },
    { value: "PRY6", text: "Primary 6" },
  ],
  JSS: [
    { value: "JSS1", text: "JSS 1" },
    { value: "JSS2", text: "JSS 2" },
    { value: "JSS3", text: "JSS 3" },
  ],
  SSS: [
    { value: "SSS1", text: "SSS 1" },
    { value: "SSS2", text: "SSS 2" },
    { value: "SSS3", text: "SSS 3" },
  ],
}

const streamSectionOptions = [
  { value: "A", text: "Section A" },
  { value: "B", text: "Section B" },
  { value: "C", text: "Section C" },
  { value: "Science", text: "Science Stream" },
  { value: "Arts", text: "Arts Stream" },
  { value: "Commercial", text: "Commercial Stream" },
]

const enrollmentTypeOptions = [
  { value: "regular", text: "Regular" },
  { value: "special_needs", text: "Special Needs" },
  { value: "gifted", text: "Gifted" },
  { value: "international", text: "International" },
  { value: "transfer", text: "Transfer" },
]

interface StudentCreationFormProps {
  onComplete: () => void
}

export function StudentCreationForm({ onComplete }: StudentCreationFormProps) {
  const [createStudent, { isLoading }] = useCreateStudentMutation()

  // Form state
  const [formData, setFormData] = useState<Partial<ICreateStudentRequest>>({
    stage: "PRY" as TStudentStage,
    gradeCode: "PRY1" as TGradeCode,
    streamSection: "A",
    enrollmentType: "regular" as TEnrollmentType,
    isBoarding: false,
  })

  const [currentTab, setCurrentTab] = useState("personal")

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-update grade code when stage changes
    if (field === 'stage' && value) {
      const defaultGrade = gradeCodeOptions[value as TStudentStage]?.[0]?.value
      if (defaultGrade) {
        setFormData(prev => ({
          ...prev,
          gradeCode: defaultGrade
        }))
      }
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender',
        'stage', 'gradeCode', 'streamSection', 'admissionDate'
      ]

      const missingFields = requiredFields.filter(field => !formData[field as keyof ICreateStudentRequest])

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
        return
      }

      // Map form data to ISchoolAdminCreateStudentRequest format
      const admissionData: ISchoolAdminCreateStudentRequest = {
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        middleName: formData.middleName,
        admissionNumber: formData.admissionNumber || `ADM${Date.now().toString().slice(-6)}`,
        grade: formData.gradeCode || 'Unknown',
        section: formData.streamSection || 'A',
        parentFirstName: formData.parents?.father?.name || formData.parents?.mother?.name || 'Unknown',
        parentLastName: formData.parents?.father?.name ? '' : (formData.parents?.mother?.name ? '' : 'Parent'),
        parentMiddleName: '',
        parentEmail: formData.parents?.father?.email || formData.parents?.mother?.email || '',
        parentPhone: formData.parents?.father?.phone || formData.parents?.mother?.phone || '',
      }

      await createStudent(admissionData).unwrap()

      toast.success("Student created successfully!")
      onComplete()
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message || "Failed to create student"
        : "Failed to create student"
      toast.error(errorMessage)
    }
  }

  const availableGradeCodes = formData.stage ? gradeCodeOptions[formData.stage] || [] : []

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter the student&apos;s basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormText
                  labelText="First Name *"
                  placeholder="Enter first name"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
                <FormText
                  labelText="Last Name *"
                  placeholder="Enter last name"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>

              <FormText
                labelText="Middle Name"
                placeholder="Enter middle name"
                value={formData.middleName || ""}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormDateInput
                  labelText="Date of Birth *"
                  value={formData.dateOfBirth || ""}
                  onChange={(value) => handleInputChange('dateOfBirth', value)}
                  required
                />
                <FormSelect
                  labelText="Gender *"
                  options={genderOptions}
                  value={formData.gender || ""}
                  onChange={(value) => handleInputChange('gender', value)}
                  placeholder="Select gender"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  labelText="Blood Group"
                  options={bloodGroupOptions}
                  value={formData.bloodGroup || ""}
                  onChange={(value) => handleInputChange('bloodGroup', value)}
                  placeholder="Select blood group"
                />
                <FormPhoneInput
                  labelText="Phone Number"
                  value={formData.phone || ""}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="Enter phone number"
                />
              </div>

              <FormText
                labelText="Email Address"
                placeholder="student@email.com"
                value={formData.email || ""}
                onChange={(e) => handleInputChange('email', e.target.value)}
                type="email"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Street Address"
                    placeholder="123 Main Street"
                    value={formData.address?.street || ""}
                    onChange={(e) => handleInputChange('address', {
                      ...formData.address,
                      street: e.target.value
                    })}
                  />
                  <FormText
                    labelText="City"
                    placeholder="City"
                    value={formData.address?.city || ""}
                    onChange={(e) => handleInputChange('address', {
                      ...formData.address,
                      city: e.target.value
                    })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormRegionSelect
                    labelText="State"
                    value={formData.address?.state || ""}
                    onChange={(value) => handleInputChange('address', {
                      ...formData.address,
                      state: value
                    })}
                    placeholder="Select state"
                    countryCode="NG"
                  />
                  <FormText
                    labelText="Postal Code"
                    placeholder="12345"
                    value={formData.address?.postalCode || ""}
                    onChange={(e) => handleInputChange('address', {
                      ...formData.address,
                      postalCode: e.target.value
                    })}
                  />
                  <FormCountrySelect
                    labelText="Country"
                    value={formData.address?.country || "Nigeria"}
                    onChange={(value) => handleInputChange('address', {
                      ...formData.address,
                      country: value
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Set up the student&apos;s academic details and enrollment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormText
                labelText="Admission Number"
                placeholder="Auto-generated if empty"
                value={formData.admissionNumber || ""}
                onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  labelText="Stage *"
                  options={stageOptions}
                  value={formData.stage || ""}
                  onChange={(value) => handleInputChange('stage', value)}
                  placeholder="Select stage"
                  required
                />
                <FormSelect
                  labelText="Grade Code *"
                  options={availableGradeCodes}
                  value={formData.gradeCode || ""}
                  onChange={(value) => handleInputChange('gradeCode', value)}
                  placeholder="Select grade"
                  required
                  disabled={!formData.stage}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  labelText="Stream/Section *"
                  options={streamSectionOptions}
                  value={formData.streamSection || ""}
                  onChange={(value) => handleInputChange('streamSection', value)}
                  placeholder="Select section"
                  required
                />
                <FormSelect
                  labelText="Enrollment Type"
                  options={enrollmentTypeOptions}
                  value={formData.enrollmentType || ""}
                  onChange={(value) => handleInputChange('enrollmentType', value)}
                  placeholder="Select type"
                />
              </div>

              <FormDateInput
                labelText="Admission Date *"
                value={formData.admissionDate || ""}
                onChange={(value) => handleInputChange('admissionDate', value)}
                required
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="boarding"
                  checked={formData.isBoarding || false}
                  onCheckedChange={(checked) => handleInputChange('isBoarding', checked === true)}
                />
                <label
                  htmlFor="boarding"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Boarding Student
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Check if student resides in school hostel</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
              <CardDescription>Add parent or guardian contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Father</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Father's Name"
                    placeholder="Enter father's full name"
                    value={formData.parents?.father?.name || ""}
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      father: {
                        ...formData.parents?.father,
                        name: e.target.value
                      }
                    })}
                  />
                  <FormPhoneInput
                    labelText="Father's Phone"
                    value={formData.parents?.father?.phone || ""}
                    onChange={(value) => handleInputChange('parents', {
                      ...formData.parents,
                      father: {
                        ...formData.parents?.father,
                        phone: value
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                <FormText
                  labelText="Father's Email"
                  placeholder="father@email.com"
                  value={formData.parents?.father?.email || ""}
                  onChange={(e) => handleInputChange('parents', {
                    ...formData.parents,
                    father: {
                      ...formData.parents?.father,
                      email: e.target.value
                    }
                  })}
                  type="email"
                />
                <FormText
                  labelText="Father's Occupation"
                  placeholder="Enter occupation"
                  value={formData.parents?.father?.occupation || ""}
                  onChange={(e) => handleInputChange('parents', {
                    ...formData.parents,
                    father: {
                      ...formData.parents?.father,
                      occupation: e.target.value
                    }
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Mother</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Mother's Name"
                    placeholder="Enter mother's full name"
                    value={formData.parents?.mother?.name || ""}
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      mother: {
                        ...formData.parents?.mother,
                        name: e.target.value
                      }
                    })}
                  />
                  <FormPhoneInput
                    labelText="Mother's Phone"
                    value={formData.parents?.mother?.phone || ""}
                    onChange={(value) => handleInputChange('parents', {
                      ...formData.parents,
                      mother: {
                        ...formData.parents?.mother,
                        phone: value
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                <FormText
                  labelText="Mother's Email"
                  placeholder="mother@email.com"
                  value={formData.parents?.mother?.email || ""}
                  onChange={(e) => handleInputChange('parents', {
                    ...formData.parents,
                    mother: {
                      ...formData.parents?.mother,
                      email: e.target.value
                    }
                  })}
                  type="email"
                />
                <FormText
                  labelText="Mother's Occupation"
                  placeholder="Enter occupation"
                  value={formData.parents?.mother?.occupation || ""}
                  onChange={(e) => handleInputChange('parents', {
                    ...formData.parents,
                    mother: {
                      ...formData.parents?.mother,
                      occupation: e.target.value
                    }
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Guardian (if different from parents)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Guardian's Name"
                    placeholder="Enter guardian's full name"
                    value={formData.parents?.guardian?.name || ""}
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      guardian: {
                        ...formData.parents?.guardian,
                        name: e.target.value
                      }
                    })}
                  />
                  <FormPhoneInput
                    labelText="Guardian's Phone"
                    value={formData.parents?.guardian?.phone || ""}
                    onChange={(value) => handleInputChange('parents', {
                      ...formData.parents,
                      guardian: {
                        ...formData.parents?.guardian,
                        phone: value
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Relationship"
                    placeholder="e.g., Uncle, Aunt"
                    value={formData.parents?.guardian?.relation || ""}
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      guardian: {
                        ...formData.parents?.guardian,
                        relation: e.target.value
                      }
                    })}
                  />
                  <FormText
                    labelText="Guardian's Email"
                    placeholder="guardian@email.com"
                    value={formData.parents?.guardian?.email || ""}
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      guardian: {
                        ...formData.parents?.guardian,
                        email: e.target.value
                      }
                    })}
                    type="email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Add medical details and emergency contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextArea
                labelText="Allergies"
                placeholder="List any allergies (comma separated)"
                value={formData.medicalInfo?.allergies?.join(', ') || ""}
                onChange={(e) => handleInputChange('medicalInfo', {
                  ...formData.medicalInfo,
                  allergies: (e.target?.value as string || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                })}
                rows={2}
              />

              <FormTextArea
                labelText="Medications"
                placeholder="List current medications (comma separated)"
                value={formData.medicalInfo?.medications?.join(', ') || ""}
                onChange={(e) => handleInputChange('medicalInfo', {
                  ...formData.medicalInfo,
                  medications: (e.target?.value as string || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                })}
                rows={2}
              />

              <FormTextArea
                labelText="Medical Conditions"
                placeholder="List any medical conditions (comma separated)"
                value={formData.medicalInfo?.conditions?.join(', ') || ""}
                onChange={(e) => handleInputChange('medicalInfo', {
                  ...formData.medicalInfo,
                  conditions: (e.target?.value as string || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                })}
                rows={2}
              />

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Emergency Contact Name"
                    placeholder="Enter contact name"
                    value={formData.medicalInfo?.emergencyContact?.name || ""}
                    onChange={(e) => handleInputChange('medicalInfo', {
                      ...formData.medicalInfo,
                      emergencyContact: {
                        ...formData.medicalInfo?.emergencyContact,
                        name: e.target.value
                      }
                    })}
                  />
                  <FormPhoneInput
                    labelText="Emergency Contact Phone"
                    value={formData.medicalInfo?.emergencyContact?.phone || ""}
                    onChange={(value) => handleInputChange('medicalInfo', {
                      ...formData.medicalInfo,
                      emergencyContact: {
                        ...formData.medicalInfo?.emergencyContact,
                        phone: value
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                <FormText
                  labelText="Relationship to Student"
                  placeholder="e.g., Mother, Father, Guardian"
                  value={formData.medicalInfo?.emergencyContact?.relationship || ""}
                  onChange={(e) => handleInputChange('medicalInfo', {
                    ...formData.medicalInfo,
                    emergencyContact: {
                      ...formData.medicalInfo?.emergencyContact,
                      relationship: e.target.value
                    }
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Doctor Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormText
                    labelText="Doctor's Name"
                    placeholder="Enter doctor's name"
                    value={formData.medicalInfo?.doctorInfo?.name || ""}
                    onChange={(e) => handleInputChange('medicalInfo', {
                      ...formData.medicalInfo,
                      doctorInfo: {
                        ...formData.medicalInfo?.doctorInfo,
                        name: e.target.value
                      }
                    })}
                  />
                  <FormPhoneInput
                    labelText="Doctor's Phone"
                    value={formData.medicalInfo?.doctorInfo?.phone || ""}
                    onChange={(value) => handleInputChange('medicalInfo', {
                      ...formData.medicalInfo,
                      doctorInfo: {
                        ...formData.medicalInfo?.doctorInfo,
                        phone: value
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                <FormText
                  labelText="Clinic/Hospital"
                  placeholder="Enter clinic or hospital name"
                  value={formData.medicalInfo?.doctorInfo?.clinic || ""}
                  onChange={(e) => handleInputChange('medicalInfo', {
                    ...formData.medicalInfo,
                    doctorInfo: {
                      ...formData.medicalInfo?.doctorInfo,
                      clinic: e.target.value
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Please review all information before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                    <p><span className="font-medium">Date of Birth:</span> {formData.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Academic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Admission Number:</span> {formData.admissionNumber || 'Auto-generated'}</p>
                    <p><span className="font-medium">Stage:</span> {formData.stage}</p>
                    <p><span className="font-medium">Grade:</span> {formData.gradeCode}</p>
                    <p><span className="font-medium">Section:</span> {formData.streamSection}</p>
                    <p><span className="font-medium">Boarding:</span> {formData.isBoarding ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("medical")}
                >
                  Back to Medical
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Student..." : "Create Student"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}