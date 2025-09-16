import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

// Constants for form options
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

// Import form components
import {
  FormText,
  FormPhoneInput,
  FormSelect,
} from "@/components/ui/form/form-components"

interface StudentParentInfoFormProps {
  student: IStudent
  onSave: (updates: Partial<IUpdateStudentRequest>) => void
  onCancel: () => void
}

export function StudentParentInfoForm({ student, onSave, onCancel }: StudentParentInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fatherFirstName: student.parentInfo?.fatherFirstName || '',
    fatherLastName: student.parentInfo?.fatherLastName || '',
    fatherPhone: student.parentInfo?.fatherPhone || '',
    fatherEmail: student.parentInfo?.fatherEmail || '',
    fatherOccupation: student.parentInfo?.fatherOccupation || '',
    motherFirstName: student.parentInfo?.motherFirstName || '',
    motherLastName: student.parentInfo?.motherLastName || '',
    motherPhone: student.parentInfo?.motherPhone || '',
    motherEmail: student.parentInfo?.motherEmail || '',
    motherOccupation: student.parentInfo?.motherOccupation || '',
    guardianFirstName: student.parentInfo?.guardianFirstName || '',
    guardianLastName: student.parentInfo?.guardianLastName || '',
    guardianPhone: student.parentInfo?.guardianPhone || '',
    guardianEmail: student.parentInfo?.guardianEmail || '',
    guardianOccupation: student.parentInfo?.guardianOccupation || '',
    guardianRelation: student.parentInfo?.guardianRelation || '',
    guardianCustomRelation: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: Partial<IUpdateStudentRequest> = {
        parentInfo: {
          fatherFirstName: formData.fatherFirstName,
          fatherLastName: formData.fatherLastName,
          fatherPhone: formData.fatherPhone || undefined,
          fatherEmail: formData.fatherEmail || undefined,
          fatherOccupation: formData.fatherOccupation || undefined,
          motherFirstName: formData.motherFirstName,
          motherLastName: formData.motherLastName,
          motherPhone: formData.motherPhone || undefined,
          motherEmail: formData.motherEmail || undefined,
          motherOccupation: formData.motherOccupation || undefined,
          guardianFirstName: formData.guardianFirstName || undefined,
          guardianLastName: formData.guardianLastName || undefined,
          guardianPhone: formData.guardianPhone || undefined,
          guardianEmail: formData.guardianEmail || undefined,
          guardianOccupation: formData.guardianOccupation || undefined,
          guardianRelation: formData.guardianRelation || undefined,
          guardianCustomRelation: formData.guardianCustomRelation || undefined,
        },
      }

      onSave(updates)
    } catch (error) {
      console.error('Failed to save parent info:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Parent Information</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Father's Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Father&apos;s Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <FormText
                labelText="First Name *"
                id="fatherFirstName"
                name="fatherFirstName"
                value={formData.fatherFirstName}
                onChange={(e) => handleInputChange('fatherFirstName', String(e.target.value))}
                placeholder="Father's first name"
                required
              />
              <FormText
                labelText="Last Name *"
                id="fatherLastName"
                name="fatherLastName"
                value={formData.fatherLastName}
                onChange={(e) => handleInputChange('fatherLastName', String(e.target.value))}
                placeholder="Father's last name"
                required
              />
              <FormPhoneInput
                labelText="Phone"
                id="fatherPhone"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={(e) => handleInputChange('fatherPhone', String(e.target.value))}
                placeholder="Father's phone"
              />
              <FormText
                labelText="Email"
                id="fatherEmail"
                name="fatherEmail"
                type="email"
                value={formData.fatherEmail}
                onChange={(e) => handleInputChange('fatherEmail', String(e.target.value))}
                placeholder="Father's email"
              />
              <FormText
                labelText="Occupation"
                id="fatherOccupation"
                name="fatherOccupation"
                value={formData.fatherOccupation}
                onChange={(e) => handleInputChange('fatherOccupation', String(e.target.value))}
                placeholder="Father's occupation"
              />
            </div>
          </div>

          {/* Mother's Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Mother&apos;s Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <FormText
                labelText="First Name *"
                id="motherFirstName"
                name="motherFirstName"
                value={formData.motherFirstName}
                onChange={(e) => handleInputChange('motherFirstName', String(e.target.value))}
                placeholder="Mother's first name"
                required
              />
              <FormText
                labelText="Last Name *"
                id="motherLastName"
                name="motherLastName"
                value={formData.motherLastName}
                onChange={(e) => handleInputChange('motherLastName', String(e.target.value))}
                placeholder="Mother's last name"
                required
              />
              <FormPhoneInput
                labelText="Phone"
                id="motherPhone"
                name="motherPhone"
                value={formData.motherPhone}
                onChange={(e) => handleInputChange('motherPhone', String(e.target.value))}
                placeholder="Mother's phone"
              />
              <FormText
                labelText="Email"
                id="motherEmail"
                name="motherEmail"
                type="email"
                value={formData.motherEmail}
                onChange={(e) => handleInputChange('motherEmail', String(e.target.value))}
                placeholder="Mother's email"
              />
              <FormText
                labelText="Occupation"
                id="motherOccupation"
                name="motherOccupation"
                value={formData.motherOccupation}
                onChange={(e) => handleInputChange('motherOccupation', String(e.target.value))}
                placeholder="Mother's occupation"
              />
            </div>
          </div>

          {/* Guardian's Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Guardian&apos;s Information (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormText
                labelText="First Name"
                id="guardianFirstName"
                name="guardianFirstName"
                value={formData.guardianFirstName}
                onChange={(e) => handleInputChange('guardianFirstName', String(e.target.value))}
                placeholder="Guardian's first name"
              />
              <FormText
                labelText="Last Name"
                id="guardianLastName"
                name="guardianLastName"
                value={formData.guardianLastName}
                onChange={(e) => handleInputChange('guardianLastName', String(e.target.value))}
                placeholder="Guardian's last name"
              />
              <FormPhoneInput
                labelText="Phone"
                id="guardianPhone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => handleInputChange('guardianPhone', String(e.target.value))}
                placeholder="Guardian's phone"
              />
              <FormText
                labelText="Email"
                id="guardianEmail"
                name="guardianEmail"
                type="email"
                value={formData.guardianEmail}
                onChange={(e) => handleInputChange('guardianEmail', String(e.target.value))}
                placeholder="Guardian's email"
              />
              <FormText
                labelText="Occupation"
                id="guardianOccupation"
                name="guardianOccupation"
                value={formData.guardianOccupation}
                onChange={(e) => handleInputChange('guardianOccupation', String(e.target.value))}
                placeholder="Guardian's occupation"
              />
              <div className="space-y-2">
                <FormSelect
                  labelText="Relation"
                  id="guardianRelation"
                  name="guardianRelation"
                  options={relationOptions}
                  value={formData.guardianRelation}
                  onChange={(e) => handleInputChange('guardianRelation', String(e.target.value))}
                  placeholder="Select relation"
                />
                {formData.guardianRelation === 'other' && (
                  <FormText
                    labelText="Specify Relation"
                    id="guardianRelationOther"
                    name="guardianRelationOther"
                    value={formData.guardianCustomRelation}
                    onChange={(e) => handleInputChange('guardianCustomRelation', String(e.target.value))}
                    placeholder="Specify the relation"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              size="sm"
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
        </form>
      </CardContent>
    </Card>
  )
}