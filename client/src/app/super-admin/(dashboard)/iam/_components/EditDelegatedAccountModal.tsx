"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { IconX, IconSearch } from "@tabler/icons-react"
import { useState, useEffect, useMemo } from "react"
import { apis } from "@/redux/api"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import { FormText, FormTextArea } from "@/components/ui/form-components"

interface DelegatedAccount {
  id: string
  email: string
  permissions: string[]
  startDate?: string
  expiryDate?: string
  status: 'active' | 'inactive' | 'suspended' | 'expired' | 'revoked'
  createdAt: string
  notes?: string
}

interface Permission {
  id: string
  name: string
  description: string
}

interface EditDelegatedAccountModalProps {
  isOpen: boolean
  onClose: () => void
  account: DelegatedAccount | null
  availablePermissions: Permission[]
}

export function EditDelegatedAccountModal({
  isOpen,
  onClose,
  account,
  availablePermissions
}: EditDelegatedAccountModalProps) {
  const [updateDelegatedAccount, { isLoading, error }] = apis.superAdmin.useUpdateDelegatedAccountMutation()

  const [formData, setFormData] = useState({
    selectedPermissions: [] as string[],
    expiryDate: '',
    startDate: '',
    notes: '',
    searchTerm: ''
  })
  useEffect(() => {
    if (account && isOpen) {
      setFormData({
        selectedPermissions: account.permissions || [],
        expiryDate: account.expiryDate ? new Date(account.expiryDate).toISOString().split('T')[0] : '',
        startDate: account.startDate ? new Date(account.startDate).toISOString().split('T')[0] : '',
        notes: account.notes || '',
        searchTerm: ''
      })
    }
  }, [account, isOpen])

  const handlePermissionToggle = (permissionName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionName)
        ? prev.selectedPermissions.filter(p => p !== permissionName)
        : [...prev.selectedPermissions, permissionName]
    }))
  }

  const handleSave = async () => {
    if (!account) return

    try {
      const updates = {
        permissions: formData.selectedPermissions,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        notes: formData.notes.trim() || null,
      }

      const apiUpdates = {
        permissions: updates.permissions,
        expiryDate: updates.expiryDate || undefined,
        startDate: updates.startDate || undefined,
        notes: updates.notes || undefined,
      }

      await updateDelegatedAccount({ id: account.id, updates: apiUpdates }).unwrap()
      onClose()
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const handleClose = () => {
    setFormData({
      selectedPermissions: [],
      expiryDate: '',
      startDate: '',
      notes: '',
      searchTerm: ''
    })
    onClose()
  }

  // Filter and sort permissions based on search term
  const filteredAndSortedPermissions = useMemo(() => {
    return availablePermissions
      .filter(permission =>
        permission.name.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(formData.searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [availablePermissions, formData.searchTerm])

  if (!account) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Delegated Account</DialogTitle>
          <DialogDescription>
            Update permissions and settings for {account.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Account Information</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm"><strong>Email:</strong> {account.email}</p>
              <p className="text-sm"><strong>Status:</strong> <Badge variant="outline">{account.status}</Badge></p>
              <p className="text-sm"><strong>Created:</strong> {new Date(account.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissions</Label>

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

            <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {filteredAndSortedPermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permission.id}
                    checked={formData.selectedPermissions.includes(permission.name)}
                    onChange={() => handlePermissionToggle(permission.name)}
                    className="rounded"
                  />
                  <label htmlFor={permission.id} className="text-sm flex-1">
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-gray-500 text-xs">{permission.description}</div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.selectedPermissions.map((permission: string) => (
                <Badge key={permission} variant="secondary" className="text-xs">
                  {permission}
                  <button
                    onClick={() => handlePermissionToggle(permission)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Leave empty for immediate activation</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Leave empty for no expiration</p>
            </div>
          </div>

          {/* Notes */}
          <FormTextArea
            labelText="Notes"
            placeholder="Optional notes about this delegated account..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: String(e.target.value) }))}
            rows={3}
          />
        </div>

        <ErrorBlock error={error} />
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}