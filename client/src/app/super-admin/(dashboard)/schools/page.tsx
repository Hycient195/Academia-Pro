"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSelect } from "@/components/ui/form-components"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/ui/pagination"
import {
  IconBuilding,
  IconPlus,
  IconSearch,
  IconFilter,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconUsers,
  IconMapPin,
  IconX
} from "@tabler/icons-react"
import { apis } from "@/redux/api"
import { ISuperAdminSchool } from "@academia-pro/types/super-admin"
import { ISchoolFilters as BaseSchoolFilters, TSchoolType, TSchoolStatus } from "@academia-pro/types/shared"

interface ISchoolFilters extends BaseSchoolFilters {
  page?: number;
  limit?: number;
  subscriptionPlan?: string;
}
import { toast } from "sonner"
import AddSchoolModal from "./_components/AddSchoolModal"
import DeleteSchoolModal from "./_components/DeleteSchoolModal"
import ViewSchoolDetailsModal from "./_components/ViewSchoolDetailsModal"

export default function SchoolsPage() {
  const [filters, setFilters] = useState<ISchoolFilters>({
    page: 1,
    limit: 10
  })

  const [modals, setModals] = useState({
    view: { isOpen: false, school: null as ISuperAdminSchool | null },
    add: { isOpen: false },
    edit: { isOpen: false, school: null as ISuperAdminSchool | null },
    delete: { isOpen: false, school: null as ISuperAdminSchool | null }
  })


  const { data: schoolsData, isLoading } = apis.superAdmin.useGetAllSchoolsQuery(filters)

  console.log(schoolsData)
  
  const schools = schoolsData?.data || []
  const pagination = schoolsData?.pagination

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handlePageSizeChange = (limit: number) => {
    setFilters({ ...filters, limit, page: 1 }) // Reset to first page when changing page size
  }

  const handleViewDetails = (school: ISuperAdminSchool) => {
    setModals(prev => ({
      ...prev,
      view: { isOpen: true, school }
    }))
  }

  const handleEditSchool = (school: ISuperAdminSchool) => {
    setModals(prev => ({
      ...prev,
      edit: { isOpen: true, school }
    }))
  }

  const handleDeleteSchool = (school: ISuperAdminSchool) => {
    setModals(prev => ({
      ...prev,
      delete: { isOpen: true, school }
    }))
  }

  const handleModalSuccess = () => {
    // Close all modals and reset data
    setModals({
      view: { isOpen: false, school: null },
      add: { isOpen: false },
      edit: { isOpen: false, school: null },
      delete: { isOpen: false, school: null }
    })
    // Refetch or update the schools list
    // For now, we can rely on the mutations invalidating the cache
  }

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

  const getTypeBadge = (type: string) => {
    const colors = {
      primary: "bg-blue-100 text-blue-800",
      secondary: "bg-green-100 text-green-800",
      mixed: "bg-purple-100 text-purple-800"
    } as const

    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type?.replace(/_/ig, " ")}
      </Badge>
    )
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
        <ViewSchoolDetailsModal
          isOpen={modals.view.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, view: { ...prev.view, isOpen: open } }))}
          school={modals.view.school}
        />
  
        <AddSchoolModal
          mode="add"
          isOpen={modals.add.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, add: { isOpen: open } }))}
          onSuccess={handleModalSuccess}
        />
  
        <AddSchoolModal
          mode="edit"
          isOpen={modals.edit.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, edit: { isOpen: open, school: open ? prev.edit.school : null } }))}
          schoolData={modals.edit.school}
          onSuccess={handleModalSuccess}
        />
  
        <DeleteSchoolModal
          isOpen={modals.delete.isOpen}
          onOpenChange={(open) => setModals(prev => ({ ...prev, delete: { isOpen: open, school: open ? prev.delete.school : null } }))}
          school={modals.delete.school}
          onSuccess={handleModalSuccess}
        />
      </div>
    )
  }
// console.log(schools)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all schools in the system
          </p>
        </div>
        <Button onClick={() => setModals(prev => ({ ...prev, add: { isOpen: true } }))}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add New School
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
                  placeholder="Search schools..."
                  className="pl-9"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <FormSelect
              labelText="Type"
              placeholder="All types"
              value={filters.type || ""}
              onChange={(e) => setFilters({ ...filters, type: e.target.value === "all" ? undefined : e.target.value as TSchoolType })}
              options={[
                { value: "all", text: "All Types" },
                { value: "primary", text: "Primary" },
                { value: "secondary", text: "Secondary" },
                { value: "mixed", text: "Mixed" }
              ]}
            />

            <FormSelect
              labelText="Status"
              placeholder="All statuses"
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === "all" ? undefined : e.target.value as TSchoolStatus })}
              options={[
                { value: "all", text: "All Statuses" },
                { value: "active", text: "Active" },
                { value: "inactive", text: "Inactive" },
                { value: "suspended", text: "Suspended" }
              ]}
            />

            <FormSelect
              labelText="Subscription Plan"
              placeholder="All plans"
              value={filters.subscriptionPlan || ""}
              onChange={(e) => setFilters({ ...filters, subscriptionPlan: e.target.value === "all" ? undefined : e.target.value as string })}
              options={[
                { value: "all", text: "All Plans" },
                { value: "basic", text: "Basic" },
                { value: "premium", text: "Premium" },
                { value: "enterprise", text: "Enterprise" }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconBuilding className="h-5 w-5 mr-2" />
            Schools ({pagination?.total || 0})
          </CardTitle>
          <CardDescription>
            A list of all schools in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{school.name}</div>
                      <div className="text-sm text-muted-foreground">{school.contact?.email || school.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize space-x-1">{school.type?.map((typ) => getTypeBadge(typ))}</TableCell>
                  <TableCell>{getStatusBadge(school.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IconUsers className="h-4 w-4 mr-1 text-muted-foreground" />
                      {school.currentStudents}/{school.totalCapacity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IconMapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">
                        {school.city || school.location?.city || 'N/A'}, {school.state || school.location?.state || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{school.subscriptionPlan}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(school)}>
                          <IconEye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSchool(school)}>
                          <IconEdit className="h-4 w-4 mr-2" />
                          Edit School
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteSchool(school)}
                          className="text-red-600"
                        >
                          <IconTrash className="h-4 w-4 mr-2" />
                          Delete School
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {schools.length === 0 && (
            <div className="text-center py-8">
              <IconBuilding className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No schools found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.type || filters.status
                  ? "Try adjusting your filters"
                  : "Get started by adding your first school"}
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
      <ViewSchoolDetailsModal
        isOpen={modals.view.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, view: { ...prev.view, isOpen: open } }))}
        school={modals.view.school}
      />

      <AddSchoolModal
        mode="add"
        isOpen={modals.add.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, add: { isOpen: open } }))}
        onSuccess={handleModalSuccess}
      />

      <AddSchoolModal
        mode="edit"
        isOpen={modals.edit.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, edit: { isOpen: open, school: open ? prev.edit.school : null } }))}
        schoolData={modals.edit.school}
        onSuccess={handleModalSuccess}
      />

      <DeleteSchoolModal
        isOpen={modals.delete.isOpen}
        onOpenChange={(open) => setModals(prev => ({ ...prev, delete: { isOpen: open, school: open ? prev.delete.school : null } }))}
        school={modals.delete.school}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}