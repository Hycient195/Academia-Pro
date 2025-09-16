import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Loader2 } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"

interface StudentContactInfoFormProps {
   student: IStudent
   onSave: (updates: Partial<IUpdateStudentRequest>) => Promise<void> | void
   onCancel: () => void
}

export function StudentContactInfoForm({ student, onSave, onCancel }: StudentContactInfoFormProps) {
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [formData, setFormData] = useState({
    email: student.email || '',
    phone: student.phone || '',
    address: {
      street: student.address?.street || '',
      city: student.address?.city || '',
      state: student.address?.state || '',
      postalCode: student.address?.postalCode || '',
    },
    emergencyContact: {
      firstName: student.medicalInfo?.emergencyContact?.firstName || '',
      lastName: student.medicalInfo?.emergencyContact?.lastName || '',
      phone: student.medicalInfo?.emergencyContact?.phone || '',
      email: student.medicalInfo?.emergencyContact?.email || '',
      relation: student.medicalInfo?.emergencyContact?.relation || '',
      occupation: student.medicalInfo?.emergencyContact?.occupation || '',
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: Partial<IUpdateStudentRequest> = {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        medicalInfo: {
          ...student.medicalInfo,
          emergencyContact: formData.emergencyContact,
        },
      }

      await onSave(updates)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
  }

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
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
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyFirstName">First Name</Label>
                <Input
                  id="emergencyFirstName"
                  value={formData.emergencyContact.firstName}
                  onChange={(e) => handleEmergencyContactChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyLastName">Last Name</Label>
                <Input
                  id="emergencyLastName"
                  value={formData.emergencyContact.lastName}
                  onChange={(e) => handleEmergencyContactChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="emergencyEmail">Email</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={formData.emergencyContact.email}
                  onChange={(e) => handleEmergencyContactChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyContact.relation}
                  onChange={(e) => handleEmergencyContactChange('relation', e.target.value)}
                  placeholder="e.g., Parent, Guardian"
                />
              </div>
              <div>
                <Label htmlFor="emergencyOccupation">Occupation</Label>
                <Input
                  id="emergencyOccupation"
                  value={formData.emergencyContact.occupation}
                  onChange={(e) => handleEmergencyContactChange('occupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}