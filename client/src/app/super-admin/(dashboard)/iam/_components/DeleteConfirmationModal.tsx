"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconTrash } from "@tabler/icons-react"
import apis from "@/redux/api"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import ErrorToast from "@/components/utilities/ErrorToast"
import { toast } from "sonner"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  accountId: string
  accountEmail: string
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  accountId,
  accountEmail
}: DeleteConfirmationModalProps) {
  const [deleteDelegatedAccount, { isLoading, error }] = apis.superAdmin.iam.useDeleteDelegatedAccountMutation()

  const [formData, setFormData] = useState({
    accountId: '',
    accountEmail: ''
  })

  // Update form data when props change
  useEffect(() => {
    setFormData({
      accountId,
      accountEmail
    })
  }, [accountId, accountEmail])

  const handleConfirm = () => {
    // Client-side validations
    if (!formData.accountId) {
      toast.error("Account ID is required.")
      return
    }

    deleteDelegatedAccount(formData.accountId)
    .unwrap()
    .then(() => {
      toast.success("Delegated account deleted successfully!")
      onClose()
    })
    .catch((err) => {
      console.error(err)
      toast.error("Failed to delete delegated account.", { description: <ErrorToast error={error} /> })
    })
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconTrash className="mr-2 h-5 w-5 text-red-500" />
            Delete Delegated Account
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the delegated account for{" "}
            <span className="font-medium">{formData.accountEmail}</span>?
            <br />
            <br />
            This action cannot be undone. The account will be permanently removed
            and the user will lose all delegated access.
          </DialogDescription>
        </DialogHeader>
        <ErrorBlock error={error} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}