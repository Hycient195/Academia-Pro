"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import apis from "@/redux/api"
import { ISuperAdminUser, ISuperAdminUserResponse } from "@academia-pro/types/super-admin"
import { toast } from "sonner"

interface DeleteUserModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: ISuperAdminUserResponse | null
  onSuccess?: () => void
}

export default function DeleteUserModal({ isOpen, onOpenChange, user, onSuccess }: DeleteUserModalProps) {
  const [deleteUser] = apis.superAdmin.iam.useDeleteUserMutation()
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const confirmDeleteUser = async () => {
    if (!user || deleteConfirmation !== user.name) {
      toast.error('User name does not match. Please try again.')
      return
    }

    try {
      await deleteUser(user.id).unwrap()
      toast.success(`User ${user.name} has been suspended successfully!`)
      onOpenChange(false)
      setDeleteConfirmation('')
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Delete user error:', error)
      let errorMessage = 'Unknown error occurred'
      if (error && typeof error === 'object') {
        const err = error as { data?: { message?: string }; message?: string }
        errorMessage = err.data?.message || err.message || errorMessage
      }
      toast.error(`Failed to suspend user: ${errorMessage}`)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteConfirmation('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete User</DialogTitle>
          <DialogDescription>
            This action will suspend the user account for
            <strong> {user?.name} </strong>.
            The user will no longer be able to access the system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type the user name to confirm: <strong>{user?.name}</strong>
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter user name"
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDeleteUser}
            disabled={deleteConfirmation !== user?.name}
          >
            Suspend User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}