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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useGetStudentsQuery } from "@/redux/api/schoolAdminApi"
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
import { IGraduationRequest } from "@academia-pro/types/school-admin"

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
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'eligibility' | 'clearance' | 'preview' | 'execute'>('eligibility')
  const [graduationRequest, setGraduationRequest] = useState<Partial<IGraduationRequest>>({
    graduationYear: new Date().getFullYear(),
    clearanceStatus: 'cleared',
  })
  const [previewData, setPreviewData] = useState<GraduationPreview[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [executionProgress, setExecutionProgress] = useState(0)

  const { data: studentsData } = useGetStudentsQuery({
    limit: 1000, // Get all students for graduation check
  })

  const students = studentsData?.students || []

  const handleRequestChange = (field: string, value: string | number) => {
    setGraduationRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateEligibilityPreview = () => {
    if (!students.length) return

    // Filter SSS3 students only
    const sss3Students = students.filter(s => s.grade === 'SSS3' || s.grade?.includes('SSS3'))

    const preview: GraduationPreview[] = sss3Students.map(student => {
      const admissionYear = student.enrollmentDate ? new Date(student.enrollmentDate).getFullYear() : 2020
      const currentYear = new Date().getFullYear()
      const yearsInSchool = currentYear - admissionYear

      // Mock clearance status - in real implementation this would come from various modules
      const clearanceStatus = {
        library: Math.random() > 0.2, // 80% cleared
        fees: Math.random() > 0.15, // 85% cleared
        hostel: Math.random() > 0.1, // 90% cleared
        discipline: Math.random() > 0.05, // 95% cleared
        documents: Math.random() > 0.1, // 90% cleared
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
        studentName: `${student.firstName} ${student.lastName}`,
        currentGrade: student.grade || 'SSS3',
        admissionYear,
        yearsInSchool,
        gpa: Math.round((Math.random() * 2 + 2) * 100) / 100, // Mock GPA between 2.0-4.0
        status,
        clearanceStatus,
        reason,
      }
    })

    setPreviewData(preview)
    setCurrentStep('clearance')
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

      // Mock API call - replace with actual graduation endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setExecutionProgress(100)

      const graduatedCount = selectedStudents.size
      toast.success(`Successfully graduated ${graduatedCount} students!`)

      setCurrentStep('execute')
    } catch (error) {
      toast.error("Graduation failed")
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
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input
              id="graduationYear"
              type="number"
              value={graduationRequest.graduationYear}
              onChange={(e) => handleRequestChange('graduationYear', parseInt(e.target.value))}
              placeholder="2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clearanceStatus">Clearance Status</Label>
            <Select
              value={graduationRequest.clearanceStatus}
              onValueChange={(value) => handleRequestChange('clearanceStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select clearance status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleared">All Clearances Required</SelectItem>
                <SelectItem value="pending">Allow Pending Clearances</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                        if (checked) {
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
                    <TableCell>{student.gpa.toFixed(2)}</TableCell>
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
              <p className="text-sm text-gray-600">{graduationRequest.graduationYear}</p>
            </div>
            <IconCalendar className="h-8 w-8 text-blue-600" />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Students to Graduate</h4>
              <p className="text-sm text-gray-600">{selectedStudents.size} SSS3 students</p>
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

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('clearance')}>
            Back to Clearance
          </Button>
          <Button
            onClick={handleExecute}
            disabled={selectedStudents.size === 0 || isLoading}
          >
            Process Graduation
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderExecuteStep = () => (
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
            {selectedStudents.size} students have successfully graduated from {graduationRequest.graduationYear} class.
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

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'eligibility' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'eligibility' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm">Eligibility</span>
          </div>
          <div className={`w-12 h-0.5 ${['clearance', 'preview', 'execute'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'clearance' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'clearance' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm">Clearance</span>
          </div>
          <div className={`w-12 h-0.5 ${['preview', 'execute'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm">Preview</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep === 'execute' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'execute' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'execute' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="text-sm">Execute</span>
          </div>
        </div>

        {currentStep === 'eligibility' && renderEligibilityStep()}
        {currentStep === 'clearance' && renderClearanceStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'execute' && renderExecuteStep()}

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