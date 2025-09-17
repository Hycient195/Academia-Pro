'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users } from 'lucide-react';
import { useDeleteDepartmentMutation } from '@/redux/api/school-admin/departmentApis';
import { IDepartment } from '@academia-pro/types/school-admin';
import { toast } from 'sonner';
import ErrorToast from '@/components/utilities/ErrorToast';

interface DeleteDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  department: IDepartment;
}

export function DeleteDepartmentModal({ open, onClose, department }: DeleteDepartmentModalProps) {
  const [deleteDepartment, { isLoading, error }] = useDeleteDepartmentMutation();

  const staffCount = department.staff?.length || 0;
  const canDelete = staffCount === 0;

  const handleDelete = async () => {
    try {
      await deleteDepartment(department.id).unwrap();
      toast.success('Department deleted successfully');
      onClose();
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to delete department', { description: <ErrorToast error={error} /> });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Department
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete <strong>{department.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Staff Members: {staffCount}</span>
              </div>

              {staffCount > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Cannot delete department with assigned staff members
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please remove all staff members from this department before deleting it.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {department.staff?.slice(0, 3).map((staff) => (
                      <Badge key={staff.id} variant="outline" className="text-xs">
                        {staff.firstName} {staff.lastName}
                      </Badge>
                    ))}
                    {staffCount > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{staffCount - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  ✅ Department can be safely deleted
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!canDelete || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete Department'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}