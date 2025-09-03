"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apis, type School } from "@/redux/api"
import { toast } from "sonner"

interface DeleteSchoolModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  school: School | null
  onSuccess?: () => void
}

export default function DeleteSchoolModal({ isOpen, onOpenChange, school, onSuccess }: DeleteSchoolModalProps) {
  const [deleteSchool] = apis.superAdmin.useDeleteSchoolMutation()
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const confirmDeleteSchool = async () => {
    if (!school || deleteConfirmation !== school.name) {
      toast.error('School name does not match. Please try again.')
      return
    }

    deleteSchool(school.id).unwrap()
    .then(() => {
      toast.success(`School ${school.name} deleted successfully!`)
      onOpenChange(false)
      setDeleteConfirmation('')
      onSuccess?.()
    })
    .catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to delete school: ${errorMessage}`)
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
          <DialogTitle className="text-red-600">Delete School</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the school
            <strong> {school?.name} </strong>
            and all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type the school name to confirm: <strong>{school?.name}</strong>
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter school name"
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
            onClick={confirmDeleteSchool}
            disabled={deleteConfirmation !== school?.name}
          >
            Delete School
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}