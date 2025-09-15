import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

interface StudentParentInfoFormProps {
  student: IStudent
  onSave: (updates: Partial<IUpdateStudentRequest>) => void
  onCancel: () => void
}

export function StudentParentInfoForm({ student, onSave, onCancel }: StudentParentInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fatherName: student.parentInfo?.fatherName || '',
    fatherPhone: student.parentInfo?.fatherPhone || '',
    fatherEmail: student.parentInfo?.fatherEmail || '',
    motherName: student.parentInfo?.motherName || '',
    motherPhone: student.parentInfo?.motherPhone || '',
    motherEmail: student.parentInfo?.motherEmail || '',
    guardianName: student.parentInfo?.guardianName || '',
    guardianPhone: student.parentInfo?.guardianPhone || '',
    guardianEmail: student.parentInfo?.guardianEmail || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: Partial<IUpdateStudentRequest> = {
        parentInfo: {
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone || undefined,
          fatherEmail: formData.fatherEmail || undefined,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone || undefined,
          motherEmail: formData.motherEmail || undefined,
          guardianName: formData.guardianName || undefined,
          guardianPhone: formData.guardianPhone || undefined,
          guardianEmail: formData.guardianEmail || undefined,
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
          {/* Father's Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Father's Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fatherName">Name *</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Father's name"
                />
              </div>
              <div>
                <Label htmlFor="fatherPhone">Phone</Label>
                <Input
                  id="fatherPhone"
                  value={formData.fatherPhone}
                  onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                  placeholder="Father's phone"
                />
              </div>
              <div>
                <Label htmlFor="fatherEmail">Email</Label>
                <Input
                  id="fatherEmail"
                  type="email"
                  value={formData.fatherEmail}
                  onChange={(e) => handleInputChange('fatherEmail', e.target.value)}
                  placeholder="Father's email"
                />
              </div>
            </div>
          </div>

          {/* Mother's Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Mother's Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="motherName">Name *</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Mother's name"
                />
              </div>
              <div>
                <Label htmlFor="motherPhone">Phone</Label>
                <Input
                  id="motherPhone"
                  value={formData.motherPhone}
                  onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                  placeholder="Mother's phone"
                />
              </div>
              <div>
                <Label htmlFor="motherEmail">Email</Label>
                <Input
                  id="motherEmail"
                  type="email"
                  value={formData.motherEmail}
                  onChange={(e) => handleInputChange('motherEmail', e.target.value)}
                  placeholder="Mother's email"
                />
              </div>
            </div>
          </div>

          {/* Guardian's Information */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Guardian's Information (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guardianName">Name</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  placeholder="Guardian's name"
                />
              </div>
              <div>
                <Label htmlFor="guardianPhone">Phone</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                  placeholder="Guardian's phone"
                />
              </div>
              <div>
                <Label htmlFor="guardianEmail">Email</Label>
                <Input
                  id="guardianEmail"
                  type="email"
                  value={formData.guardianEmail}
                  onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                  placeholder="Guardian's email"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}