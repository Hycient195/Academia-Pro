"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StudentModal } from "@/components/modals/student-modal"
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconMapPin,
  IconDots,
} from "@tabler/icons-react"

// Sample student data
const students = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    grade: "10-A",
    rollNumber: "001",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State",
    status: "Active",
    avatar: "/avatars/student1.jpg",
    enrollmentDate: "2023-08-15",
    attendance: 95,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@email.com",
    grade: "9-B",
    rollNumber: "045",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Ave, City, State",
    status: "Active",
    avatar: "/avatars/student2.jpg",
    enrollmentDate: "2023-08-14",
    attendance: 92,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    grade: "11-C",
    rollNumber: "078",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Rd, City, State",
    status: "Active",
    avatar: "/avatars/student3.jpg",
    enrollmentDate: "2023-08-13",
    attendance: 88,
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@email.com",
    grade: "12-A",
    rollNumber: "112",
    phone: "+1 (555) 456-7890",
    address: "321 Elm St, City, State",
    status: "Inactive",
    avatar: "/avatars/student4.jpg",
    enrollmentDate: "2022-08-15",
    attendance: 0,
  },
]

const gradeOptions: MultiSelectOption[] = [
  { label: "Grade 9-A", value: "9-A" },
  { label: "Grade 9-B", value: "9-B" },
  { label: "Grade 10-A", value: "10-A" },
  { label: "Grade 10-B", value: "10-B" },
  { label: "Grade 11-A", value: "11-A" },
  { label: "Grade 11-B", value: "11-B" },
  { label: "Grade 12-A", value: "12-A" },
  { label: "Grade 12-B", value: "12-B" },
]

const statusOptions: MultiSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit' | 'view'
    student?: any
  }>({
    isOpen: false,
    mode: 'create',
  })

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.rollNumber.includes(searchTerm)
    const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(student.grade)
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(student.status.toLowerCase())

    return matchesSearch && matchesGrade && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600"
    if (attendance >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    setSelectedStudents(prev =>
      checked
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? paginatedStudents.map(s => s.id) : [])
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on students:`, selectedStudents)
    setSelectedStudents([])
  }

  const openModal = (mode: 'create' | 'edit' | 'view', student?: any) => {
    setModalState({ isOpen: true, mode, student })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create' })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage student information, enrollment, and academic records
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student's information to create a new record.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Enter last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="student@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9-A">Grade 9-A</SelectItem>
                        <SelectItem value="9-B">Grade 9-B</SelectItem>
                        <SelectItem value="10-A">Grade 10-A</SelectItem>
                        <SelectItem value="10-B">Grade 10-B</SelectItem>
                        <SelectItem value="11-A">Grade 11-A</SelectItem>
                        <SelectItem value="11-B">Grade 11-B</SelectItem>
                        <SelectItem value="12-A">Grade 12-A</SelectItem>
                        <SelectItem value="12-B">Grade 12-B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Roll Number</label>
                    <Input placeholder="001" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input placeholder="123 Main St, City, State" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Student</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <IconPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>
              Search and filter students by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <MultiSelect
                  options={gradeOptions}
                  value={selectedGrades}
                  onChange={setSelectedGrades}
                  placeholder="Filter by grade"
                  className="w-40"
                />
                <MultiSelect
                  options={statusOptions}
                  value={selectedStatuses}
                  onChange={setSelectedStatuses}
                  placeholder="Filter by status"
                  className="w-40"
                />
              </div>
              <Button variant="outline">
                <IconFilter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>

            {/* Students Table */}
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.grade}</Badge>
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                          {student.attendance}%
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
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

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <IconUsers className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No students found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <div className="mt-6">
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
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        student={modalState.student}
        mode={modalState.mode}
      />
    </div>
  )
}