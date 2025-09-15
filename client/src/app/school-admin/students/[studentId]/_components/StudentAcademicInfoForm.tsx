import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

interface StudentAcademicInfoFormProps {
   student: IStudent
   onSave: (updates: Partial<IUpdateStudentRequest>) => void
   onCancel: () => void
}

export function StudentAcademicInfoForm({ student, onSave, onCancel }: StudentAcademicInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    gradeCode: student.gradeCode || '',
    streamSection: student.streamSection || '',
    enrollmentType: student.enrollmentType || 'regular',
    status: student.status || 'active',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updates: Partial<IUpdateStudentRequest> = {
      gradeCode: formData.gradeCode,
      streamSection: formData.streamSection,
      enrollmentType: formData.enrollmentType as 'regular' | 'special_needs' | 'gifted' | 'international' | 'transfer',
      status: formData.status as 'active' | 'inactive' | 'graduated' | 'transferred' | 'withdrawn' | 'suspended',
    }

    onSave(updates)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Academic Information</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gradeCode">Grade Code</Label>
              <Input
                id="gradeCode"
                value={formData.gradeCode}
                onChange={(e) => handleInputChange('gradeCode', e.target.value)}
                placeholder="e.g., JSS1, SSS2"
              />
            </div>
            <div>
              <Label htmlFor="streamSection">Stream/Section</Label>
              <Input
                id="streamSection"
                value={formData.streamSection}
                onChange={(e) => handleInputChange('streamSection', e.target.value)}
                placeholder="e.g., A, B, Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="enrollmentType">Enrollment Type</Label>
              <Select value={formData.enrollmentType} onValueChange={(value) => handleInputChange('enrollmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select enrollment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="special_needs">Special Needs</SelectItem>
                  <SelectItem value="gifted">Gifted</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}