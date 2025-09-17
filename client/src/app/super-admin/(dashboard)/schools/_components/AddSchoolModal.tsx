"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FormCountrySelect, FormRegionSelect, FormSelect, FormText, FormTextArea, FormPhoneInput, FormMultiSelect } from "@/components/ui/form/form-components"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import ErrorToast from "@/components/utilities/ErrorToast"
import apis from "@/redux/api"
import { ICreateSchoolRequest, IUpdateSchoolRequest, ISuperAdminSchool } from "@academia-pro/types/super-admin"
import { toast } from "sonner"

interface AddSchoolModalProps {
  mode: 'add' | 'edit'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  schoolData?: ISuperAdminSchool | null
  onSuccess?: () => void
}

export default function AddSchoolModal({ mode, isOpen, onOpenChange, schoolData, onSuccess }: AddSchoolModalProps) {
  const [createSchool, { isLoading: isCreating, error: createSchoolError }] = apis.superAdmin.schools.useCreateSchoolMutation()
  const [updateSchool, { isLoading: isUpdating, error: updateError }] = apis.superAdmin.schools.useUpdateSchoolMutation()

  const [formData, setFormData] = useState<{
    name: string;
    type: string[];
    address: string;
    city: string;
    state: string;
    country: string;
    email: string;
    phone: string;
    subscriptionPlan: string;
  }>(
    mode === 'add' ? {
      name: '',
      type: [],
      address: '',
      city: '',
      state: '',
      country: '',
      email: '',
      phone: '',
      subscriptionPlan: ''
    } : {
      name: schoolData?.name || '',
      type: schoolData?.type || [],
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
        type: schoolData.type || [],
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
      const apiData = {
        ...formData,
      }
      createSchool(apiData as ICreateSchoolRequest)
        .unwrap()
        .then(() => {
          toast.success(`School ${formData.name} created successfully!`)
          resetForm()
          onOpenChange(false)
          onSuccess?.()
        })
        .catch((err) => {
          console.error(err)
          toast.error("Failed to create school.", { description: <ErrorToast error={createSchoolError} /> })
        })
        .finally(() => {
          // Cleanup actions if needed
        })
    } else {
      if (!schoolData) {
        toast.error("School data not found");
        return
      }

      updateSchool({
        id: schoolData.id,
        updates: formData as IUpdateSchoolRequest
      })
      .unwrap()
      .then(() => {
        toast.success(`School ${formData.name} updated successfully!`)
        onOpenChange(false)
        onSuccess?.()
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to update school.", { description: <ErrorToast error={updateError} /> })
      })
      .finally(() => {
        // Cleanup actions if needed
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: [],
      address: '',
      city: '',
      state: '',
      country: '',
      email: '',
      phone: '',
      subscriptionPlan: ''
    })
  }

  const updateFormData = (field: string, value: string | string[]) => {
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
            <FormMultiSelect
              labelText="School Types *"
              placeholder="Select school types"
              options={[
                { text: "Pre School", value: "preschool" },
                { text: "Elementary", value: "elementary" },
                { text: "Middle School", value: "middle_school" },
                { text: "High School", value: "high_school" },
                { text: "Senior Secondary", value: "senior_secondary" },
                { text: "University", value: "university" },
                { text: "College", value: "college" },
                { text: "Institute", value: "institute" },
                { text: "Training Center", value: "training_center" },
                { text: "Primary", value: "primary" },
                { text: "Secondary", value: "secondary" },
                { text: "Mixed", value: "mixed" },
              ]}
              value={formData.type}
              onChange={(arg) => {
                if ('target' in arg) {
                  updateFormData('type', arg.target.value)
                } else {
                  updateFormData('type', arg as string[])
                }
              }}
              maxSelection={3}
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
              onChange={(arg) => {
                if ('target' in arg) {
                  updateFormData('country', arg.target.value as string)
                } else {
                  updateFormData('country', arg as string)
                }
              }}
              placeholder="Country"
            />
            <FormRegionSelect
              countryCode={formData.country || ''}
              id="state"
              value={formData.state || ''}
              labelText="State *"
              onChange={(arg) => {
                if ('target' in arg) {
                  updateFormData('state', arg.target.value as string)
                } else {
                  updateFormData('state', arg as string)
                }
              }}
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
        <ErrorBlock error={createSchoolError || updateError} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {(isCreating||isUpdating) ? 'Saving...' : mode === 'add' ? 'Create School' : 'Update School'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}