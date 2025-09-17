'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetDepartmentsQuery, useGetDepartmentStatisticsQuery } from '@/redux/api/school-admin/departmentApis';
import { IDepartment } from '@academia-pro/types/school-admin';
import { CreateDepartmentModal } from './_components/CreateDepartmentModal';
import { EditDepartmentModal } from './_components/EditDepartmentModal';
import { DepartmentDetailsModal } from './_components/DepartmentDetailsModal';
import { DeleteDepartmentModal } from './_components/DeleteDepartmentModal';
import { AssignStaffModal } from './_components/AssignStaffModal';
import { DepartmentStatistics } from './_components/DepartmentStatistics';

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

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Helper function to validate department type
  const isValidDepartmentType = (type: string): type is IDepartment['type'] => {
    const validTypes = [
      'administration', 'teaching', 'medical', 'counseling', 'boarding',
      'transportation', 'catering', 'facilities', 'security', 'finance',
      'hr', 'it', 'library', 'sports', 'arts', 'examinations'
    ];
    return validTypes.includes(type);
  };
  const [selectedDepartment, setSelectedDepartment] = useState<IDepartment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data: departmentsData, isLoading, error } = useGetDepartmentsQuery({
    search: searchTerm || undefined,
    type: typeFilter !== 'all' && isValidDepartmentType(typeFilter) ? (typeFilter as IDepartment['type']) : undefined,
  });

  const { data: statsData, refetch: refetchStats } = useGetDepartmentStatisticsQuery();

  console.log(statsData)

  // Force refetch statistics on component mount to bypass cache
  useEffect(() => {
    refetchStats();
  }, [refetchStats]);

  const departments = departmentsData?.data || [];
  const totalCount = departmentsData?.pagination?.total || 0;

  const handleEdit = (department: IDepartment) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (department: IDepartment) => {
    setSelectedDepartment(department);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = (department: IDepartment) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleAssignStaff = (department: IDepartment) => {
    setSelectedDepartment(department);
    setIsAssignModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load departments</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage school departments and their staff assignments
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Statistics Overview */}
      <DepartmentStatistics stats={statsData} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Management
          </CardTitle>
          <CardDescription>
            View and manage all school departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="counseling">Counseling</SelectItem>
                <SelectItem value="boarding">Boarding</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="examinations">Examinations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Departments Table */}
          <div className="space-y-4">
            {departments.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No departments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating your first department'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Department
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => (
                  <Card key={department.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={departmentTypeColors[department.type] || 'bg-gray-100 text-gray-800'}
                          >
                            {department.type}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(department)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(department)}>
                              Edit Department
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignStaff(department)}>
                              <Users className="mr-2 h-4 w-4" />
                              Assign Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(department)}
                              className="text-red-600"
                            >
                              Delete Department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      {department.description && (
                        <CardDescription className="line-clamp-2">
                          {department.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{department.staff?.length || 0} staff members</span>
                        </div>
                        <span>
                          Created {new Date(department.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {departments.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {departments.length} of {totalCount} departments
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateDepartmentModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedDepartment && (
        <>
          <EditDepartmentModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            department={selectedDepartment}
          />

          <DepartmentDetailsModal
            open={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            department={selectedDepartment}
          />

          <DeleteDepartmentModal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            department={selectedDepartment}
          />

          <AssignStaffModal
            open={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            department={selectedDepartment}
          />
        </>
      )}
    </div>
  );
}