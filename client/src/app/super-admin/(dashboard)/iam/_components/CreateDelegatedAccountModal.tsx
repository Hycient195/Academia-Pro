"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { FormText, FormDateInput } from "@/components/ui/form-components"
import { FormUserSelect } from "@/components/ui/FormUserSelect"
import { apis } from "@/redux/api"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import { toast } from "sonner"

interface Permission {
  id: string
  name: string
  description: string
}

interface CreateDelegatedAccountModalProps {
  defaultPermissions: Permission[]
}

export function CreateDelegatedAccountModal({ defaultPermissions }: CreateDelegatedAccountModalProps) {
  const [formData, setFormData] = useState({
    selectedPermissions: [] as string[],
    isCreateMode: true, // true = create new user, false = select existing

    // For creating new user
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",

    // For selecting existing user
    selectedUserId: "",

    // Expiry options
    useStartDate: false,
    startDate: "",
    startTime: "",
    useEndDate: false,
    endDate: "",
    endTime: "",

    notes: "",
    searchTerm: ""
  })

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [createDelegatedAccount, { error: createDelegationError }] = apis.superAdmin.useCreateDelegatedAccountMutation()

  // Filter and sort permissions based on search term
  const filteredAndSortedPermissions = useMemo(() => {
    return defaultPermissions
      .filter(permission =>
        permission.name.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(formData.searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [defaultPermissions, formData.searchTerm])

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: checked
        ? [...prev.selectedPermissions, permissionName]
        : prev.selectedPermissions.filter((p: string) => p !== permissionName)
    }))
  }

  const handleCreateDelegatedAccount = async () => {
    // Validation
    if (formData.selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    if (formData.isCreateMode) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error("Please fill in all required fields for new user")
        return
      }
    } else {
      if (!formData.selectedUserId) {
        toast.error("Please select a user")
        return
      }
    }

    // No expiry date validation needed - accounts can be infinite if no end date is set

    try {
      const accountData = formData.isCreateMode ? {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        email: formData.email,
        permissions: formData.selectedPermissions,
        startDate: formData.useStartDate ? formData.startDate : undefined,
        startTime: formData.useStartDate ? formData.startTime : undefined,
        endDate: formData.useEndDate ? formData.endDate : undefined,
        endTime: formData.useEndDate ? formData.endTime : undefined,
        expiryDate: formData.useEndDate ? formData.endDate : undefined,
        notes: formData.notes || undefined,
      } : {
        userId: formData.selectedUserId,
        permissions: formData.selectedPermissions,
        startDate: formData.useStartDate ? formData.startDate : undefined,
        startTime: formData.useStartDate ? formData.startTime : undefined,
        endDate: formData.useEndDate ? formData.endDate : undefined,
        endTime: formData.useEndDate ? formData.endTime : undefined,
        expiryDate: formData.useEndDate ? formData.endDate : undefined,
        notes: formData.notes || undefined,
      }

      await createDelegatedAccount(accountData).unwrap()

      toast.success("Delegated account created successfully!")

      // Reset form
      setFormData({
        selectedPermissions: [],
        isCreateMode: true,
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        selectedUserId: "",
        useStartDate: false,
        startDate: "",
        startTime: "",
        useEndDate: false,
        endDate: "",
        endTime: "",
        notes: "",
        searchTerm: ""
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create delegated account:", error)
      toast.error("Failed to create delegated account. Please try again.")
    }
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Delegated Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Delegated Account</DialogTitle>
          <DialogDescription>
            Create a delegated account with specific permissions for staff members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Account Creation Mode Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Account Creation Mode</Label>
              <p className="text-sm text-muted-foreground">
                Choose whether to create a new user or select an existing user
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="create-mode" className="text-sm">
                Create New User
              </Label>
              <Switch
                id="create-mode"
                checked={formData.isCreateMode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCreateMode: checked }))}
              />
            </div>
          </div>

          {/* User Details Section */}
          {formData.isCreateMode ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">New User Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormText
                  labelText="First Name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: String(e.target.value) }))}
                  placeholder="John"
                  required
                />
                <FormText
                  labelText="Middle Name"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: String(e.target.value) }))}
                  placeholder="Robert"
                />
                <FormText
                  labelText="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: String(e.target.value) }))}
                  placeholder="Doe"
                  required
                />
              </div>
              <FormText
                labelText="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: String(e.target.value) }))}
                placeholder="john.doe@example.com"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Existing User</h3>
              <div>
                <Label htmlFor="user-select">User *</Label>
                <FormUserSelect
                  value={formData.selectedUserId}
                  onChange={(e) => setFormData(prev => ({ ...prev, selectedUserId: String(e.target.value) }))}
                  placeholder="Search and select a user"
                  required
                />
              </div>
            </div>
          )}

          {/* Expiry Options Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Expiry Options</h3>

            {/* Start Date/Time */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Start Date & Time</Label>
                <p className="text-xs text-muted-foreground">
                  Optional start date and time for the account. If none is specified, account is valid starting from immediately.
                </p>
              </div>
              <Switch
                checked={formData.useStartDate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useStartDate: checked }))}
              />
            </div>
            {formData.useStartDate && (
              <div className="grid grid-cols-2 gap-4 ml-4">
                <FormDateInput
                  labelText="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: String(e.target.value) }))}
                />
                <FormText
                  labelText="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: String(e.target.value) }))}
                />
              </div>
            )}

            {/* End Date/Time */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">End Date & Time</Label>
                <p className="text-xs text-muted-foreground">
                  Optional end date and time for the account. If none is specified, account would last infinitely and would always be active without any termination date.
                </p>
              </div>
              <Switch
                checked={formData.useEndDate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useEndDate: checked }))}
              />
            </div>
            {formData.useEndDate && (
              <div className="grid grid-cols-2 gap-4 ml-4">
                <FormDateInput
                  labelText="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: String(e.target.value) }))}
                />
                <FormText
                  labelText="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: String(e.target.value) }))}
                />
              </div>
            )}
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

          {/* Notes Section */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes about this delegated account"
              rows={3}
            />
          </div>
        </div>
        <ErrorBlock error={createDelegationError} />
        <DialogFooter>
          <Button onClick={handleCreateDelegatedAccount}>
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}