"use client"

import React from "react"
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
import type { IRole } from '@academia-pro/types/super-admin'

interface Role {
  id: string
  name: string
  description?: string
}

interface DeleteRoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: IRole | null
  onRoleDeleted?: () => void
}

export function DeleteRoleModal({ isOpen, onClose, role, onRoleDeleted }: DeleteRoleModalProps) {
  const [deleteRole, { isLoading, error }] = apis.superAdmin.iam.useDeleteRoleMutation()

  const handleDelete = async () => {
    if (!role) return

    try {
      await deleteRole(role.id).unwrap()
      onClose()
      onRoleDeleted?.()
    } catch (error) {
      console.error("Failed to delete role:", error)
    }
  }

  if (!role) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconTrash className="mr-2 h-5 w-5 text-red-500" />
            Delete Role
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role{" "}
            <span className="font-medium">{role.name}</span>?
            <br />
            <br />
            This action cannot be undone. Any delegated accounts using this role will need to be updated.
          </DialogDescription>
        </DialogHeader>
        <ErrorBlock error={error} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}