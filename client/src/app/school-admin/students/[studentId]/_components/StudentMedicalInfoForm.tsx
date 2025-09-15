import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2, Plus, Trash2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

// Import form components
import {
  FormText,
  FormSelect,
  FormMultiSelect,
} from "@/components/ui/form/form-components"

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

const allergyOptions = [
  { value: "peanuts", text: "Peanuts" },
  { value: "shellfish", text: "Shellfish" },
  { value: "dairy", text: "Dairy" },
  { value: "eggs", text: "Eggs" },
  { value: "soy", text: "Soy" },
  { value: "wheat", text: "Wheat" },
  { value: "tree_nuts", text: "Tree Nuts" },
  { value: "fish", text: "Fish" },
  { value: "sesame", text: "Sesame" },
]

const medicationOptions = [
  { value: "aspirin", text: "Aspirin" },
  { value: "ibuprofen", text: "Ibuprofen" },
  { value: "acetaminophen", text: "Acetaminophen" },
  { value: "antihistamine", text: "Antihistamine" },
  { value: "cough_syrup", text: "Cough Syrup" },
]

const conditionOptions = [
  { value: "asthma", text: "Asthma" },
  { value: "diabetes", text: "Diabetes" },
  { value: "adhd", text: "ADHD" },
  { value: "epilepsy", text: "Epilepsy" },
  { value: "anemia", text: "Anemia" },
  { value: "hypertension", text: "Hypertension" },
]

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface DoctorInfo {
  name: string;
  phone: string;
  clinic: string;
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
      name: student.medicalInfo?.emergencyContact?.name || '',
      phone: student.medicalInfo?.emergencyContact?.phone || '',
      relationship: student.medicalInfo?.emergencyContact?.relationship || '',
    },
    doctorInfo: {
      name: student.medicalInfo?.doctorInfo?.name || '',
      phone: student.medicalInfo?.doctorInfo?.phone || '',
      clinic: student.medicalInfo?.doctorInfo?.clinic || '',
    },
    insuranceInfo: {
      provider: student.medicalInfo?.insuranceInfo?.provider || '',
      policyNumber: student.medicalInfo?.insuranceInfo?.policyNumber || '',
      coverageAmount: student.medicalInfo?.insuranceInfo?.coverageAmount || 0,
    },
  })

  const handleMultiSelectChange = (field: 'allergies' | 'medications' | 'conditions', values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
    }))
  }

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
            name: formData.emergencyContact.name,
            phone: formData.emergencyContact.phone,
            relationship: formData.emergencyContact.relationship,
          },
          doctorInfo: formData.doctorInfo.name ? formData.doctorInfo : undefined,
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
            <Label className="text-sm font-medium mb-3 block">Basic Information</Label>
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
          <FormMultiSelect
            labelText="Allergies"
            value={formData.allergies}
            options={allergyOptions}
            onChange={(arg) => handleMultiSelectChange('allergies', (arg as { target: { value: string[] } }).target.value)}
            placeholder="Select allergies"
          />

          {/* Medications */}
          <FormMultiSelect
            labelText="Medications"
            value={formData.medications}
            options={medicationOptions}
            onChange={(arg) => handleMultiSelectChange('medications', (arg as { target: { value: string[] } }).target.value)}
            placeholder="Select medications"
          />

          {/* Medical Conditions */}
          <FormMultiSelect
            labelText="Medical Conditions"
            value={formData.conditions}
            options={conditionOptions}
            onChange={(arg) => handleMultiSelectChange('conditions', (arg as { target: { value: string[] } }).target.value)}
            placeholder="Select medical conditions"
          />

          {/* Emergency Contact */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Emergency Contact</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergencyName">Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                  placeholder="Contact phone"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelationship">Relationship</Label>
                <Input
                  id="emergencyRelationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                  placeholder="e.g., Parent, Guardian"
                />
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Doctor Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  value={formData.doctorInfo.name}
                  onChange={(e) => handleNestedInputChange('doctorInfo', 'name', e.target.value)}
                  placeholder="Doctor's name"
                />
              </div>
              <div>
                <Label htmlFor="doctorPhone">Phone</Label>
                <Input
                  id="doctorPhone"
                  value={formData.doctorInfo.phone}
                  onChange={(e) => handleNestedInputChange('doctorInfo', 'phone', e.target.value)}
                  placeholder="Doctor's phone"
                />
              </div>
              <div>
                <Label htmlFor="doctorClinic">Clinic</Label>
                <Input
                  id="doctorClinic"
                  value={formData.doctorInfo.clinic}
                  onChange={(e) => handleNestedInputChange('doctorInfo', 'clinic', e.target.value)}
                  placeholder="Clinic name"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Insurance Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="insuranceProvider">Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={formData.insuranceInfo.provider}
                  onChange={(e) => handleNestedInputChange('insuranceInfo', 'provider', e.target.value)}
                  placeholder="Insurance provider"
                />
              </div>
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={formData.insuranceInfo.policyNumber}
                  onChange={(e) => handleNestedInputChange('insuranceInfo', 'policyNumber', e.target.value)}
                  placeholder="Policy number"
                />
              </div>
              <div>
                <Label htmlFor="coverageAmount">Coverage Amount</Label>
                <Input
                  id="coverageAmount"
                  type="number"
                  value={formData.insuranceInfo.coverageAmount}
                  onChange={(e) => handleNestedInputChange('insuranceInfo', 'coverageAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Coverage amount"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}