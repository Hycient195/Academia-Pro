"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import apis from "@/redux/api"
import { ISuperAdminSchool } from "@academia-pro/types/super-admin"

interface ViewSchoolDetailsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  school: ISuperAdminSchool | null
}

export default function ViewSchoolDetailsModal({ isOpen, onOpenChange, school }: ViewSchoolDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>School Details</DialogTitle>
          <DialogDescription>
            Detailed information about {school?.name}
          </DialogDescription>
        </DialogHeader>
        {school && (
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">School Name</label>
                <p className="text-sm text-muted-foreground">{school.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">School Code</label>
                <p className="text-sm text-muted-foreground">{school.code || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-muted-foreground">{school.type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground">{school.status}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Address</label>
              <p className="text-sm text-muted-foreground">{school.address || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <p className="text-sm text-muted-foreground">{school.city || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <p className="text-sm text-muted-foreground">{school.state || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <p className="text-sm text-muted-foreground">{school.country || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{school.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p className="text-sm text-muted-foreground">{school.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Students</label>
                <p className="text-sm text-muted-foreground">
                  {school.currentStudents || 0} / {school.totalCapacity || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Subscription Plan</label>
                <p className="text-sm text-muted-foreground">{school.subscriptionPlan || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm text-muted-foreground">
                  {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm text-muted-foreground">
                  {school.updatedAt ? new Date(school.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}