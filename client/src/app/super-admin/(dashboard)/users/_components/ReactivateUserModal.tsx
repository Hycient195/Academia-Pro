"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apis } from "@/redux/api"
import { ISuperAdminUser } from "@academia-pro/types/super-admin"
import { toast } from "sonner"

interface ReactivateUserModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: ISuperAdminUser | null
  onSuccess?: () => void
}

export default function ReactivateUserModal({ isOpen, onOpenChange, user, onSuccess }: ReactivateUserModalProps) {
  const [reactivateUser] = apis.superAdmin.useReactivateUserMutation()

  const handleReactivateUser = async () => {
    if (!user) return

    try {
      await reactivateUser(user.id).unwrap()
      toast.success(`User ${user.name} has been reactivated successfully!`)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Reactivate user error:', error)
      let errorMessage = 'Unknown error occurred'
      if (error && typeof error === 'object') {
        const err = error as { data?: { message?: string }; message?: string }
        errorMessage = err.data?.message || err.message || errorMessage
      }
      toast.error(`Failed to reactivate user: ${errorMessage}`)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset any state if needed
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-600">Reactivate User</DialogTitle>
          <DialogDescription>
            This will restore access for
            <strong> {user?.name} </strong>
            and allow them to log back into the system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The user will regain full access to their account and all associated features.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReactivateUser}
            className="bg-green-600 hover:bg-green-700"
          >
            Reactivate User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}