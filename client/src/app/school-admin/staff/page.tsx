"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Pagination, usePagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import {
  IconUserShield,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconCalendar,
  IconUsers,
  IconTrendingUp,
  IconLoader,
} from "@tabler/icons-react"
import {
  useGetStaffDashboardQuery,
  useGetAllStaffQuery,
  useSearchStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useTerminateStaffMutation,
  useSuspendStaffMutation,
  useReactivateStaffMutation,
} from "@/redux/api/school-admin/staffApis"
import { IStaffResponse, TEmploymentStatus, TDepartment } from "@academia-pro/types/staff"
import { StaffModal } from "@/app/school-admin/staff/_components/CreateStaffModal"

export default function StaffPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const schoolId = user?.schoolId || ""

  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  // API calls
  const { data: dashboardData, isLoading: dashboardLoading } = useGetStaffDashboardQuery(schoolId, {
    skip: !schoolId,
  })

  const { data: staffData, isLoading: staffLoading } = useGetAllStaffQuery({
    schoolId,
    search: searchTerm || undefined,
    department: departmentFilter !== "all" ? departmentFilter as TDepartment : undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  }, {
    skip: !schoolId,
  })

  const staffMembers = staffData || []
  const statistics = dashboardData?.summary

  // The filtering is now done on the API side, so we use the returned data directly
  const totalItems = staffMembers.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedStaff = staffMembers

  const getRoleBadge = (position: string) => {
    const colors: Record<string, string> = {
      "principal": "bg-purple-100 text-purple-800",
      "vice_principal": "bg-purple-100 text-purple-800",
      "headmaster": "bg-purple-100 text-purple-800",
      "librarian": "bg-blue-100 text-blue-800",
      "accountant": "bg-green-100 text-green-800",
      "administrator": "bg-green-100 text-green-800",
      "clerk": "bg-gray-100 text-gray-800",
      "driver": "bg-orange-100 text-orange-800",
      "security_guard": "bg-red-100 text-red-800",
      "nurse": "bg-pink-100 text-pink-800",
      "technician": "bg-indigo-100 text-indigo-800",
      "janitor": "bg-yellow-100 text-yellow-800",
      "cook": "bg-orange-100 text-orange-800",
      "secretary": "bg-cyan-100 text-cyan-800",
    }
    return (
      <Badge className={colors[position.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {position.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: TEmploymentStatus) => {
    const colors: Record<TEmploymentStatus, string> = {
      "active": "bg-green-100 text-green-800",
      "inactive": "bg-yellow-100 text-yellow-800",
      "terminated": "bg-red-100 text-red-800",
      "on_leave": "bg-blue-100 text-blue-800",
      "suspended": "bg-orange-100 text-orange-800",
    }
    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 85) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-4">
      <div className="flex flex-col gap-4 md:gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage staff information, roles, departments, and HR records
            </p>
          </div>
          <Button onClick={() => setIsStaffModalOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <IconUserShield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalStaff || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.activeStaff || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${statistics?.averageSalary?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Monthly average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <IconBriefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(statistics?.byDepartment || {}).length}</div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-2">
          <TabsList>
            <TabsTrigger value="directory">Staff Directory</TabsTrigger>
            <TabsTrigger value="departments">Departmments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>
                  Search and manage staff members across all departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Physical Education">Physical Education</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Principal">Principal</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>

                {/* Staff Table */}
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {staff.fullName.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{staff.fullName}</p>
                                <p className="text-sm text-muted-foreground">{staff.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(staff.position)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{staff.department}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(staff.employmentStatus)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconCalendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{new Date(staff.hireDate).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconMail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconPhone className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {staffMembers.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statistics?.byDepartment && Object.entries(statistics.byDepartment).map(([deptName, count]) => (
                <Card key={deptName} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <Badge variant="secondary">{count} members</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{deptName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Department overview and management
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Attendance Overview</CardTitle>
                <CardDescription>Monthly attendance statistics for all staff members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffMembers.slice(0, 5).map((staff) => (
                  <div key={staff.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {staff.fullName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{staff.fullName}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {staff.employmentStatus === 'active' ? 'Present' : 'N/A'}
                      </span>
                    </div>
                    <Progress value={staff.employmentStatus === 'active' ? 95 : 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>Salary information and payroll processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffMembers.slice(0, 3).map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {staff.fullName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.fullName}</p>
                          <p className="text-sm text-muted-foreground">{staff.position}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${staff.currentSalary?.toLocaleString() || '0'}</p>
                        <p className="text-sm text-muted-foreground">Monthly</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSuccess={() => {
          // Refresh the staff data
          // The RTK Query will automatically refetch due to invalidation
        }}
        schoolId={schoolId}
      />
    </div>
  )
}