"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { IconPlus } from "@tabler/icons-react"
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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isCreateMode, setIsCreateMode] = useState(true) // true = create new user, false = select existing

  // For creating new user
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [email, setEmail] = useState("")

  // For selecting existing user
  const [selectedUserId, setSelectedUserId] = useState("")

  // Expiry options
  const [useStartDate, setUseStartDate] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [useEndDate, setUseEndDate] = useState(false)
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  const [notes, setNotes] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [createDelegatedAccount, { error: createDelegationError }] = apis.superAdmin.useCreateDelegatedAccountMutation()

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionName])
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName))
    }
  }

  const handleCreateDelegatedAccount = async () => {
    // Validation
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    if (isCreateMode) {
      if (!firstName || !lastName || !email) {
        toast.error("Please fill in all required fields for new user")
        return
      }
    } else {
      if (!selectedUserId) {
        toast.error("Please select a user")
        return
      }
    }

    // No expiry date validation needed - accounts can be infinite if no end date is set

    try {
      const accountData = isCreateMode ? {
        firstName,
        lastName,
        middleName: middleName || undefined,
        email,
        permissions: selectedPermissions,
        startDate: useStartDate ? startDate : undefined,
        startTime: useStartDate ? startTime : undefined,
        endDate: useEndDate ? endDate : undefined,
        endTime: useEndDate ? endTime : undefined,
        expiryDate: useEndDate ? endDate : undefined,
        notes: notes || undefined,
      } : {
        userId: selectedUserId,
        permissions: selectedPermissions,
        startDate: useStartDate ? startDate : undefined,
        startTime: useStartDate ? startTime : undefined,
        endDate: useEndDate ? endDate : undefined,
        endTime: useEndDate ? endTime : undefined,
        expiryDate: useEndDate ? endDate : undefined,
        notes: notes || undefined,
      }

      await createDelegatedAccount(accountData).unwrap()

      toast.success("Delegated account created successfully!")

      // Reset form
      setFirstName("")
      setLastName("")
      setMiddleName("")
      setEmail("")
      setSelectedUserId("")
      setUseStartDate(false)
      setStartDate("")
      setStartTime("")
      setUseEndDate(false)
      setEndDate("")
      setEndTime("")
      setNotes("")
      setSelectedPermissions([])
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
                checked={isCreateMode}
                onCheckedChange={setIsCreateMode}
              />
            </div>
          </div>

          {/* User Details Section */}
          {isCreateMode ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">New User Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormText
                  labelText="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(String(e.target.value))}
                  placeholder="John"
                  required
                />
                <FormText
                  labelText="Middle Name"
                  value={middleName}
                  onChange={(e) => setMiddleName(String(e.target.value))}
                  placeholder="Robert"
                />
                <FormText
                  labelText="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(String(e.target.value))}
                  placeholder="Doe"
                  required
                />
              </div>
              <FormText
                labelText="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(String(e.target.value))}
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
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(String(e.target.value))}
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
                checked={useStartDate}
                onCheckedChange={setUseStartDate}
              />
            </div>
            {useStartDate && (
              <div className="grid grid-cols-2 gap-4 ml-4">
                <FormDateInput
                  labelText="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(String(e.target.value))}
                />
                <FormText
                  labelText="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(String(e.target.value))}
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
                checked={useEndDate}
                onCheckedChange={setUseEndDate}
              />
            </div>
            {useEndDate && (
              <div className="grid grid-cols-2 gap-4 ml-4">
                <FormDateInput
                  labelText="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(String(e.target.value))}
                />
                <FormText
                  labelText="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(String(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
              <div className="grid gap-3">
                {defaultPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.name)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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