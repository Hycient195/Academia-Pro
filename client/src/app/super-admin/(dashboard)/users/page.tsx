"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FormSelect } from "@/components/ui/form-components"
import { FormSchoolSelect } from "@/components/ui/FormSchoolSelect"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconFilter,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconMail,
  IconClock
} from "@tabler/icons-react"
import { apis } from "@/redux/api"
import { IUserFilters } from "@academia-pro/types/super-admin"
import { ISuperAdminUser } from "@academia-pro/types/super-admin"
import { toast } from "sonner"
import AddUserModal from "./_components/AddUserModal"
import DeleteUserModal from "./_components/DeleteUserModal"
import ReactivateUserModal from "./_components/ReactivateUserModal"
import ViewUserDetailsModal from "./_components/ViewUserDetailsModal"
import { EUserRole, EUserStatus } from "@academia-pro/types/users"

export default function UsersPage() {
  const [filters, setFilters] = useState<IUserFilters>({
    page: 1,
    limit: 10
  })

  const [modals, setModals] = useState({
    view: { isOpen: false, user: null as ISuperAdminUser | null },
    add: { isOpen: false },
    edit: { isOpen: false, user: null as ISuperAdminUser | null },
    delete: { isOpen: false, user: null as ISuperAdminUser | null },
    reactivate: { isOpen: false, user: null as ISuperAdminUser | null }
  })

  const { data: usersData, isLoading } = apis.superAdmin.useGetAllUsersQuery(filters)
  const users = usersData?.data || []
  const pagination = usersData?.pagination

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      "school-admin": "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      student: "bg-purple-100 text-purple-800",
      parent: "bg-orange-100 text-orange-800"
    } as const

    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {role.replace('_', ' ')}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleViewDetails = (user: ISuperAdminUser) => {
    setModals(prev => ({
      ...prev,
      view: { isOpen: true, user }
    }))
  }

  const handleEditUser = (user: ISuperAdminUser) => {
    setModals(prev => ({
      ...prev,
      edit: { isOpen: true, user }
    }))
  }

  const handleDeleteUser = (user: ISuperAdminUser) => {
    setModals(prev => ({
      ...prev,
      delete: { isOpen: true, user }
    }))
  }

  const handleReactivateUser = (user: ISuperAdminUser) => {
    setModals(prev => ({
      ...prev,
      reactivate: { isOpen: true, user }
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handlePageSizeChange = (limit: number) => {
    setFilters({ ...filters, limit, page: 1 }) // Reset to first page when changing page size
  }

  const handleModalSuccess = () => {
    setModals({
      view: { isOpen: false, user: null },
      add: { isOpen: false },
      edit: { isOpen: false, user: null },
      delete: { isOpen: false, user: null },
      reactivate: { isOpen: false, user: null }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <ViewUserDetailsModal
          isOpen={modals.view.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, view: { ...prev.view, isOpen: open } }))}
          user={modals.view.user}
        />

        <AddUserModal
          mode="add"
          isOpen={modals.add.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, add: { isOpen: open } }))}
          onSuccess={handleModalSuccess}
        />

        <AddUserModal
          mode="edit"
          isOpen={modals.edit.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, edit: { isOpen: open, user: open ? prev.edit.user : null } }))}
          userData={modals.edit.user}
          onSuccess={handleModalSuccess}
        />

        <DeleteUserModal
          isOpen={modals.delete.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, delete: { isOpen: open, user: open ? prev.delete.user : null } }))}
          user={modals.delete.user}
          onSuccess={handleModalSuccess}
        />
  
        <ReactivateUserModal
          isOpen={modals.reactivate.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, reactivate: { isOpen: open, user: open ? prev.reactivate.user : null } }))}
          user={modals.reactivate.user}
          onSuccess={handleModalSuccess}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users across all schools in the system
          </p>
        </div>
        <Button onClick={() => setModals(prev => ({ ...prev, add: { isOpen: true }}))}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconFilter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <FormSelect
              labelText="Role"
              placeholder="All roles"
              value={filters.roles?.[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  roles: value === "all" ? undefined : [value as EUserRole]
                });
              }}
              options={[
                { value: "all", text: "All Roles" },
                { value: "school-admin", text: "School Admin" },
                { value: "teacher", text: "Teacher" },
                { value: "student", text: "Student" },
                { value: "parent", text: "Parent" }
              ]}
            />

            <FormSelect
              labelText="Status"
              placeholder="All statuses"
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === "all" ? undefined : e.target.value as EUserStatus })}
              options={[
                { value: "all", text: "All Statuses" },
                { value: "active", text: "Active" },
                { value: "inactive", text: "Inactive" },
                { value: "suspended", text: "Suspended" }
              ]}
            />

            <FormSchoolSelect
              labelText="School"
              placeholder="All schools"
              value={filters.schoolId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  schoolId: value === "all" ? undefined : value
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconUsers className="h-5 w-5 mr-2" />
            Users ({pagination?.total || 0})
          </CardTitle>
          <CardDescription>
            A list of all users across all schools in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>{getInitials(user.name as string)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <IconMail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.roles?.[0] || 'unknown')}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.schoolName ? (
                      <div className="flex items-center">
                        <IconBuilding className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{user.schoolName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No school assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="flex items-center">
                        <IconClock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <IconEye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <IconEdit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        {user.status === 'suspended' ? (
                          <DropdownMenuItem
                            onClick={() => handleReactivateUser(user)}
                            className="text-green-600"
                          >
                            <IconUsers className="h-4 w-4 mr-2" />
                            Reactivate User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <IconTrash className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8">
              <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.roles || filters.status
                  ? "Try adjusting your filters"
                  : "Get started by adding your first user"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {(pagination?.total || 0) > 0 && (
            <div className="px-2 py-4">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector={true}
                showInfo={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewUserDetailsModal
        isOpen={modals.view.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, view: { ...prev.view, isOpen: open } }))}
        user={modals.view.user}
      />

      <AddUserModal
        mode="add"
        isOpen={modals.add.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, add: { isOpen: open } }))}
        onSuccess={handleModalSuccess}
      />

      <AddUserModal
        mode="edit"
        isOpen={modals.edit.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, edit: { isOpen: open, user: open ? prev.edit.user : null } }))}
        userData={modals.edit.user}
        onSuccess={handleModalSuccess}
      />

      <DeleteUserModal
        isOpen={modals.delete.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, delete: { isOpen: open, user: open ? prev.delete.user : null } }))}
        user={modals.delete.user}
        onSuccess={handleModalSuccess}
      />

      <ReactivateUserModal
        isOpen={modals.reactivate.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, reactivate: { isOpen: open, user: open ? prev.reactivate.user : null } }))}
        user={modals.reactivate.user}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}