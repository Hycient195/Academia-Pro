'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Calendar, Building2, FileText } from 'lucide-react';
import { IDepartment } from '@academia-pro/types/school-admin';

const departmentTypeColors = {
  administration: 'bg-blue-100 text-blue-800',
  teaching: 'bg-green-100 text-green-800',
  medical: 'bg-red-100 text-red-800',
  counseling: 'bg-purple-100 text-purple-800',
  boarding: 'bg-orange-100 text-orange-800',
  transportation: 'bg-yellow-100 text-yellow-800',
  catering: 'bg-pink-100 text-pink-800',
  facilities: 'bg-gray-100 text-gray-800',
  security: 'bg-indigo-100 text-indigo-800',
  finance: 'bg-emerald-100 text-emerald-800',
  hr: 'bg-cyan-100 text-cyan-800',
  it: 'bg-violet-100 text-violet-800',
  library: 'bg-amber-100 text-amber-800',
  sports: 'bg-lime-100 text-lime-800',
  arts: 'bg-rose-100 text-rose-800',
  examinations: 'bg-teal-100 text-teal-800',
};

interface DepartmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  department: IDepartment;
}

export function DepartmentDetailsModal({ open, onClose, department }: DepartmentDetailsModalProps) {
  const staffCount = department.staff?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {department.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about this department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department Type</label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={departmentTypeColors[department.type] || 'bg-gray-100 text-gray-800'}
                    >
                      {department.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department Name</label>
                  <p className="mt-1 font-medium">{department.name}</p>
                </div>
              </div>

              {department.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm">{department.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1 text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(department.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1 text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(department.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members ({staffCount})
              </CardTitle>
              <CardDescription>
                Current staff assigned to this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staffCount === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No staff members assigned to this department</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {department.staff?.map((staff) => (
                    <div key={staff.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {staff.firstName[0]}{staff.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {staff.firstName} {staff.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {staff.position} • Employee ID: {staff.employeeId}
                        </p>
                      </div>
                      <Badge variant={staff.employmentStatus === 'active' ? 'default' : 'secondary'}>
                        {staff.employmentStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{staffCount}</div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {department.staff?.filter(s => s.employmentStatus === 'active').length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {department.staff?.filter(s => s.employmentStatus === 'inactive').length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Inactive Staff</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {department.staff?.filter(s => s.employmentStatus === 'on_leave').length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">On Leave</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="mt-1 text-sm">User ID: {department.createdBy}</p>
                </div>
                {department.updatedBy && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated By</label>
                    <p className="mt-1 text-sm">User ID: {department.updatedBy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}