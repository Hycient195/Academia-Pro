"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apis } from "@/redux/api"
import { ISuperAdminUser } from "@academia-pro/types/super-admin"
import { toast } from "sonner"

interface DeleteUserModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: ISuperAdminUser | null
  onSuccess?: () => void
}

export default function DeleteUserModal({ isOpen, onOpenChange, user, onSuccess }: DeleteUserModalProps) {
  const [deleteUser] = apis.superAdmin.useDeleteUserMutation()
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const confirmDeleteUser = async () => {
    if (!user || deleteConfirmation !== user.name) {
      toast.error('User name does not match. Please try again.')
      return
    }

    deleteUser(user.id).unwrap()
    .then(() => {
      toast.success(`User ${user.name} deleted successfully!`)
      onOpenChange(false)
      setDeleteConfirmation('')
      onSuccess?.()
    })
    .catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to delete user: ${errorMessage}`)
    })
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
            This action cannot be undone. This will permanently delete the user
            <strong> {user?.name} </strong>
            and all associated data.
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
            Delete User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}