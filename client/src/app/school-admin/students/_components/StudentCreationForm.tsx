"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import apis from "@/redux/api"
const { useCreateStudentMutation } = apis.schoolAdmin.student
import { Country } from "country-state-city"
import type { ICreateStudentRequest, TStudentStage, TGradeCode, TEnrollmentType } from "@academia-pro/types/student/student.types"

// Import form components
import {
  FormText,
  FormSelect,
  FormDateInput,
  FormPhoneInput,
  FormCountrySelect,
  FormRegionSelect,
} from "@/components/ui/form/form-components"
import FormMultiTextInput from "@/components/ui/form/FormMultiTextInput"
import ErrorBlock from "@/components/utilities/ErrorBlock"

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

const relationOptions = [
  { value: "father", text: "Father" },
  { value: "mother", text: "Mother" },
  { value: "brother", text: "Brother" },
  { value: "sister", text: "Sister" },
  { value: "uncle", text: "Uncle" },
  { value: "aunt", text: "Aunt" },
  { value: "grandfather", text: "Grandfather" },
  { value: "grandmother", text: "Grandmother" },
  { value: "guardian", text: "Guardian" },
  { value: "other", text: "Other" },
]

interface StudentCreationFormProps {
  onComplete: () => void
}

export function StudentCreationForm({ onComplete }: StudentCreationFormProps) {
  const [createStudent, { isLoading, error: createStudentError }] = useCreateStudentMutation()

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

      // Map form data to the correct server format (CreateStudentDto)
      const admissionData: ICreateStudentRequest = {
        admissionNumber: formData.admissionNumber || `ADM${Date.now().toString().slice(-6)}`,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        middleName: formData.middleName,
        dateOfBirth: formData.dateOfBirth!,
        gender: formData.gender!,
        bloodGroup: formData.bloodGroup,
        email: formData.email,
        phone: formData.phone,
        address: formData.address ? {
          street: formData.address.street || '',
          city: formData.address.city || '',
          state: formData.address.state || '',
          country: formData.address.country ? Country.getCountryByCode(formData.address.country)?.name || 'Nigeria' : 'Nigeria',
          postalCode: formData.address.postalCode || '',
        } : undefined,
        stage: formData.stage!,
        gradeCode: formData.gradeCode!,
        streamSection: formData.streamSection!,
        admissionDate: formData.admissionDate!,
        enrollmentType: formData.enrollmentType!,
        schoolId: 'bd8fb6e7-5cec-4b72-879f-a2102180529b', // Use the school ID from JWT token context
        isBoarding: formData.isBoarding || false,
        parents: formData.parents ? {
          father: formData.parents.father ? {
            name: formData.parents.father.name,
            phone: formData.parents.father.phone,
            email: formData.parents.father.email,
            occupation: formData.parents.father.occupation,
          } : undefined,
          mother: formData.parents.mother ? {
            name: formData.parents.mother.name,
            phone: formData.parents.mother.phone,
            email: formData.parents.mother.email,
            occupation: formData.parents.mother.occupation,
          } : undefined,
          guardian: formData.parents.guardian ? {
            name: formData.parents.guardian.name,
            phone: formData.parents.guardian.phone,
            email: formData.parents.guardian.email,
            relation: formData.parents.guardian.relation,
          } : undefined,
        } : undefined,
        medicalInfo: formData.medicalInfo ? {
          bloodGroup: formData.bloodGroup,
          allergies: formData.medicalInfo.allergies,
          medications: formData.medicalInfo.medications,
          conditions: formData.medicalInfo.conditions,
          emergencyContact: {
            firstName: formData.medicalInfo.emergencyContact?.firstName || '',
            lastName: formData.medicalInfo.emergencyContact?.lastName || '',
            phone: formData.medicalInfo.emergencyContact?.phone || '',
            email: formData.medicalInfo.emergencyContact?.email,
            relation: formData.medicalInfo.emergencyContact?.relation || '',
            occupation: formData.medicalInfo.emergencyContact?.occupation || '',
          },
          doctorInfo: formData.medicalInfo.doctorInfo ? {
            firstName: formData.medicalInfo.doctorInfo.firstName,
            lastName: formData.medicalInfo.doctorInfo.lastName,
            phone: formData.medicalInfo.doctorInfo.phone,
            clinic: formData.medicalInfo.doctorInfo.clinic,
          } : undefined,
        } : undefined,
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
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
                <FormSelect
                  labelText="Gender *"
                  options={genderOptions}
                  value={formData.gender || ""}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  placeholder="Select gender"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  labelText="Blood Group"
                  options={bloodGroupOptions}
                  value={formData.bloodGroup || ""}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  placeholder="Select blood group"
                />
                <FormPhoneInput
                  labelText="Phone Number"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
                    onChange={(e) => handleInputChange('address', {
                      ...formData.address,
                      state: e.target.value
                    })}
                    placeholder="Select state"
                    countryCode={formData.address?.country || "NG"}
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
                    value={formData.address?.country || "NG"}
                    onChange={(e) => handleInputChange('address', {
                      ...formData.address,
                      country: e.target.value
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
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  placeholder="Select stage"
                  required
                />
                <FormSelect
                  labelText="Grade Code *"
                  options={availableGradeCodes}
                  value={formData.gradeCode || ""}
                  onChange={(e) => handleInputChange('gradeCode', e.target.value)}
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
                  onChange={(e) => handleInputChange('streamSection', e.target.value)}
                  placeholder="Select section"
                  required
                />
                <FormSelect
                  labelText="Enrollment Type"
                  options={enrollmentTypeOptions}
                  value={formData.enrollmentType || ""}
                  onChange={(e) => handleInputChange('enrollmentType', e.target.value)}
                  placeholder="Select type"
                />
              </div>

              <FormDateInput
                labelText="Admission Date *"
                value={formData.admissionDate}
                onChange={(e) => handleInputChange('admissionDate', e.target.value)}
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
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      father: {
                        ...formData.parents?.father,
                        phone: e.target.value
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
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      mother: {
                        ...formData.parents?.mother,
                        phone: e.target.value
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
                    onChange={(e) => handleInputChange('parents', {
                      ...formData.parents,
                      guardian: {
                        ...formData.parents?.guardian,
                        phone: e.target.value
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormSelect
                      labelText="Relationship"
                      options={relationOptions}
                      value={formData.parents?.guardian?.relation || ""}
                      onChange={(e) => handleInputChange('parents', {
                        ...formData.parents,
                        guardian: {
                          ...formData.parents?.guardian,
                          relation: e.target.value
                        }
                      })}
                    />
                    {formData.parents?.guardian?.relation === 'other' && (
                      <FormText
                        labelText="Specify Relationship"
                        placeholder="Specify the relationship"
                        value={formData.parents?.guardian?.customRelation || ''}
                        onChange={(e) => handleInputChange('parents', {
                          ...formData.parents,
                          guardian: {
                            ...formData.parents?.guardian,
                            customRelation: e.target.value
                          }
                        })}
                      />
                    )}
                  </div>
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
                <FormMultiTextInput
                  values={formData.medicalInfo?.allergies || []}
                  setFormData={setFormData}
                  propertyKey="medicalInfo.allergies"
                  labelText="Allergies"
                  placeholder="Add an allergy and press Enter"
                />
 
                <FormMultiTextInput
                  values={formData.medicalInfo?.medications || []}
                  setFormData={setFormData}
                  propertyKey="medicalInfo.medications"
                  labelText="Medications"
                  placeholder="Add a medication and press Enter"
                />
 
                <FormMultiTextInput
                  values={formData.medicalInfo?.conditions || []}
                  setFormData={setFormData}
                  propertyKey="medicalInfo.conditions"
                  labelText="Medical Conditions"
                  placeholder="Add a medical condition and press Enter"
                />
 
                <Separator />
 
                <div className="space-y-4">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormText
                      labelText="First Name"
                      placeholder="Enter first name"
                      value={formData.medicalInfo?.emergencyContact?.firstName || ""}
                      onChange={(e) => handleInputChange('medicalInfo', {
                        ...formData.medicalInfo,
                        emergencyContact: {
                          ...formData.medicalInfo?.emergencyContact,
                          firstName: e.target.value
                        }
                      })}
                    />
                    <FormText
                      labelText="Last Name"
                      placeholder="Enter last name"
                      value={formData.medicalInfo?.emergencyContact?.lastName || ""}
                      onChange={(e) => handleInputChange('medicalInfo', {
                        ...formData.medicalInfo,
                        emergencyContact: {
                          ...formData.medicalInfo?.emergencyContact,
                          lastName: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormPhoneInput
                      labelText="Phone"
                      value={formData.medicalInfo?.emergencyContact?.phone || ""}
                      onChange={(e) => handleInputChange('medicalInfo', {
                        ...formData.medicalInfo,
                        emergencyContact: {
                          ...formData.medicalInfo?.emergencyContact,
                          phone: e.target.value
                        }
                      })}
                      placeholder="Enter phone number"
                    />
                    <div className="space-y-2">
                      <FormSelect
                        labelText="Relationship"
                        options={relationOptions}
                        value={formData.medicalInfo?.emergencyContact?.relation || ""}
                        onChange={(e) => handleInputChange('medicalInfo', {
                          ...formData.medicalInfo,
                          emergencyContact: {
                            ...formData.medicalInfo?.emergencyContact,
                            relation: e.target.value
                          }
                        })}
                        placeholder="Select relationship"
                      />
                      {formData.medicalInfo?.emergencyContact?.relation === 'other' && (
                        <FormText
                          labelText="Specify Relationship"
                          placeholder="Specify the relationship"
                          value={formData.medicalInfo?.emergencyContact?.customRelation || ''}
                          onChange={(e) => handleInputChange('medicalInfo', {
                            ...formData.medicalInfo,
                            emergencyContact: {
                              ...formData.medicalInfo?.emergencyContact,
                              customRelation: e.target.value
                            }
                          })}
                        />
                      )}
                    </div>
                  </div>
                  <FormText
                    labelText="Occupation"
                    placeholder="Enter occupation"
                    value={formData.medicalInfo?.emergencyContact?.occupation || ""}
                    onChange={(e) => handleInputChange('medicalInfo', {
                      ...formData.medicalInfo,
                      emergencyContact: {
                        ...formData.medicalInfo?.emergencyContact,
                        occupation: e.target.value
                      }
                    })}
                  />
                </div>
 
                <Separator />
 
                <div className="space-y-4">
                  <h4 className="font-medium">Doctor Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormText
                      labelText="First Name"
                      placeholder="Enter doctor's first name"
                      value={formData.medicalInfo?.doctorInfo?.firstName || ""}
                      onChange={(e) => handleInputChange('medicalInfo', {
                        ...formData.medicalInfo,
                        doctorInfo: {
                          ...formData.medicalInfo?.doctorInfo,
                          firstName: e.target.value
                        }
                      })}
                    />
                    <FormText
                      labelText="Last Name"
                      placeholder="Enter doctor's last name"
                      value={formData.medicalInfo?.doctorInfo?.lastName || ""}
                      onChange={(e) => handleInputChange('medicalInfo', {
                        ...formData.medicalInfo,
                        doctorInfo: {
                          ...formData.medicalInfo?.doctorInfo,
                          lastName: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormPhoneInput
                      labelText="Phone"
                      value={formData.medicalInfo?.doctorInfo?.phone || ""}
                      onChange={(e) => handleInputChange('medicalInfo', {
                        ...formData.medicalInfo,
                        doctorInfo: {
                          ...formData.medicalInfo?.doctorInfo,
                          phone: e.target.value
                        }
                      })}
                      placeholder="Enter phone number"
                    />
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
                <ErrorBlock error={createStudentError} />
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