"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconSearch, IconEdit } from "@tabler/icons-react"
import { FormText, FormTextArea } from "@/components/ui/form/form-components"
import apis from "@/redux/api"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import { toast } from "sonner"
import type { IRole, IPermission } from '@academia-pro/types/super-admin'

interface Permission {
  id: string
  name: string
  description: string
}

interface EditRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: IRole | null
  availablePermissions: IPermission[]
  onRoleUpdated?: () => void
}

export function EditRoleModal({ isOpen, onClose, role, availablePermissions, onRoleUpdated }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedPermissions: [] as string[],
    searchTerm: ""
  })

  const [updateRole, { error: updateRoleError }] = apis.superAdmin.iam.useUpdateRoleMutation()

  // Update form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
        selectedPermissions: role.permissions.map(p => p.name),
        searchTerm: ""
      })
    }
  }, [role])

  // Filter and sort permissions based on search term
  const filteredAndSortedPermissions = availablePermissions
    .filter(permission =>
      permission.name.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(formData.searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: checked
        ? [...prev.selectedPermissions, permissionName]
        : prev.selectedPermissions.filter((p: string) => p !== permissionName)
    }))
  }

  const handleUpdateRole = async () => {
    if (!role) return

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a role name")
      return
    }

    if (formData.selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    try {
      const roleData = {
        id: role.id,
        updates: {
          name: formData.name.trim(),
          description: formData.description.trim() || '',
          permissionIds: formData.selectedPermissions
        }
      }

      await updateRole(roleData).unwrap()

      toast.success("Role updated successfully!")
      onClose()
      onRoleUpdated?.()
    } catch (error) {
      console.error("Failed to update role:", error)
      toast.error("Failed to update role. Please try again.")
    }
  }

  if (!role) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconEdit className="mr-2 h-5 w-5" />
            Edit Role
          </DialogTitle>
          <DialogDescription>
            Update the role details and permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Role Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role Details</h3>
            <FormText
              labelText="Role Name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: String(e.target.value) }))}
              placeholder="e.g., SchoolManager"
              required
            />
            <FormTextArea
              labelText="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: String(e.target.value) }))}
              placeholder="Optional description of the role's purpose"
              rows={3}
            />
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>

            {/* Search Input */}
            <div className="relative">
              <FormText
                labelText=""
                placeholder="Search permissions..."
                value={formData.searchTerm}
                onChange={(e) => setFormData(prev => ({ ...prev, searchTerm: String(e.target.value) }))}
                className="pl-10"
              />
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
              <div className="grid gap-3">
                {filteredAndSortedPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.id}
                      checked={formData.selectedPermissions.includes(permission.name)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission.name, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ErrorBlock error={updateRoleError} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}