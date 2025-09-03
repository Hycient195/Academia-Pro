"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FormCountrySelect, FormRegionSelect, FormSelect, FormText, FormTextArea, FormPhoneInput } from "@/components/ui/form-components"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import { apis, type ICreateSchoolRequest, type IUpdateSchoolRequest, type ISuperAdminSchool } from "@/redux/api"
import { toast } from "sonner"

interface AddSchoolModalProps {
  mode: 'add' | 'edit'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  schoolData?: ISuperAdminSchool | null
  onSuccess?: () => void
}

export default function AddSchoolModal({ mode, isOpen, onOpenChange, schoolData, onSuccess }: AddSchoolModalProps) {
  const [createSchool, { isLoading: isCreating, error: createSchoolError }] = apis.superAdmin.useCreateSchoolMutation()
  const [updateSchool] = apis.superAdmin.useUpdateSchoolMutation()

  const [formData, setFormData] = useState<ICreateSchoolRequest | IUpdateSchoolRequest>(
    mode === 'add' ? {
      name: '',
      type: '',
      address: '',
      city: '',
      state: '',
      country: '',
      email: '',
      phone: '',
      subscriptionPlan: ''
    } : {
      name: schoolData?.name || '',
      type: schoolData?.type || '',
      address: schoolData?.address || '',
      city: schoolData?.city || '',
      state: schoolData?.state || '',
      country: schoolData?.country || '',
      email: schoolData?.email || '',
      phone: schoolData?.phone || '',
      subscriptionPlan: schoolData?.subscriptionPlan || ''
    }
  )

  // Update form data when schoolData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && schoolData && isOpen) {
      setFormData({
        name: schoolData.name || '',
        type: schoolData.type || '',
        address: schoolData.address || '',
        city: schoolData.city || '',
        state: schoolData.state || '',
        country: schoolData.country || '',
        email: schoolData.email || '',
        phone: schoolData.phone || '',
        subscriptionPlan: schoolData.subscriptionPlan || ''
      })
    }
  }, [mode, schoolData, isOpen])

  const handleSubmit = async () => {
    if (mode === 'add') {
      createSchool(formData as ICreateSchoolRequest)
        .unwrap()
        .then(() => {
          toast.success(`School ${formData.name} created successfully!`)
          resetForm()
          onOpenChange(false)
          onSuccess?.()
        })
        .catch((error) => {
          toast.error(`Failed to create school: ${error.message}`)
        })
    } else {
      if (!schoolData) {
        toast.error("School data not found");
        return
      }
      updateSchool({
        schoolId: schoolData.id,
        updates: formData as IUpdateSchoolRequest
      }).unwrap()
      .then(() => {
        toast.success(`School ${formData.name} updated successfully!`)
        onOpenChange(false)
        onSuccess?.()
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        toast.error(`Failed to update school: ${errorMessage}`)
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      address: '',
      city: '',
      state: '',
      country: '',
      email: '',
      phone: '',
      subscriptionPlan: ''
    })
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New School' : 'Edit School'}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a new school in the Academia Pro system. Fill in the required information below.'
              : `Update school information for ${schoolData?.name}`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormText
              labelText="School Name *"
              placeholder="Enter school name"
              value={formData.name || ''}
              onChange={(arg) => {
                if ('nativeEvent' in arg) {
                  updateFormData('name', arg.target.value)
                } else {
                  updateFormData('name', arg.target.value as string)
                }
              }}
              required
            />
            <FormSelect
              labelText="School Type *"
              placeholder="Select type"
              options={[
                { text: "Pre School", value: "preschool" },
                { text: "Elementary", value: "elementary" },
                { text: "Primary School", value: "primary_school" },
                { text: "Secondary School", value: "secondary_school" },
                { text: "Institute", value: "institute" },
                { text: "Training Center", value: "training_center" },
              ]}
              value={formData.type || ''}
              onChange={(arg) => updateFormData('type', arg.target.value as string)}
              required
            />
          </div>

          <FormTextArea
            labelText="Address *"
            id="address"
            value={formData.address || ''}
            onChange={(arg) => {
              if ('nativeEvent' in arg) {
                updateFormData('address', arg.target.value)
              } else {
                updateFormData('address', arg.target.value as string)
              }
            }}
            placeholder="Enter school address"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <FormCountrySelect
              labelText="Country *"
              showFlag
              id="country"
              value={formData.country || ''}
              onChange={(arg) => updateFormData('country', arg.target.value as string)}
              placeholder="Country"
            />
            <FormRegionSelect
              countryCode={formData.country || ''}
              id="state"
              value={formData.state || ''}
              labelText="State *"
              onChange={(arg) => updateFormData('state', arg.target.value as string)}
              placeholder="State"
            />
            <FormText
              labelText="City *"
              id="city"
              value={formData.city || ''}
              onChange={(arg) => {
                if ('nativeEvent' in arg) {
                  updateFormData('city', arg.target.value)
                } else {
                  updateFormData('city', arg.target.value as string)
                }
              }}
              placeholder="City"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormText
              labelText="Email *"
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(arg) => {
                if ('nativeEvent' in arg) {
                  updateFormData('email', arg.target.value)
                } else {
                  updateFormData('email', arg.target.value as string)
                }
              }}
              placeholder="school@example.com"
              required
            />
            <FormPhoneInput
              labelText="Phone *"
              id="phone"
              value={formData.phone || ''}
              onChange={(arg) => updateFormData('phone', arg.target.value as string)}
              placeholder="+1-555-0123"
              required
            />
          </div>

          <FormSelect
            labelText="Subscription Plan *"
            value={formData.subscriptionPlan || ''}
            onChange={(arg) => updateFormData('subscriptionPlan', arg.target.value as string)}
            options={[
              { value: "basic", text: "Basic" },
              { value: "premium", text: "Premium" },
              { value: "enterprise", text: "Enterprise" }
            ]}
            placeholder="Select plan"
            required
          />
        </div>
        <ErrorBlock error={createSchoolError} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Saving...' : mode === 'add' ? 'Create School' : 'Update School'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}