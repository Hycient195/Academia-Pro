"use client"

import { useState } from "react"
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
} from "@tabler/icons-react"

// Sample staff data
const staffMembers = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@school.com",
    role: "Principal",
    department: "Administration",
    phone: "+1 (555) 123-4567",
    status: "Active",
    avatar: "/avatars/principal.jpg",
    joinDate: "2018-08-15",
    salary: 85000,
    attendance: 98,
  },
  {
    id: 2,
    name: "Mr. John Davis",
    email: "john.davis@school.com",
    role: "Mathematics Teacher",
    department: "Mathematics",
    phone: "+1 (555) 234-5678",
    status: "Active",
    avatar: "/avatars/teacher1.jpg",
    joinDate: "2020-08-15",
    salary: 55000,
    attendance: 95,
  },
  {
    id: 3,
    name: "Ms. Emily Chen",
    email: "emily.chen@school.com",
    role: "Science Teacher",
    department: "Science",
    phone: "+1 (555) 345-6789",
    status: "Active",
    avatar: "/avatars/teacher2.jpg",
    joinDate: "2019-08-15",
    salary: 52000,
    attendance: 97,
  },
  {
    id: 4,
    name: "Mr. Robert Wilson",
    email: "robert.wilson@school.com",
    role: "Administrator",
    department: "Administration",
    phone: "+1 (555) 456-7890",
    status: "Active",
    avatar: "/avatars/admin.jpg",
    joinDate: "2021-01-15",
    salary: 45000,
    attendance: 92,
  },
]

const departments = [
  { name: "Administration", count: 3, color: "bg-blue-500" },
  { name: "Mathematics", count: 4, color: "bg-green-500" },
  { name: "Science", count: 5, color: "bg-purple-500" },
  { name: "English", count: 3, color: "bg-orange-500" },
  { name: "History", count: 2, color: "bg-red-500" },
  { name: "Physical Education", count: 2, color: "bg-yellow-500" },
]

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || staff.department === departmentFilter
    const matchesRole = roleFilter === "all" || staff.role === roleFilter

    return matchesSearch && matchesDepartment && matchesRole
  })

  // Pagination logic
  const totalItems = filteredStaff.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex)

  const getRoleBadge = (role: string) => {
    const colors = {
      "Principal": "bg-purple-100 text-purple-800",
      "Teacher": "bg-blue-100 text-blue-800",
      "Administrator": "bg-green-100 text-green-800",
    }
    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {role}
      </Badge>
    )
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return "text-green-600"
    if (attendance >= 85) return "text-yellow-600"
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
          <Button>
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
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                Active employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <IconBriefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                This quarter
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-2">
          <TabsList>
            <TabsTrigger value="directory">Staff Directory</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
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
                                <AvatarImage src={staff.avatar} />
                                <AvatarFallback>
                                  {staff.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">{staff.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(staff.role)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{staff.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getAttendanceColor(staff.attendance)}`}>
                              {staff.attendance}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconCalendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{new Date(staff.joinDate).toLocaleDateString()}</span>
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
                {filteredStaff.length > 0 && (
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
              {departments.map((dept) => (
                <Card key={dept.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                      <Badge variant="secondary">{dept.count} members</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
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
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback className="text-xs">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{staff.name}</span>
                      </div>
                      <span className={`text-sm font-medium ${getAttendanceColor(staff.attendance)}`}>
                        {staff.attendance}%
                      </span>
                    </div>
                    <Progress value={staff.attendance} className="h-2" />
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
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback>
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${staff.salary.toLocaleString()}</p>
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
    </div>
  )
}