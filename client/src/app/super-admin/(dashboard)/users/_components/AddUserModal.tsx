"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormSelect, FormText, FormPhoneInput } from "@/components/ui/form-components"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import { apis } from "@/redux/api"
import { ISuperAdminUser } from "@academia-pro/types/super-admin"
import { EUserRole, EUserStatus } from "@academia-pro/types/users"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { toast } from "sonner"

interface AddUserModalProps {
  mode: 'add' | 'edit'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userData?: ISuperAdminUser | null
  onSuccess?: () => void
}

export default function AddUserModal({ mode, isOpen, onOpenChange, userData, onSuccess }: AddUserModalProps) {
  const [createUser, { isLoading: isCreating, error: createUserError }] = apis.superAdmin.useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating, error: updateError }] = apis.superAdmin.useUpdateUserMutation()
  const { data: schoolsData } = apis.superAdmin.useGetAllSchoolsQuery({})

  const schools = schoolsData?.data || []

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    role: EUserRole;
    schoolId?: string;
    status: EUserStatus;
  }>(
    mode === 'add' ? {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      role: 'student' as EUserRole,
      schoolId: 'none',
      status: 'active' as EUserStatus
    } : {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      middleName: userData?.middleName || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      role: userData?.role || 'student' as EUserRole,
      schoolId: userData?.schoolId || 'none',
      status: userData?.status || 'active' as EUserStatus
    }
  )

  // Update form data when userData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && userData && isOpen) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        middleName: userData.middleName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'student' as EUserRole,
        schoolId: userData.schoolId || 'none',
        status: userData.status || 'active' as EUserStatus
      })
    }
  }, [mode, userData, isOpen])

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    if (mode === 'add') {
      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        schoolId: formData.schoolId === 'none' ? undefined : formData.schoolId,
        status: formData.status
      }
      createUser(apiData)
        .unwrap()
        .then(() => {
          toast.success(`User ${formData.firstName} ${formData.lastName} created successfully!`)
          resetForm()
          onOpenChange(false)
          onSuccess?.()
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          toast.error(`Failed to create user: ${errorMessage}`)
        })
    } else {
      if (!userData) {
        toast.error("User data not found");
        return
      }
      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        schoolId: formData.schoolId === 'none' ? undefined : formData.schoolId,
        status: formData.status
      }
      updateUser({
        userId: userData.id,
        updates: apiData
      }).unwrap()
      .then(() => {
        toast.success(`User ${formData.firstName} ${formData.lastName} updated successfully!`)
        onOpenChange(false)
        onSuccess?.()
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        toast.error(`Failed to update user: ${errorMessage}`)
      })
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      role: 'student' as EUserRole,
      schoolId: 'none',
      status: 'active' as EUserStatus
    })
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a new user in the Academia Pro system. Fill in the required information below.'
              : `Update user information for ${userData?.firstName} ${userData?.middleName ? userData.middleName + ' ' : ''}${userData?.lastName}`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
            <FormText
              labelText="First Name *"
              placeholder="Enter first name"
              value={formData.firstName || ''}
              onChange={(arg) => updateFormData('firstName', arg.target.value as string)}
              required
            />
            <FormText
              labelText="Last Name *"
              placeholder="Enter last name"
              value={formData.lastName || ''}
              onChange={(arg) => updateFormData('lastName', arg.target.value as string)}
              required
            />
            <FormText
              labelText="Middle Name"
              placeholder="Enter middle name"
              value={formData.middleName || ''}
              onChange={(arg) => updateFormData('middleName', arg.target.value as string)}
            />
          </div>

          <FormText
            labelText="Email *"
            type="email"
            placeholder="user@example.com"
            value={formData.email || ''}
            onChange={(arg) => updateFormData('email', arg.target.value as string)}
            required
          />

          <FormPhoneInput
            labelText="Phone"
            value={formData.phone || ''}
            onChange={(arg) => updateFormData('phone', arg.target.value as string)}
            placeholder="+1-555-0123"
          />

          <FormSelect
            labelText="Role *"
            value={formData.role || ''}
            onChange={(arg) => updateFormData('role', arg.target.value as EUserRole)}
            options={[
              { value: "super-admin", text: "Super Admin" },
              { value: "school-admin", text: "School Admin" },
              { value: "teacher", text: "Teacher" },
              { value: "student", text: "Student" },
              { value: "parent", text: "Parent" }
            ]}
            placeholder="Select role"
            required
          />

          <FormSelect
            labelText="School (Optional)"
            value={formData.schoolId || 'none'}
            onChange={(arg) => updateFormData('schoolId', arg.target.value as string)}
            options={[
              { value: "none", text: "No school assignment" },
              ...schools.map(school => ({ value: school.id, text: school.name }))
            ]}
            placeholder="Select school"
          />

          <FormSelect
            labelText="Status *"
            value={formData.status || ''}
            onChange={(arg) => updateFormData('status', arg.target.value as EUserStatus)}
            options={[
              { value: "active", text: "Active" },
              { value: "inactive", text: "Inactive" },
              { value: "suspended", text: "Suspended" }
            ]}
            placeholder="Select status"
            required
          />
        </div>
        {(createUserError || updateError) && <ErrorBlock error={(createUserError || updateError) as FetchBaseQueryError} />}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) ? 'Saving...' : mode === 'add' ? 'Create User' : 'Update User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}