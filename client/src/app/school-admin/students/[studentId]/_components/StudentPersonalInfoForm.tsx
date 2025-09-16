import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

// Import form components
import {
  FormText,
} from "@/components/ui/form/form-components"

interface StudentPersonalInfoFormProps {
   student: IStudent
   onSave: (updates: Partial<IUpdateStudentRequest>) => void
   onCancel: () => void
}

export function StudentPersonalInfoForm({ student, onSave, onCancel }: StudentPersonalInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: student.firstName || '',
    middleName: student.middleName || '',
    lastName: student.lastName || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: Partial<IUpdateStudentRequest> = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
      }

      onSave(updates)
    } catch (error) {
      console.error('Failed to save personal info:', error)
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
        <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormText
              labelText="First Name"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', String(e.target.value))}
              placeholder="Enter first name"
            />
            <FormText
              labelText="Middle Name"
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={(e) => handleInputChange('middleName', String(e.target.value))}
              placeholder="Enter middle name"
            />
            <FormText
              labelText="Last Name"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', String(e.target.value))}
              placeholder="Enter last name"
            />
          </div>


        </form>
      </CardContent>
    </Card>
  )
}