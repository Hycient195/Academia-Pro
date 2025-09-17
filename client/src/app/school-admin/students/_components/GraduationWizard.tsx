"use client"

import { useState, useRef, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSelect } from "@/components/ui/form/form-components"
import { toast } from "sonner"
import {
  IconAward,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconFileText,
  IconUsers,
  IconCalendar,
  IconClipboardList,
} from "@tabler/icons-react"
import { IGraduationRequestDto } from "@academia-pro/types/school-admin"
import { usePagination } from "@/components/ui/pagination"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import ErrorToast from "@/components/utilities/ErrorToast"
import { useUserAuth } from "@/redux/auth/userAuthContext"
import { useGetStudentsQuery, useBatchGraduateStudentsMutation } from "@/redux/api/school-admin/studentApis"
import { baseApi } from "@/redux/api/userBaseApi"

interface GraduationWizardProps {
  onComplete: () => void
}

interface GraduationPreview {
  studentId: string
  studentName: string
  currentGrade: string
  admissionYear: number
  yearsInSchool: number
  gpa: number
  status: 'eligible' | 'not_eligible' | 'pending_clearance'
  clearanceStatus: {
    library: boolean
    fees: boolean
    hostel: boolean
    discipline: boolean
    documents: boolean
  }
  reason?: string
}

export function GraduationWizard({ onComplete }: GraduationWizardProps) {
  const dispatch = useDispatch()
  const [currentStep, setCurrentStep] = useState<'eligibility' | 'clearance' | 'preview' | 'success'>('eligibility')
  const [graduationRequest, setGraduationRequest] = useState<Partial<IGraduationRequestDto>>({
    graduationYear: new Date().getFullYear(),
    clearanceStatus: 'cleared',
  })
  const [previewData, setPreviewData] = useState<GraduationPreview[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [executionProgress, setExecutionProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get user auth state from UserAuthContext (persists across browser refresh)
  const { user, isAuthenticated, isLoading: authLoading } = useUserAuth()

  // Clear interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])


  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  // Derive schoolId from UserAuthContext (persists across browser refresh)
  const schoolId = user?.schoolId

  const queryParams: {
    page: number;
    limit: number;
    schoolId?: string;
    search?: string;
    stages?: string[];
    gradeCodes?: string[];
    streamSections?: string[];
    statuses?: string[];
  } = {
    page: currentPage,
    limit: pageSize,
  }

  if (schoolId) queryParams.schoolId = schoolId

  const { data: studentsData } = useGetStudentsQuery(queryParams, {
    skip: !schoolId || authLoading // Skip query if no schoolId or still loading auth
  })

  const students = studentsData?.data || []

  // Graduation mutation (student API)
  const [batchGraduate, { isLoading, error: batchGraduateError }] = useBatchGraduateStudentsMutation()
  
  // Options for selects
  const currentYear = new Date().getFullYear()
  const graduationYearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i
    return { value: year.toString(), text: year.toString() }
  })
  const clearanceStatusOptions = [
    { value: 'cleared', text: 'All Clearances Required' },
    { value: 'pending', text: 'Allow Pending Clearances' }
  ]

  // Helpers
  const validateGraduationYear = (year?: number) =>
    typeof year === 'number' && Number.isInteger(year) && year >= 2000 && year <= 2100

  const isCleared = (s: GraduationPreview) => Object.values(s.clearanceStatus).every(Boolean)

  const handleRequestChange = (field: string, value: string | number) => {
    setGraduationRequest((prev: Partial<IGraduationRequestDto>) => ({
      ...prev,
      [field]: value
    }))
  }

  const generateEligibilityPreview = () => {
    if (!students.length) return

    // Filter SSS3 students only
    const sss3Students = students.filter(s => s.gradeCode === 'SSS3')

    const preview: GraduationPreview[] = sss3Students.map(student => {
      const admissionYear = student.admissionDate ? new Date(student.admissionDate).getFullYear() : new Date().getFullYear() - 3
      const currentYear = new Date().getFullYear()
      const yearsInSchool = currentYear - admissionYear

      // Use real student data for clearance status - in a real implementation,
      // this would come from integrated modules (library, fees, hostel, etc.)
      // For now, we'll use student properties to simulate clearance status
      const clearanceStatus = {
        library: student.id ? parseInt(student.id.slice(-1), 16) % 4 > 1 : true, // Better randomization
        fees: student.id ? parseInt(student.id.slice(-1), 16) % 5 > 1 : true, // Better randomization
        hostel: !student.isBoarding || (student.id ? parseInt(student.id.slice(-1), 16) % 3 > 0 : true), // Hostel only if boarding
        discipline: student.id ? parseInt(student.id.slice(-1), 16) % 6 > 0 : true, // Better randomization
        documents: (student.documents && student.documents.length > 0) || false, // Real document check
      }

      const allCleared = Object.values(clearanceStatus).every(status => status)
      let status: GraduationPreview['status'] = 'eligible'
      let reason = ''

      if (!allCleared) {
        status = 'pending_clearance'
        const pendingItems = Object.entries(clearanceStatus)
          .filter(([_, cleared]) => !cleared)
          .map(([item]) => item)
        reason = `Pending: ${pendingItems.join(', ')}`
      } else if (yearsInSchool < 3) {
        status = 'not_eligible'
        reason = `Only ${yearsInSchool} years in school (minimum 3 required)`
      }

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`,
        currentGrade: student.gradeCode || 'SSS3',
        admissionYear,
        yearsInSchool,
        gpa: student.gpa || 0, // Use real GPA if available, default to 0
        status,
        clearanceStatus,
        reason,
      }
    })

    setPreviewData(preview)
    setCurrentStep('clearance')
  }

  const handleExecute = async () => {
    // Pre-execution validations
    if (selectedStudents.size === 0) {
      toast.error('Select at least one eligible student to graduate')
      return
    }
    if (!validateGraduationYear(graduationRequest.graduationYear)) {
      toast.error('Invalid graduation year. Enter a valid 4-digit year between 2000 and 2100')
      return
    }

    // If strict clearance required, ensure all selected are fully cleared
    if ((graduationRequest.clearanceStatus ?? 'cleared') === 'cleared') {
      const selectedPreviews = previewData.filter(p => selectedStudents.has(p.studentId))
      const notCleared = selectedPreviews.filter(p => !isCleared(p))
      if (notCleared.length > 0) {
        const names = notCleared.slice(0, 3).map(n => n.studentName).join(', ')
        toast.error(`Clearance required. Pending items for ${notCleared.length} student(s): ${names}${notCleared.length > 3 ? ', ...' : ''}`)
        return
      }
    }

    // Ensure required DTO fields
    const payload: IGraduationRequestDto = {
      schoolId: schoolId!,
      graduationYear: graduationRequest.graduationYear!,
      studentIds: Array.from(selectedStudents),
      clearanceStatus: graduationRequest.clearanceStatus as 'cleared' | 'pending',
    }
    if (!payload.schoolId) {
      toast.error('Missing school context. Please re-login or ensure your account is associated with a school.')
      return
    }

    // Start progress tracking
    setExecutionProgress(10)
    const progressInterval = setInterval(() => {
      setExecutionProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    batchGraduate(payload)
    .unwrap()
    .then((result: { success: boolean; message: string; graduated: number }) => {
      setExecutionProgress(100)
      const graduatedCount = (result?.graduated ?? selectedStudents.size) as number
      toast.success(`Successfully graduated ${graduatedCount} student${graduatedCount === 1 ? '' : 's'}!`)
      dispatch(baseApi.util.invalidateTags(['Students']))
      setCurrentStep('success')
    })
    .catch((err: unknown) => {
      console.error(err)
      toast.error('Graduation failed. Please try again.', { description: <ErrorToast error={batchGraduateError} /> })
    })
    .finally(() => {
      clearInterval(progressInterval)
      setExecutionProgress(0)
    })
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const selectAllEligible = () => {
    const eligibleIds = previewData
      .filter(student => student.status === 'eligible')
      .map(student => student.studentId)
    setSelectedStudents(new Set(eligibleIds))
  }

  const updateClearanceStatus = (studentId: string, item: keyof GraduationPreview['clearanceStatus'], status: boolean) => {
    setPreviewData(prev =>
      prev.map(student =>
        student.studentId === studentId
          ? {
              ...student,
              clearanceStatus: {
                ...student.clearanceStatus,
                [item]: status
              }
            }
          : student
      )
    )
  }

  const renderEligibilityStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAward className="h-5 w-5" />
          Graduation Eligibility Check
        </CardTitle>
        <CardDescription>
          Check SSS3 students eligible for graduation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            labelText="Graduation Year"
            name="graduationYear"
            value={graduationRequest.graduationYear ? String(graduationRequest.graduationYear) : ""}
            options={graduationYearOptions}
            onChange={(e) => handleRequestChange('graduationYear', parseInt(String(e.target.value), 10))}
            placeholder="Select graduation year"
            required
          />

          <FormSelect
            labelText="Clearance Status"
            name="clearanceStatus"
            value={graduationRequest.clearanceStatus}
            options={clearanceStatusOptions}
            onChange={(e) => handleRequestChange('clearanceStatus', e.target.value as string)}
            placeholder="Select clearance status"
            required
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IconAlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Graduation Requirements:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Student must be in SSS3</li>
                <li>Minimum 3 years in school</li>
                <li>All clearance items must be resolved</li>
                <li>Academic records complete</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={generateEligibilityPreview}>
            Check Eligibility
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderClearanceStep = () => {
    const eligibleCount = previewData.filter(s => s.status === 'eligible').length
    const pendingCount = previewData.filter(s => s.status === 'pending_clearance').length

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClipboardList className="h-5 w-5" />
            Clearance Status Review
          </CardTitle>
          <CardDescription>
            Review and update clearance status for graduation candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{eligibleCount}</div>
              <div className="text-sm text-gray-600">Eligible</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
              <div className="text-sm text-gray-600">Pending Clearance</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedStudents.size}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAllEligible}>
              Select All Eligible
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudents(new Set())}
            >
              Clear Selection
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.size === eligibleCount && eligibleCount > 0}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          selectAllEligible()
                        } else {
                          setSelectedStudents(new Set())
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.has(student.studentId)}
                        onCheckedChange={() => toggleStudentSelection(student.studentId)}
                        disabled={student.status !== 'eligible'}
                      />
                    </TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.currentGrade}</TableCell>
                    <TableCell>{student.gpa ? student.gpa.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={student.clearanceStatus.library}
                        onCheckedChange={(checked) =>
                          updateClearanceStatus(student.studentId, 'library', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={student.clearanceStatus.fees}
                        onCheckedChange={(checked) =>
                          updateClearanceStatus(student.studentId, 'fees', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={student.clearanceStatus.hostel}
                        onCheckedChange={(checked) =>
                          updateClearanceStatus(student.studentId, 'hostel', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={student.clearanceStatus.discipline}
                        onCheckedChange={(checked) =>
                          updateClearanceStatus(student.studentId, 'discipline', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={student.clearanceStatus.documents}
                        onCheckedChange={(checked) =>
                          updateClearanceStatus(student.studentId, 'documents', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === 'eligible' ? 'default' :
                          student.status === 'pending_clearance' ? 'secondary' : 'destructive'
                        }
                      >
                        {student.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('eligibility')}>
              Back to Eligibility
            </Button>
            <Button onClick={() => setCurrentStep('preview')}>
              Review & Graduate
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPreviewStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFileText className="h-5 w-5" />
          Graduation Preview
        </CardTitle>
        <CardDescription>
          Final review before processing graduation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Graduation Year</h4>
              <p className="text-sm text-gray-600">{graduationRequest.graduationYear || 'Not specified'}</p>
            </div>
            <IconCalendar className="h-8 w-8 text-blue-600" />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Students to Graduate</h4>
              <p className="text-sm text-gray-600">{selectedStudents.size} SSS3 student{selectedStudents.size > 1 ? 's' : ''} </p>
            </div>
            <IconUsers className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IconCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Ready for Graduation!</p>
              <p className="mt-1">
                All selected students have met the graduation requirements and clearance criteria.
              </p>
            </div>
          </div>
        </div>
        <ErrorBlock error={batchGraduateError} />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('clearance')}>
            Back to Clearance
          </Button>
          <Button
            onClick={handleExecute}
            isLoading={isLoading}
            disabled={selectedStudents.size === 0}
          >
            Process Graduation
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAward className="h-5 w-5" />
          Graduation Complete
        </CardTitle>
        <CardDescription>
          Graduation ceremony has been processed successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-8">
          <IconAward className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">🎓 Congratulations!</h3>
          <p className="text-gray-600 mb-4">
            {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} have successfully graduated from {graduationRequest.graduationYear || 'the current'} class.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong><br />
              • Generate certificates<br />
              • Update alumni records<br />
              • Send graduation notifications
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onComplete}>
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Show loading state while authentication is being restored
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Restoring session...</p>
        </div>
      </div>
    )
  }

  // Show error state if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the graduation wizard.</p>
        </div>
      </div>
    )
  }

  // Show error state if no school context
  if (!schoolId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">School Context Missing</h2>
          <p className="text-gray-600">Unable to determine your school context. Please re-login or contact your administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Error Block */}
        <ErrorBlock error={batchGraduateError} />

        {/* Progress indicator */}
        {currentStep !== 'success' && (
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'eligibility' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'eligibility' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm">Eligibility</span>
            </div>
            <div className={`w-12 h-0.5 ${['clearance', 'preview'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${currentStep === 'clearance' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'clearance' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm">Clearance</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep === 'preview' ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm">Preview</span>
            </div>
          </div>
        )}

        {currentStep === 'eligibility' && renderEligibilityStep()}
        {currentStep === 'clearance' && renderClearanceStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'success' && renderSuccessStep()}

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing graduation...</span>
              <span>{executionProgress}%</span>
            </div>
            <Progress value={executionProgress} />
          </div>
        )}
      </div>
    </div>
  )
}