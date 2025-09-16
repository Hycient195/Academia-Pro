"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select"
import { Pagination, usePagination } from "@/components/ui/pagination"
import apis from "@/redux/api"
const { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation } = apis.schoolAdmin.student
import type { ISchoolAdminStudent, IStudent } from "@academia-pro/types/school-admin"
import type { TStudentStage, TGradeCode, ICreateStudentRequest } from "@academia-pro/types/student/student.types"
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
  IconUpload,
  IconDownload,
  IconArrowRight,
  IconAward,
  IconTransfer,
} from "@tabler/icons-react"
import { toast } from "sonner"

// Import form components
import {
  FormText,
  FormSelect,
  FormDateInput,
  FormPhoneInput,
  FormTextArea,
  FormMultiSelect,
  FormCountrySelect,
  FormRegionSelect,
} from "@/components/ui/form/form-components"

// Import wizard components
import { StudentCreationForm } from "./_components/StudentCreationForm"
import { BulkImportWizard } from "./_components/BulkImportWizard"
import { PromotionWizard } from "./_components/PromotionWizard"
import { TransferWizard } from "./_components/TransferWizard"
import { GraduationWizard } from "./_components/GraduationWizard"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Constants for form options
const stageOptions: MultiSelectOption[] = [
  { label: "Early Years (EY)", value: "EY" },
  { label: "Primary (PRY)", value: "PRY" },
  { label: "Junior Secondary (JSS)", value: "JSS" },
  { label: "Senior Secondary (SSS)", value: "SSS" },
]

const gradeCodeOptions: MultiSelectOption[] = [
  // EY
  { label: "Creche", value: "CRECHE" },
  { label: "Nursery 1", value: "N1" },
  { label: "Nursery 2", value: "N2" },
  { label: "KG 1", value: "KG1" },
  { label: "KG 2", value: "KG2" },
  // PRY
  { label: "Primary 1", value: "PRY1" },
  { label: "Primary 2", value: "PRY2" },
  { label: "Primary 3", value: "PRY3" },
  { label: "Primary 4", value: "PRY4" },
  { label: "Primary 5", value: "PRY5" },
  { label: "Primary 6", value: "PRY6" },
  // JSS
  { label: "JSS 1", value: "JSS1" },
  { label: "JSS 2", value: "JSS2" },
  { label: "JSS 3", value: "JSS3" },
  // SSS
  { label: "SSS 1", value: "SSS1" },
  { label: "SSS 2", value: "SSS2" },
  { label: "SSS 3", value: "SSS3" },
]

const statusOptions: MultiSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Graduated", value: "graduated" },
  { label: "Transferred", value: "transferred" },
  { label: "Withdrawn", value: "withdrawn" },
  { label: "Suspended", value: "suspended" },
]

const streamSectionOptions: MultiSelectOption[] = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "Science Stream", value: "Science" },
  { label: "Arts Stream", value: "Arts" },
  { label: "Commercial Stream", value: "Commercial" },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedGradeCodes, setSelectedGradeCodes] = useState<string[]>([])
  const [selectedStreamSections, setSelectedStreamSections] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Modal states
  const [studentCreationOpen, setStudentCreationOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [promotionWizardOpen, setPromotionWizardOpen] = useState(false)
  const [transferWizardOpen, setTransferWizardOpen] = useState(false)
  const [graduationWizardOpen, setGraduationWizardOpen] = useState(false)

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params dynamically, excluding undefined values
  const queryParams: {
    page: number;
    limit: number;
    search?: string;
    stages?: string[];
    gradeCodes?: string[];
    streamSections?: string[];
    statuses?: string[];
  } = {
    page: currentPage,
    limit: pageSize,
  }

  if (debouncedSearchTerm) queryParams.search = debouncedSearchTerm
  if (selectedStages.length > 0) queryParams.stages = selectedStages
  if (selectedGradeCodes.length > 0) queryParams.gradeCodes = selectedGradeCodes
  if (selectedStreamSections.length > 0) queryParams.streamSections = selectedStreamSections
  if (selectedStatuses.length > 0) queryParams.statuses = selectedStatuses

  const { data, isFetching, refetch } = useGetStudentsQuery(queryParams)

  const [createStudent] = useCreateStudentMutation()
  const [updateStudent] = useUpdateStudentMutation()
  const [deleteStudent] = useDeleteStudentMutation()

  const students: IStudent[] = data?.data ?? []
  const totalItems = data?.pagination?.total ?? 0
  const totalPages = data?.pagination?.totalPages ?? 1

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      graduated: "bg-blue-100 text-blue-800",
      transferred: "bg-amber-100 text-amber-800",
      withdrawn: "bg-red-100 text-red-800",
      suspended: "bg-red-100 text-red-800",
    }
    const cls = map[s] || "bg-secondary"
    const label = s.charAt(0).toUpperCase() + s.slice(1)
    return <Badge variant="default" className={cls}>{label}</Badge>
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev =>
      checked
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? students.map((s) => s.id) : [])
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on students:`, selectedStudents)
    setSelectedStudents([])
  }

  const handleStudentCreated = () => {
    setStudentCreationOpen(false)
    refetch()
    toast.success("Student created successfully")
  }

  const handleBulkImport = () => {
    setBulkImportOpen(false)
    refetch()
    toast.success("Students imported successfully")
  }

  const handlePromotion = () => {
    setPromotionWizardOpen(false)
    refetch()
    toast.success("Promotion completed successfully")
  }

  const handleTransfer = () => {
    setTransferWizardOpen(false)
    refetch()
    toast.success("Transfer completed successfully")
  }

  const handleGraduation = () => {
    setGraduationWizardOpen(false)
    refetch()
    toast.success("Graduation completed successfully")
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId).unwrap()
      refetch()
      toast.success("Student deleted successfully")
    } catch (error) {
      toast.error("Failed to delete student")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage student information, enrollment, and academic records
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <IconUpload className="mr-2 h-4 w-4" />
                  Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Bulk Import Students</DialogTitle>
                  <DialogDescription>
                    Upload a CSV or Excel file to import multiple students at once.
                  </DialogDescription>
                </DialogHeader>
                <BulkImportWizard onComplete={handleBulkImport} />
              </DialogContent>
            </Dialog>

            <Dialog open={studentCreationOpen} onOpenChange={setStudentCreationOpen}>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the student&apos;s information to create a new record.
                  </DialogDescription>
                </DialogHeader>
                <StudentCreationForm onComplete={handleStudentCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={promotionWizardOpen} onOpenChange={setPromotionWizardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconArrowRight className="mr-2 h-4 w-4" />
                Promote Students
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Student Promotion</DialogTitle>
                <DialogDescription>
                  Promote students to the next grade level.
                </DialogDescription>
              </DialogHeader>
              <PromotionWizard onComplete={handlePromotion} />
            </DialogContent>
          </Dialog>

          <Dialog open={transferWizardOpen} onOpenChange={setTransferWizardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconTransfer className="mr-2 h-4 w-4" />
                Transfer Students
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Student Transfer</DialogTitle>
                <DialogDescription>
                  Transfer students between classes or schools.
                </DialogDescription>
              </DialogHeader>
              <TransferWizard onComplete={handleTransfer} />
            </DialogContent>
          </Dialog>

          <Dialog open={graduationWizardOpen} onOpenChange={setGraduationWizardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconAward className="mr-2 h-4 w-4" />
                Graduate Students
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Student Graduation</DialogTitle>
                <DialogDescription>
                  Mark students as graduated and update their records.
                </DialogDescription>
              </DialogHeader>
              <GraduationWizard onComplete={handleGraduation} />
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
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graduated</CardTitle>
              <IconAward className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === 'graduated').length}
              </div>
              <p className="text-xs text-muted-foreground">
                This academic year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transferred</CardTitle>
              <IconTransfer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === 'transferred').length}
              </div>
              <p className="text-xs text-muted-foreground">
                This academic year
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
                <FormText
                  labelText=""
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Search Debug - New search term:', e.target.value);
                    setSearchTerm(e.target.value as string);
                  }}
                  icon={<IconSearch className="h-4 w-4" />}
                  wrapperClassName="flex-1 max-w-sm"
                />

                <FormMultiSelect
                  options={stageOptions.map(opt => ({ value: opt.value, text: opt.label }))}
                  value={selectedStages}
                  onChange={(arg) => {
                    console.log('Filter Debug - Stage filter changed:', (arg as { target: { value: string[] } }).target.value);
                    setSelectedStages((arg as { target: { value: string[] } }).target.value);
                  }}
                  placeholder="Filter by stage"
                  wrapperClassName="w-40"
                />

                <FormMultiSelect
                  options={gradeCodeOptions.map(opt => ({ value: opt.value, text: opt.label }))}
                  value={selectedGradeCodes}
                  onChange={(arg) => {
                    console.log('Filter Debug - Grade code filter changed:', (arg as { target: { value: string[] } }).target.value);
                    setSelectedGradeCodes((arg as { target: { value: string[] } }).target.value);
                  }}
                  placeholder="Filter by grade code"
                  wrapperClassName="w-48"
                />

                <FormMultiSelect
                  options={streamSectionOptions.map(opt => ({ value: opt.value, text: opt.label }))}
                  value={selectedStreamSections}
                  onChange={(arg) => {
                    console.log('Filter Debug - Stream section filter changed:', (arg as { target: { value: string[] } }).target.value);
                    setSelectedStreamSections((arg as { target: { value: string[] } }).target.value);
                  }}
                  placeholder="Filter by stream/section"
                  wrapperClassName="w-48"
                />

                <FormMultiSelect
                  options={statusOptions.map(opt => ({ value: opt.value, text: opt.label }))}
                  value={selectedStatuses}
                  onChange={(arg) => {
                    console.log('Filter Debug - Status filter changed:', (arg as { target: { value: string[] } }).target.value);
                    setSelectedStatuses((arg as { target: { value: string[] } }).target.value);
                  }}
                  placeholder="Filter by status"
                  wrapperClassName="w-40"
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Stage/Grade/Section</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {(student.firstName?.[0] || '') + (student.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{`${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()}</p>
                            {student.email && <p className="text-sm text-muted-foreground">{student.email}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary">{student.stage}</Badge>
                          <Badge variant="outline">{student.gradeCode}</Badge>
                          <Badge variant="default" className="text-xs">{student.streamSection}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{student.admissionNumber}</TableCell>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link prefetch href={`/school-admin/students/${student.id}`} className="flex items-center">
                                <IconEye className="mr-2 h-4 w-4" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!isFetching && students.length === 0 && (
              <div className="text-center py-8">
                <IconUsers className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No students found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalItems > 0 && (
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
    </div>
  )
}