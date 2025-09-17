'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAssignStaffToDepartmentMutation, useRemoveStaffFromDepartmentMutation } from '@/redux/api/school-admin/departmentApis';
import { IDepartment } from '@academia-pro/types/school-admin';
import { useGetStaffQuery } from '@/redux/api/school-admin/staffApis';
import { toast } from 'sonner';
import { Loader2, Search, UserPlus, UserMinus, Users } from 'lucide-react';

interface AssignStaffModalProps {
  open: boolean;
  onClose: () => void;
  department: IDepartment;
}

export function AssignStaffModal({ open, onClose, department }: AssignStaffModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignStaff, { isLoading: isAssigning }] = useAssignStaffToDepartmentMutation();
  const [removeStaff, { isLoading: isRemoving }] = useRemoveStaffFromDepartmentMutation();

  const { data: staffData, isLoading } = useGetStaffQuery({
    search: searchTerm || undefined,
  });

  const staff = staffData?.data || [];
  const assignedStaffIds = new Set(department.staff?.map(s => s.id) || []);

  const availableStaff = staff.filter(s => !assignedStaffIds.has(s.id));
  const assignedStaff = staff.filter(s => assignedStaffIds.has(s.id));

  const handleAssign = async (staffId: string) => {
    try {
      await assignStaff({
        departmentId: department.id,
        staffId,
      }).unwrap();
      toast.success('Staff member assigned successfully');
    } catch (error) {
      toast.error('Failed to assign staff member');
    }
  };

  const handleRemove = async (staffId: string) => {
    try {
      await removeStaff({
        departmentId: department.id,
        staffId,
      }).unwrap();
      toast.success('Staff member removed successfully');
    } catch (error) {
      toast.error('Failed to remove staff member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Staff - {department.name}
          </DialogTitle>
          <DialogDescription>
            Assign or remove staff members from this department
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Staff */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-green-600" />
                Available Staff ({availableStaff.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                Staff members not assigned to this department
              </p>
            </div>
            <CardContent className="p-4 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availableStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No available staff members</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {staff.firstName} {staff.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {staff.position} • {staff.employeeId}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssign(staff.id)}
                        disabled={isAssigning}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Staff */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-blue-600" />
                Assigned Staff ({assignedStaff.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                Staff members currently in this department
              </p>
            </div>
            <CardContent className="p-4 max-h-64 overflow-y-auto">
              {assignedStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No staff members assigned</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {staff.firstName} {staff.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {staff.position} • {staff.employeeId}
                          </p>
                        </div>
                        <Badge variant={staff.employmentStatus === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {staff.employmentStatus}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(staff.id)}
                        disabled={isRemoving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}