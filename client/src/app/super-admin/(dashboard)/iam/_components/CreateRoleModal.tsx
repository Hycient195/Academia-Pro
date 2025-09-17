"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { FormText, FormTextArea } from "@/components/ui/form/form-components"
import apis from "@/redux/api"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import ErrorToast from "@/components/utilities/ErrorToast"
import { toast } from "sonner"
import type { IPermission } from '@academia-pro/types/super-admin'

interface Permission {
  id: string
  name: string
  description: string
}

interface CreateRoleModalProps {
  defaultPermissions: IPermission[]
  onRoleCreated?: () => void
}

export function CreateRoleModal({ defaultPermissions, onRoleCreated }: CreateRoleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedPermissions: [] as string[],
    searchTerm: ""
  })

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [createRole, { isLoading, error: createRoleError }] = apis.superAdmin.iam.useCreateRoleMutation()

  // Filter and sort permissions based on search term
  const filteredAndSortedPermissions = defaultPermissions
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

  const handleCreateRole = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a role name")
      return
    }

    if (formData.selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    const roleData = {
      name: formData.name.trim(),
      description: formData.description.trim() || '',
      permissions: formData.selectedPermissions
    }

    createRole(roleData)
    .unwrap()
    .then(() => {
      toast.success("Role created successfully!")

      // Reset form
      setFormData({
        name: "",
        description: "",
        selectedPermissions: [],
        searchTerm: ""
      })
      setIsCreateDialogOpen(false)
      onRoleCreated?.()
    })
    .catch((err) => {
      console.error(err)
      toast.error("Failed to create role.", { description: <ErrorToast error={createRoleError} /> })
    })
    .finally(() => {
      // Cleanup actions if needed
    })
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions that can be assigned to delegated accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Role Details Section */}
          <div className="flex flex-col gap-4">
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
        <ErrorBlock error={createRoleError} />
        <DialogFooter>
          <Button onClick={handleCreateRole} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}