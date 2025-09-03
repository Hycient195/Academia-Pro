"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { useGetAllSchoolsQuery, useCreateSchoolMutation } from "@/store/api/superAdminApi"
import type { SchoolFilters, CreateSchoolRequest } from "@/store/api/superAdminApi"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import { FormCountrySelect, FormRegionSelect, FormSelect, FormText, FormTextArea, FormPhoneInput } from "@/components/ui/form-components"

export default function SchoolsPage() {
  const [filters, setFilters] = useState<SchoolFilters>({
    page: 1,
    limit: 10
  })

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSchool, setNewSchool] = useState<CreateSchoolRequest>({
    name: '',
    type: '',
    address: '',
    city: '',
    state: '',
    country: '',
    email: '',
    phone: '',
    subscriptionPlan: ''
  })

  const { data: schoolsData, isLoading } = useGetAllSchoolsQuery(filters)
  const [createSchool, { isLoading: isCreating, error: createSchoolError }] = useCreateSchoolMutation()

  const schools = schoolsData?.schools || []
  const total = schoolsData?.total || 0

  const handleCreateSchool = async () => {
    try {
      await createSchool(newSchool).unwrap()
      setIsAddDialogOpen(false)
      setNewSchool({
        name: '',
        type: '',
        address: '',
        city: '',
        state: '',
        country: '',
        email: '',
        phone: '',
        subscriptionPlan: ''
      })
      // Success message could be added here
    } catch (error) {
      // Error handling could be added here
      console.error('Failed to create school:', error)
    }
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
        {type}
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all schools in the system
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="h-4 w-4 mr-2" />
              Add New School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
              <DialogDescription>
                Create a new school in the Academia Pro system. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormText
                  labelText="School Name *"
                  placeholder="Enter school name"
                  value={newSchool.name}
                  onChange={(arg) => {
                    if ('nativeEvent' in arg) {
                      setNewSchool({ ...newSchool, name: arg.target.value })
                    } else {
                      setNewSchool({ ...newSchool, name: arg.target.value as string })
                    }
                  }}
                  required
                />
                <FormSelect
                  labelText="School Type *"
                  placeholder="Select type"
                  options={[
                    { text: "Primary", value: "primary" },
                    { text: "Secondary", value: "secondary" },
                    { text: "Mixed", value: "mixed" }
                  ]}
                  value={newSchool.type}
                  onChange={(arg) => setNewSchool({ ...newSchool, type: arg.target.value as string })}
                  required
                />
              </div>

              <FormTextArea
                labelText="Address *"
                id="address"
                value={newSchool.address}
                onChange={(arg) => {
                  if ('nativeEvent' in arg) {
                    setNewSchool({ ...newSchool, address: arg.target.value })
                  } else {
                    setNewSchool({ ...newSchool, address: arg.target.value as string })
                  }
                }}
                placeholder="Enter school address"
                required
              />

              <div className="grid grid-cols-3 gap-4">
                <FormCountrySelect
                  labelText="Country *"
                  showFlag
                  id="country"
                  value={newSchool.country}
                  onChange={(arg) => setNewSchool({ ...newSchool, country: arg.target.value as string })}
                  placeholder="Country"
                />
                <FormRegionSelect
                  countryCode={newSchool.country}
                  id="state"
                  value={newSchool.state}
                  labelText="State *"
                  onChange={(arg) => setNewSchool({ ...newSchool, state: arg.target.value as string })}
                  placeholder="State"
                />
                <FormText
                  labelText="City *"
                  id="city"
                  value={newSchool.city}
                  onChange={(arg) => {
                    if ('nativeEvent' in arg) {
                      setNewSchool({ ...newSchool, city: arg.target.value })
                    } else {
                      setNewSchool({ ...newSchool, city: arg.target.value as string })
                    }
                  }}
                  placeholder="City"
                />
                
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormText
                  labelText="Email *"
                  id="email"
                  type="email"
                  value={newSchool.email}
                  onChange={(arg) => {
                    if ('nativeEvent' in arg) {
                      setNewSchool({ ...newSchool, email: arg.target.value })
                    } else {
                      setNewSchool({ ...newSchool, email: arg.target.value as string })
                    }
                  }}
                  placeholder="school@example.com"
                  required
                />
                <FormPhoneInput
                  labelText="Phone *"
                  id="phone"
                  value={newSchool.phone}
                  onChange={(arg) => setNewSchool({ ...newSchool, phone: arg.target.value as string })}
                  placeholder="+1-555-0123"
                  required
                />
              </div>

              <FormSelect
                labelText="Subscription Plan *"
                value={newSchool.subscriptionPlan}
                onChange={(arg) => setNewSchool({ ...newSchool, subscriptionPlan: arg.target.value as string })}
                options={[
                  { value: "basic", text: "Basic" },
                  { value: "premium", text: "Premium" },
                  { value: "enterprise", text: "Enterprise" }
                ]}
                placeholder="Select plan"
                required
              />
            </div>
            <ErrorBlock error={createSchoolError} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchool} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create School'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type || ""}
                onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Plan</label>
              <Select
                value={filters.subscriptionPlan || ""}
                onValueChange={(value) => setFilters({ ...filters, subscriptionPlan: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconBuilding className="h-5 w-5 mr-2" />
            Schools ({total})
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
                  <TableCell>{getTypeBadge(school.type || 'primary')}</TableCell>
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
                        {school.location?.city || school.address?.city || 'N/A'}, {school.location?.state || school.address?.state || 'N/A'}
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
                        <DropdownMenuItem>
                          <IconEye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconEdit className="h-4 w-4 mr-2" />
                          Edit School
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>
    </div>
  )
}