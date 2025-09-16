"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import apis from "@/redux/api"
const { useGetStudentsQuery, useExecutePromotionMutation } = apis.schoolAdmin.student
import { TStudentStage, TGradeCode } from "@academia-pro/types/student/student.types"
import {
  IconUsers,
  IconArrowUp,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconEye,
  IconSettings,
} from "@tabler/icons-react"
import { IPromotionRequest } from "@academia-pro/types/school-admin"
import { useUserAuth } from "@/redux/auth/userAuthContext"
import { usePagination } from "@/components/ui/pagination"
import { FormStudentSelect } from "@/components/ui/form/FormStudentSelect"
import { FormAcademicYearSelector, FormSelect, FormText } from "@/components/ui/form/form-components"

interface PromotionWizardProps {
  onComplete: () => void
}

interface PromotionPreview {
  studentId: string
  studentName: string
  currentGrade: TGradeCode
  currentStage: TStudentStage
  targetGrade: TGradeCode
  targetStage: TStudentStage
  status: 'eligible' | 'repeat' | 'graduated' | 'excluded'
  reason?: string
}

export function PromotionWizard({ onComplete }: PromotionWizardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'scope-preview' | 'execute'>('scope-preview')
  const [promotionRequest, setPromotionRequest] = useState<Partial<IPromotionRequest>>({
    scope: 'all',
    academicYear: new Date().getFullYear().toString(),
    includeRepeaters: false,
  })
  const [previewData, setPreviewData] = useState<PromotionPreview[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [executionProgress, setExecutionProgress] = useState(0)
  const [executionCompleted, setExecutionCompleted] = useState(false)

  // Check authentication status
  const { isAuthenticated, isLoading: authLoading } = useUserAuth()

  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

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

  const { data: studentsData, error: studentsError, isLoading: studentsLoading } = useGetStudentsQuery(queryParams)

  const [executePromotion, { isLoading: isPromotionLoading }] = useExecutePromotionMutation()

  const students = studentsData?.data || []

  // Show authentication error if user is not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconAlertTriangle className="h-5 w-5 text-amber-600" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                You need to be logged in to access the student promotion wizard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please log in to your account to continue with student promotion operations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const gradeOptions: Record<TStudentStage, Array<{ value: TGradeCode; text: string }>> = {
    EY: [
      { value: "CRECHE", text: "Creche" },
      { value: "N1", text: "Nursery 1" },
      { value: "N2", text: "Nursery 2" },
      { value: "KG1", text: "KG 1" },
      { value: "KG2", text: "KG 2" },
    ],
    PRY: [
      { value: "PRY1", text: "Primary 1" },
      { value: "PRY2", text: "Primary 2" },
      { value: "PRY3", text: "Primary 3" },
      { value: "PRY4", text: "Primary 4" },
      { value: "PRY5", text: "Primary 5" },
      { value: "PRY6", text: "Primary 6" },
    ],
    JSS: [
      { value: "JSS1", text: "JSS 1" },
      { value: "JSS2", text: "JSS 2" },
      { value: "JSS3", text: "JSS 3" },
    ],
    SSS: [
      { value: "SSS1", text: "SSS 1" },
      { value: "SSS2", text: "SSS 2" },
      { value: "SSS3", text: "SSS 3" },
    ],
  }

  const getNextGrade = (currentGrade: TGradeCode): { grade: TGradeCode | null; stage: TStudentStage | null } => {
    const allGrades = [
      ...gradeOptions.EY.map(g => g.value),
      ...gradeOptions.PRY.map(g => g.value),
      ...gradeOptions.JSS.map(g => g.value),
      ...gradeOptions.SSS.map(g => g.value),
    ]

    const currentIndex = allGrades.indexOf(currentGrade)
    if (currentIndex === -1 || currentIndex === allGrades.length - 1) {
      return { grade: null, stage: null } // No next grade or already at highest
    }

    const nextGrade = allGrades[currentIndex + 1]

    // Determine the stage for the next grade
    let nextStage: TStudentStage | null = null
    if (gradeOptions.EY.some(g => g.value === nextGrade)) {
      nextStage = TStudentStage.EY
    } else if (gradeOptions.PRY.some(g => g.value === nextGrade)) {
      nextStage = TStudentStage.PRY
    } else if (gradeOptions.JSS.some(g => g.value === nextGrade)) {
      nextStage = TStudentStage.JSS
    } else if (gradeOptions.SSS.some(g => g.value === nextGrade)) {
      nextStage = TStudentStage.SSS
    }

    return { grade: nextGrade, stage: nextStage }
  }

  const getStageFromGrade = (grade: TGradeCode): TStudentStage | null => {
    if (gradeOptions.EY.some(g => g.value === grade)) return TStudentStage.EY
    if (gradeOptions.PRY.some(g => g.value === grade)) return TStudentStage.PRY
    if (gradeOptions.JSS.some(g => g.value === grade)) return TStudentStage.JSS
    if (gradeOptions.SSS.some(g => g.value === grade)) return TStudentStage.SSS
    return null
  }

  // Validation functions
  const validateAcademicYear = (year: string): boolean => {
    const yearPattern = /^\d{4}-\d{4}$/
    if (!yearPattern.test(year)) return false

    const [startYear, endYear] = year.split('-').map(Number)
    return endYear === startYear + 1
  }

  const validateGradeCode = (gradeCode: string): boolean => {
    const allGrades = [
      ...gradeOptions.EY.map(g => g.value),
      ...gradeOptions.PRY.map(g => g.value),
      ...gradeOptions.JSS.map(g => g.value),
      ...gradeOptions.SSS.map(g => g.value),
    ]
    return allGrades.includes(gradeCode as TGradeCode)
  }

  const validatePromotionRequest = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate academic year
    if (!promotionRequest.academicYear || !validateAcademicYear(promotionRequest.academicYear)) {
      errors.push('Invalid academic year format. Use YYYY-YYYY format (e.g., 2024-2025)')
    }

    // Validate scope-specific requirements
    if (promotionRequest.scope === 'grade') {
      if (!promotionRequest.gradeCode) {
        errors.push('Grade code is required when promoting a specific grade')
      } else if (!validateGradeCode(promotionRequest.gradeCode)) {
        errors.push('Invalid grade code selected')
      }
    }

    if (promotionRequest.scope === 'section') {
      if (!promotionRequest.streamSection) {
        errors.push('Section is required when promoting a specific section')
      }
    }

    if (promotionRequest.scope === 'students') {
      if (selectedStudentIds.size === 0) {
        errors.push('At least one student must be selected for individual promotion')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  const validateTargetGrade = (targetGrade: TGradeCode | null): boolean => {
    if (!targetGrade) return false
    return validateGradeCode(targetGrade)
  }

  const handleScopeChange = (field: string, value: unknown) => {
    setPromotionRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAcademicYearChange = (value: string) => {
    if (!validateAcademicYear(value)) {
      toast.error('Invalid academic year format. Use YYYY-YYYY format (e.g., 2024-2025)')
      return
    }
    handleScopeChange('academicYear', value)
  }

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  const handleStudentSelectChange = (value: string) => {
    if (value && !selectedStudentIds.has(value)) {
      setSelectedStudentIds(prev => new Set([...prev, value]))
    }
  }

  const generatePreview = () => {
    // Validate promotion request before proceeding
    const validation = validatePromotionRequest()
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`)
      return
    }

    // Check for API errors
    if (studentsError) {
      console.error('API error loading students:', studentsError)
      toast.error('Failed to load students data. Please check your connection and try again.')
      return
    }

    // Check if data is still loading
    if (studentsLoading) {
      console.log('Students data is still loading')
      toast.error('Please wait for students data to load before generating preview.')
      return
    }

    // Check if we have students data
    if (!studentsData) {
      console.error('No students data available')
      toast.error('Unable to load students data. Please try again.')
      return
    }

    if (!students.length) {
      console.warn('No students found in the system')
      toast.error('No students found in the system. Please ensure students are enrolled.')
      return
    }

    try {
      let filteredStudents = students

      // Apply scope filters
      if (promotionRequest.scope === 'grade' && promotionRequest.gradeCode) {
        filteredStudents = students.filter(s => s.gradeCode === promotionRequest.gradeCode)
        console.log(`Filtered to grade ${promotionRequest.gradeCode}:`, filteredStudents.length, 'students')
      } else if (promotionRequest.scope === 'section' && promotionRequest.streamSection) {
        filteredStudents = students.filter(s => s.streamSection === promotionRequest.streamSection)
        console.log(`Filtered to section ${promotionRequest.streamSection}:`, filteredStudents.length, 'students')
      } else if (promotionRequest.scope === 'students') {
        filteredStudents = students.filter(s => selectedStudentIds.has(s.id))
        console.log(`Selected ${selectedStudentIds.size} students:`, filteredStudents.length, 'students found')
      }

      if (filteredStudents.length === 0) {
        console.warn('No students match the selected criteria')
        toast.error('No students found matching the selected criteria. Please adjust your filters.')
        return
      }

      // Generate preview data
      const preview: PromotionPreview[] = filteredStudents.map(student => {
        const currentGrade = student.gradeCode as TGradeCode
        const nextGradeResult = getNextGrade(currentGrade)
        let status: PromotionPreview['status'] = 'eligible'
        let reason = ''

        if (!nextGradeResult.grade) {
          status = 'graduated'
          reason = 'Already at highest grade'
        } else if (student.status !== 'active') {
          status = 'excluded'
          reason = `Student status: ${student.status}`
        } else if (promotionRequest.includeRepeaters === false) {
          // Mock probation check - in real implementation this would come from student data
          status = 'repeat'
          reason = 'Academic probation'
        }

        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          currentGrade: currentGrade,
          currentStage: getStageFromGrade(currentGrade) || TStudentStage.PRY,
          targetGrade: nextGradeResult.grade || currentGrade,
          targetStage: nextGradeResult.stage || getStageFromGrade(currentGrade) || TStudentStage.PRY,
          status,
          reason,
        }
      })

      console.log('Generated preview data:', preview.length, 'students')
      setPreviewData(preview)
      // Stay in scope-preview step, preview will be shown in the same step

      toast.success(`Generated preview for ${preview.length} students`)
    } catch (error) {
      console.error('Error generating preview:', error)
      toast.error('Failed to generate preview. Please try again.')
    }
  }

  // Reset wizard state
  const resetWizard = () => {
    setCurrentStep('scope-preview')
    setPromotionRequest({
      scope: 'all',
      academicYear: new Date().getFullYear().toString(),
      includeRepeaters: false,
    })
    setPreviewData([])
    setSelectedStudentIds(new Set())
    setExecutionProgress(0)
    setIsLoading(false)
    setExecutionCompleted(false)
  }

  const handleExecute = async () => {
    setIsLoading(true)
    let progressInterval: NodeJS.Timeout | null = null

    try {
      setExecutionProgress(0)

      // Simulate progress with proper cleanup
      progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Calculate target grade based on scope with better error handling
      let targetGradeCode: TGradeCode | null = null;
      let calculationError = ''

      try {
        if (promotionRequest.scope === 'grade' && promotionRequest.gradeCode) {
          // If promoting a specific grade, calculate next grade for that grade
          const nextGradeResult = getNextGrade(promotionRequest.gradeCode as TGradeCode);
          targetGradeCode = nextGradeResult.grade;
          if (!targetGradeCode) {
            calculationError = `No valid next grade found for ${promotionRequest.gradeCode}. This may be the highest grade level.`
          }
        } else if (promotionRequest.scope === 'students' && selectedStudentIds.size > 0) {
          // For specific students, we need to determine target grade
          // This is a simplified approach - in production, you might want to calculate per student
          const firstStudent = students.find(s => selectedStudentIds.has(s.id))
          if (firstStudent) {
            const nextGradeResult = getNextGrade(firstStudent.gradeCode as TGradeCode)
            targetGradeCode = nextGradeResult.grade
            if (!targetGradeCode) {
              calculationError = `Selected students are already at the highest grade level.`
            }
          } else {
            calculationError = 'Unable to find selected students in the system.'
          }
        } else {
          // For 'all' or 'section' scope, this is complex and should ideally be handled differently
          calculationError = 'Bulk promotion for all/section scope requires manual target grade specification.'
        }
      } catch (calcError) {
        console.error('Grade calculation error:', calcError)
        calculationError = 'Error calculating target grade. Please check the grade configuration.'
      }

      if (calculationError) {
        toast.error(calculationError)
        if (progressInterval) clearInterval(progressInterval)
        return
      }

      if (!targetGradeCode) {
        toast.error('Cannot determine target grade for promotion. No valid next grade found.')
        if (progressInterval) clearInterval(progressInterval)
        return
      }

      // Validate target grade
      if (!validateTargetGrade(targetGradeCode)) {
        toast.error('Invalid target grade calculated. Please check the promotion configuration.')
        if (progressInterval) clearInterval(progressInterval)
        return
      }

      // Prepare promotion request using the state
      const requestData = {
        scope: promotionRequest.scope || 'all',
        academicYear: promotionRequest.academicYear || new Date().getFullYear().toString(),
        includeRepeaters: promotionRequest.includeRepeaters,
        ...(promotionRequest.scope === 'grade' && { gradeCode: promotionRequest.gradeCode }),
        ...(promotionRequest.scope === 'section' && { streamSection: promotionRequest.streamSection }),
        ...(promotionRequest.scope === 'students' && { studentIds: Array.from(selectedStudentIds) }),
        targetGradeCode,
      }

      console.log('Executing promotion with data:', requestData)

      const result = await executePromotion(requestData).unwrap()

      if (progressInterval) clearInterval(progressInterval)
      setExecutionProgress(100)

      const promotedCount = result.promotedStudents || selectedStudentIds.size

      // Check for partial success - Note: Current API doesn't return errors, but this is prepared for future enhancement
      if (promotedCount < selectedStudentIds.size) {
        toast.warning(`${promotedCount} out of ${selectedStudentIds.size} students promoted successfully. Some promotions may have failed.`)
      } else {
        toast.success(`Successfully promoted ${promotedCount} students to ${targetGradeCode}`)
      }

      setExecutionCompleted(true)
      setCurrentStep('execute')

    } catch (error: unknown) {
      console.error('Promotion execution error:', error)

      if (progressInterval) clearInterval(progressInterval)
      setExecutionProgress(0)

      // Handle different types of errors with proper type checking
      const isApiError = (err: unknown): err is { status?: number; message?: string } => {
        return typeof err === 'object' && err !== null
      }

      if (isApiError(error)) {
        if (error.status === 400) {
          toast.error('Invalid promotion request. Please check your configuration and try again.')
        } else if (error.status === 401) {
          toast.error('Authentication failed. Please log in again.')
        } else if (error.status === 403) {
          toast.error('You do not have permission to perform this promotion.')
        } else if (error.status === 404) {
          toast.error('Some students were not found. They may have been removed or transferred.')
        } else if (error.status === 409) {
          toast.error('Promotion conflict detected. Some students may already be at the target grade.')
        } else if (error.status && error.status >= 500) {
          toast.error('Server error occurred. Please try again later or contact support.')
        } else if (error.message) {
          toast.error(`Promotion failed: ${error.message}`)
        } else {
          toast.error('An unexpected error occurred during promotion. Please try again.')
        }
      } else {
        toast.error('An unexpected error occurred during promotion. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  const selectAllEligible = () => {
    const eligibleIds = previewData
      .filter(student => student.status === 'eligible')
      .map(student => student.studentId)
    setSelectedStudentIds(new Set(eligibleIds))
  }

  const renderScopePreviewStep = () => {
    const eligibleCount = previewData.filter(s => s.status === 'eligible').length
    const repeatCount = previewData.filter(s => s.status === 'repeat').length
    const excludedCount = previewData.filter(s => s.status === 'excluded').length

    return (
      <div className="space-y-6">
        {/* Scope Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              Select Promotion Scope
            </CardTitle>
            <CardDescription>
              Choose which students to include in this promotion cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormSelect
                  labelText="Promotion Scope"
                  value={promotionRequest.scope}
                  onChange={(e) => handleScopeChange('scope', e.target.value)}
                  options={[
                    { value: 'all', text: 'All Students' },
                    { value: 'grade', text: 'Specific Grade' },
                    { value: 'section', text: 'Specific Section' },
                    { value: 'students', text: 'Selected Students' }
                  ]}
                  placeholder="Select scope"
                />
              </div>

              <div className="space-y-2">
                <FormAcademicYearSelector
                  labelText="Academic Year"
                  value={promotionRequest.academicYear}
                  onChange={(e) => handleAcademicYearChange(e.target.value)}
                  placeholder="Select academic year"
                  startYear={new Date().getFullYear() - 2}
                  endYear={new Date().getFullYear() + 3}
                />
              </div>
            </div>

            {promotionRequest.scope === 'grade' && (
              <div className="space-y-2">
                <FormSelect
                  labelText="Select Grade"
                  value={promotionRequest.gradeCode}
                  onChange={(e) => handleScopeChange('gradeCode', e.target.value)}
                  options={Object.entries(gradeOptions).flatMap(([stage, grades]) =>
                    grades.map(grade => ({ value: grade.value, text: grade.text }))
                  )}
                  placeholder="Select grade"
                />
              </div>
            )}

            {promotionRequest.scope === 'section' && (
              <div className="space-y-2">
                <FormText
                  labelText="Section"
                  value={promotionRequest.streamSection}
                  onChange={(e) => handleScopeChange('streamSection', e.target.value)}
                  placeholder="e.g., A, B, Science"
                />
              </div>
            )}

            {promotionRequest.scope === 'students' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormStudentSelect
                    labelText="Select Students"
                    placeholder="Search and select students"
                    onChange={(e) => handleStudentSelectChange(e.target.value)}
                    schoolId={undefined} // Will use current user's school
                  />
                </div>

                {selectedStudentIds.size > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Students ({selectedStudentIds.size})</Label>
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Admission Number</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from(selectedStudentIds).map((studentId: string) => {
                            // Find student details from the students array
                            const student = students.find(s => s.id === studentId)
                            if (!student) return null

                            return (
                              <TableRow key={studentId}>
                                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                                <TableCell>{student.admissionNumber}</TableCell>
                                <TableCell>{student.gradeCode}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStudentSelection(studentId)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <IconX className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudentIds(new Set())}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRepeaters"
                checked={promotionRequest.includeRepeaters}
                onCheckedChange={(checked) => handleScopeChange('includeRepeaters', checked === true)}
              />
              <Label htmlFor="includeRepeaters">Include students on academic probation</Label>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={generatePreview}
                disabled={
                  studentsLoading ||
                  !!studentsError ||
                  authLoading ||
                  (promotionRequest.scope === 'students' && selectedStudentIds.size === 0)
                }
              >
                {authLoading ? 'Checking Authentication...' :
                 studentsLoading ? 'Loading Students...' :
                 (promotionRequest.scope === 'students' && selectedStudentIds.size === 0) ? 'Select Students First' :
                 'Generate Preview'}
              </Button>
            </div>

            {studentsError && (
              <div className="text-sm text-red-600 mt-2">
                Error loading students data. Please refresh the page and try again.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Section - Show when preview data is available */}
        {previewData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconEye className="h-5 w-5" />
                Promotion Preview
              </CardTitle>
              <CardDescription>
                Review the promotion changes before executing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{eligibleCount}</div>
                  <div className="text-sm text-gray-600">Eligible</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{repeatCount}</div>
                  <div className="text-sm text-gray-600">Repeat</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{excludedCount}</div>
                  <div className="text-sm text-gray-600">Excluded</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedStudentIds.size}
                  </div>
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
                  onClick={() => setSelectedStudentIds(new Set())}
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
                          checked={selectedStudentIds.size === eligibleCount && eligibleCount > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllEligible()
                            } else {
                              setSelectedStudentIds(new Set())
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Current Grade</TableHead>
                      <TableHead>Target Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudentIds.has(student.studentId)}
                            onCheckedChange={() => toggleStudentSelection(student.studentId)}
                            disabled={student.status !== 'eligible'}
                          />
                        </TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.currentGrade}</TableCell>
                        <TableCell>{student.targetGrade}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === 'eligible' ? 'default' :
                              student.status === 'repeat' ? 'secondary' : 'destructive'
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetWizard}>
                  Reset
                </Button>
                <Button
                  onClick={() => setCurrentStep('execute')}
                  disabled={selectedStudentIds.size === 0}
                >
                  Review & Execute
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }


  const renderExecuteStep = () => {
    const eligibleCount = previewData.filter(s => s.status === 'eligible').length
    const repeatCount = previewData.filter(s => s.status === 'repeat').length
    const excludedCount = previewData.filter(s => s.status === 'excluded').length

    if (executionCompleted) {
      // Show completion screen after execution
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCheck className="h-5 w-5" />
              Promotion Complete
            </CardTitle>
            <CardDescription>
              Promotion process has been executed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-8">
              <IconArrowUp className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Promotion Successful!</h3>
              <p className="text-gray-600">
                {selectedStudentIds.size} students have been promoted for the {promotionRequest.academicYear} academic year.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetWizard}>
                Start New Promotion
              </Button>
              <Button onClick={onComplete}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show preview and execution controls
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconArrowUp className="h-5 w-5" />
            Execute Promotion
          </CardTitle>
          <CardDescription>
            Review final details and execute the promotion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{eligibleCount}</div>
              <div className="text-sm text-gray-600">Eligible</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{repeatCount}</div>
              <div className="text-sm text-gray-600">Repeat</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{excludedCount}</div>
              <div className="text-sm text-gray-600">Excluded</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {selectedStudentIds.size}
              </div>
              <div className="text-sm text-gray-600">Selected</div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Current Grade</TableHead>
                  <TableHead>Target Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.currentGrade}</TableCell>
                    <TableCell>{student.targetGrade}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === 'eligible' ? 'default' :
                          student.status === 'repeat' ? 'secondary' : 'destructive'
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {student.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <IconArrowUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Ready to Execute Promotion</p>
                <p className="mt-1">
                  {selectedStudentIds.size} students will be promoted to their target grades for the {promotionRequest.academicYear} academic year.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('scope-preview')}>
              Back to Scope & Preview
            </Button>
            <Button
              onClick={handleExecute}
              disabled={
                selectedStudentIds.size === 0 ||
                isLoading ||
                isPromotionLoading
              }
            >
              {isPromotionLoading ? 'Executing Promotion...' : 'Execute Promotion'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'scope-preview' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'scope-preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm">Scope & Preview</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep === 'execute' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'execute' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'execute' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm">Execute</span>
          </div>
        </div>

        {currentStep === 'scope-preview' && renderScopePreviewStep()}
        {currentStep === 'execute' && renderExecuteStep()}

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Executing promotion...</span>
              <span>{executionProgress}%</span>
            </div>
            <Progress value={executionProgress} />
          </div>
        )}
      </div>
    </div>
  )
}