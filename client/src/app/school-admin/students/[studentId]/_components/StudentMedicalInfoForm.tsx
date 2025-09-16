import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2, Plus, Trash2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

// Import form components
import {
  FormText,
  FormSelect,
  FormPhoneInput,
  FormNumberInput,
} from "@/components/ui/form/form-components"

// Import multi text input
import FormMultiTextInput from "@/components/ui/form/FormMultiTextInput"

// Constants for form options
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

interface EmergencyContact {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  relation: string;
  occupation: string;
  customRelation: string;
}

interface DoctorInfo {
  firstName: string;
  lastName: string;
  phone: string;
  clinic: string;
  occupation: string;
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
}

interface StudentMedicalInfoFormProps {
  student: IStudent
  onSave: (updates: Partial<IUpdateStudentRequest>) => Promise<void>
  onCancel: () => void
}

export function StudentMedicalInfoForm({ student, onSave, onCancel }: StudentMedicalInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    bloodGroup: student.medicalInfo?.bloodGroup || '',
    allergies: student.medicalInfo?.allergies || [],
    medications: student.medicalInfo?.medications || [],
    conditions: student.medicalInfo?.conditions || [],
    emergencyContact: {
      firstName: student.medicalInfo?.emergencyContact?.firstName || '',
      lastName: student.medicalInfo?.emergencyContact?.lastName || '',
      phone: student.medicalInfo?.emergencyContact?.phone || '',
      email: student.medicalInfo?.emergencyContact?.email || '',
      relation: student.medicalInfo?.emergencyContact?.relation || '',
      occupation: student.medicalInfo?.emergencyContact?.occupation || '',
      customRelation: student.medicalInfo?.emergencyContact?.customRelation || '',
    },
    doctorInfo: {
      firstName: student.medicalInfo?.doctorInfo?.firstName || '',
      lastName: student.medicalInfo?.doctorInfo?.lastName || '',
      phone: student.medicalInfo?.doctorInfo?.phone || '',
      clinic: student.medicalInfo?.doctorInfo?.clinic || '',
    },
    insuranceInfo: {
      provider: student.medicalInfo?.insuranceInfo?.provider || '',
      policyNumber: student.medicalInfo?.insuranceInfo?.policyNumber || '',
      coverageAmount: student.medicalInfo?.insuranceInfo?.coverageAmount || 0,
    },
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: Partial<IUpdateStudentRequest> = {
        medicalInfo: {
          bloodGroup: formData.bloodGroup || undefined,
          allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
          medications: formData.medications.length > 0 ? formData.medications : undefined,
          conditions: formData.conditions.length > 0 ? formData.conditions : undefined,
          emergencyContact: {
            firstName: formData.emergencyContact.firstName,
            lastName: formData.emergencyContact.lastName,
            phone: formData.emergencyContact.phone,
            email: formData.emergencyContact.email,
            relation: formData.emergencyContact.relation,
            occupation: formData.emergencyContact.occupation,
            customRelation: formData.emergencyContact.customRelation,
          },
          doctorInfo: (formData.doctorInfo.firstName || formData.doctorInfo.lastName) ? {
            firstName: formData.doctorInfo.firstName,
            lastName: formData.doctorInfo.lastName,
            phone: formData.doctorInfo.phone,
            clinic: formData.doctorInfo.clinic,
          } : undefined,
          insuranceInfo: formData.insuranceInfo.provider ? formData.insuranceInfo : undefined,
        },
      }

      await onSave(updates)
    } catch (error) {
      console.error('Failed to save medical info:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (parent: 'emergencyContact' | 'doctorInfo' | 'insuranceInfo', field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const handleArrayAdd = (field: 'allergies' | 'medications' | 'conditions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const handleArrayRemove = (field: 'allergies' | 'medications' | 'conditions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleArrayChange = (field: 'allergies' | 'medications' | 'conditions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Medical Information</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Medical Info */}
          <div>
            <h3 className="text-sm font-medium mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                labelText="Blood Group"
                options={bloodGroupOptions}
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange('bloodGroup', String(e.target.value))}
                placeholder="Select blood group"
              />
            </div>
          </div>

          {/* Allergies */}
          <FormMultiTextInput
            labelText="Allergies"
            values={formData.allergies}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<Record<string, unknown>>>}
            propertyKey="allergies"
            placeholder="Add allergy"
          />

          {/* Medications */}
          <FormMultiTextInput
            labelText="Medications"
            values={formData.medications}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<Record<string, unknown>>>}
            propertyKey="medications"
            placeholder="Add medication"
          />

          {/* Medical Conditions */}
          <FormMultiTextInput
            labelText="Medical Conditions"
            values={formData.conditions}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<Record<string, unknown>>>}
            propertyKey="conditions"
            placeholder="Add medical condition"
          />

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-medium mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <FormText
                labelText="First Name"
                id="emergencyFirstName"
                name="emergencyFirstName"
                value={formData.emergencyContact.firstName}
                onChange={(e) => handleNestedInputChange('emergencyContact', 'firstName', String(e.target.value))}
                placeholder="First name"
              />
              <FormText
                labelText="Last Name"
                id="emergencyLastName"
                name="emergencyLastName"
                value={formData.emergencyContact.lastName}
                onChange={(e) => handleNestedInputChange('emergencyContact', 'lastName', String(e.target.value))}
                placeholder="Last name"
              />
              <FormPhoneInput
                labelText="Phone"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', String(e.target.value))}
                placeholder="Contact phone"
              />
              <div className="space-y-2">
                <FormSelect
                  labelText="Relationship"
                  id="emergencyRelation"
                  name="emergencyRelation"
                  options={relationOptions}
                  value={formData.emergencyContact.relation}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'relation', String(e.target.value))}
                  placeholder="Select relationship"
                />
                {formData.emergencyContact.relation === 'other' && (
                  <FormText
                    labelText="Specify Relationship"
                    id="emergencyRelationOther"
                    name="emergencyRelationOther"
                    value={formData.emergencyContact.customRelation}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'customRelation', String(e.target.value))}
                    placeholder="Specify the relationship"
                  />
                )}
              </div>
              <FormText
                labelText="Occupation"
                id="emergencyOccupation"
                name="emergencyOccupation"
                value={formData.emergencyContact.occupation}
                onChange={(e) => handleNestedInputChange('emergencyContact', 'occupation', String(e.target.value))}
                placeholder="Occupation"
              />
            </div>
          </div>

          {/* Doctor Information */}
          <div>
            <h3 className="text-sm font-medium mb-3">Doctor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <FormText
                labelText="First Name"
                id="doctorFirstName"
                name="doctorFirstName"
                value={formData.doctorInfo.firstName}
                onChange={(e) => handleNestedInputChange('doctorInfo', 'firstName', String(e.target.value))}
                placeholder="Doctor's first name"
              />
              <FormText
                labelText="Last Name"
                id="doctorLastName"
                name="doctorLastName"
                value={formData.doctorInfo.lastName}
                onChange={(e) => handleNestedInputChange('doctorInfo', 'lastName', String(e.target.value))}
                placeholder="Doctor's last name"
              />
              <FormPhoneInput
                labelText="Phone"
                id="doctorPhone"
                name="doctorPhone"
                value={formData.doctorInfo.phone}
                onChange={(e) => handleNestedInputChange('doctorInfo', 'phone', String(e.target.value))}
                placeholder="Doctor's phone"
              />
              <FormText
                labelText="Clinic"
                id="doctorClinic"
                name="doctorClinic"
                value={formData.doctorInfo.clinic}
                onChange={(e) => handleNestedInputChange('doctorInfo', 'clinic', String(e.target.value))}
                placeholder="Clinic name"
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <h3 className="text-sm font-medium mb-3">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormText
                labelText="Provider"
                id="insuranceProvider"
                name="insuranceProvider"
                value={formData.insuranceInfo.provider}
                onChange={(e) => handleNestedInputChange('insuranceInfo', 'provider', String(e.target.value))}
                placeholder="Insurance provider"
              />
              <FormText
                labelText="Policy Number"
                id="policyNumber"
                name="policyNumber"
                value={formData.insuranceInfo.policyNumber}
                onChange={(e) => handleNestedInputChange('insuranceInfo', 'policyNumber', String(e.target.value))}
                placeholder="Policy number"
              />
              <FormNumberInput
                labelText="Coverage Amount"
                id="coverageAmount"
                name="coverageAmount"
                value={formData.insuranceInfo.coverageAmount}
                onChange={(e) => handleNestedInputChange('insuranceInfo', 'coverageAmount', Number(e.target.value))}
                placeholder="Coverage amount"
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}