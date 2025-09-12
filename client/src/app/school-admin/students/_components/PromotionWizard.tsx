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
const { useGetStudentsQuery } = apis.schoolAdmin.student
import type { TStudentStage, TGradeCode } from "@academia-pro/types/student/student.types"
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
  const [currentStep, setCurrentStep] = useState<'scope' | 'rules' | 'preview' | 'execute'>('scope')
  const [promotionRequest, setPromotionRequest] = useState<Partial<IPromotionRequest>>({
    scope: 'all',
    academicYear: new Date().getFullYear().toString(),
    includeRepeaters: false,
  })
  const [previewData, setPreviewData] = useState<PromotionPreview[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [executionProgress, setExecutionProgress] = useState(0)

  const { data: studentsData } = useGetStudentsQuery({
    limit: 1000, // Get all students for promotion
  })

  const students = studentsData?.data || []

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

  const getNextGrade = (currentGrade: TGradeCode): TGradeCode | null => {
    const allGrades = [
      ...gradeOptions.EY.map(g => g.value),
      ...gradeOptions.PRY.map(g => g.value),
      ...gradeOptions.JSS.map(g => g.value),
      ...gradeOptions.SSS.map(g => g.value),
    ]

    const currentIndex = allGrades.indexOf(currentGrade)
    if (currentIndex === -1 || currentIndex === allGrades.length - 1) {
      return null // No next grade or already at highest
    }

    return allGrades[currentIndex + 1]
  }

  const handleScopeChange = (field: string, value: unknown) => {
    setPromotionRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generatePreview = () => {
    if (!students.length) return

    let filteredStudents = students

    // Apply scope filters
    if (promotionRequest.scope === 'grade' && promotionRequest.gradeCode) {
      filteredStudents = students.filter(s => s.gradeCode === promotionRequest.gradeCode)
    } else if (promotionRequest.scope === 'section' && promotionRequest.streamSection) {
      filteredStudents = students.filter(s => s.streamSection === promotionRequest.streamSection)
    }

    // Generate preview data
    const preview: PromotionPreview[] = filteredStudents.map(student => {
      // Mock grade code from current grade for now
      const mockGradeCode = student.gradeCode as TGradeCode
      const nextGrade = getNextGrade(mockGradeCode)
      let status: PromotionPreview['status'] = 'eligible'
      let reason = ''

      if (!nextGrade) {
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
        currentGrade: mockGradeCode,
        currentStage: 'PRY' as TStudentStage, // Mock - would be determined from grade
        targetGrade: nextGrade || mockGradeCode,
        targetStage: 'PRY' as TStudentStage, // Mock - would be calculated
        status,
        reason,
      }
    })

    setPreviewData(preview)
    setCurrentStep('preview')
  }

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      setExecutionProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Mock API call - replace with actual promotion endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setExecutionProgress(100)

      const promotedCount = selectedStudents.size
      toast.success(`Successfully promoted ${promotedCount} students`)

      setCurrentStep('execute')
    } catch (error) {
      toast.error("Promotion failed")
    } finally {
      setIsLoading(false)
    }
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

  const renderScopeStep = () => (
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
            <Label htmlFor="scope">Promotion Scope</Label>
            <Select
              value={promotionRequest.scope}
              onValueChange={(value) => handleScopeChange('scope', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="grade">Specific Grade</SelectItem>
                <SelectItem value="section">Specific Section</SelectItem>
                <SelectItem value="students">Selected Students</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={promotionRequest.academicYear}
              onChange={(e) => handleScopeChange('academicYear', e.target.value)}
              placeholder="2024-2025"
            />
          </div>
        </div>

        {promotionRequest.scope === 'grade' && (
          <div className="space-y-2">
            <Label>Select Grade</Label>
            <Select
              value={promotionRequest.gradeCode}
              onValueChange={(value) => handleScopeChange('gradeCode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(gradeOptions).map(([stage, grades]) =>
                  grades.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.text}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {promotionRequest.scope === 'section' && (
          <div className="space-y-2">
            <Label>Section</Label>
            <Input
              value={promotionRequest.streamSection}
              onChange={(e) => handleScopeChange('streamSection', e.target.value)}
              placeholder="e.g., A, B, Science"
            />
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
          <Button onClick={generatePreview}>
            Generate Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPreviewStep = () => {
    const eligibleCount = previewData.filter(s => s.status === 'eligible').length
    const repeatCount = previewData.filter(s => s.status === 'repeat').length
    const excludedCount = previewData.filter(s => s.status === 'excluded').length

    return (
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
                        if (checked) {
                          selectAllEligible()
                        } else {
                          setSelectedStudents(new Set())
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
                        checked={selectedStudents.has(student.studentId)}
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
            <Button variant="outline" onClick={() => setCurrentStep('scope')}>
              Back to Scope
            </Button>
            <Button
              onClick={handleExecute}
              disabled={selectedStudents.size === 0 || isLoading}
            >
              Execute Promotion
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderExecuteStep = () => (
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
            {selectedStudents.size} students have been promoted for the {promotionRequest.academicYear} academic year.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onComplete}>
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'scope' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'scope' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm">Scope</span>
          </div>
          <div className={`w-12 h-0.5 ${['rules', 'preview', 'execute'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm">Preview</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep === 'execute' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'execute' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'execute' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm">Execute</span>
          </div>
        </div>

        {currentStep === 'scope' && renderScopeStep()}
        {currentStep === 'preview' && renderPreviewStep()}
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