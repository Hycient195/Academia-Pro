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
import type { TStudentStage, TGradeCode } from "@academia-pro/types/student/student.types"
import {
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconFileText,
  IconUsers,
  IconClipboardList,
} from "@tabler/icons-react"
import { ITransferStudentRequest } from "@academia-pro/types/school-admin"

interface TransferWizardProps {
  onComplete: () => void
}

interface TransferPreview {
  studentId: string
  studentName: string
  currentGrade: string
  currentSection: string
  targetGrade?: TGradeCode
  targetSection?: string
  transferType: 'internal' | 'external'
  targetSchool?: string
  clearanceStatus: {
    fees: boolean
    library: boolean
    hostel: boolean
    documents: boolean
  }
  status: 'eligible' | 'not_eligible' | 'pending_clearance'
  reason?: string
}

export function TransferWizard({ onComplete }: TransferWizardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'selection' | 'details' | 'clearance' | 'preview' | 'execute'>('selection')
  const [transferRequest, setTransferRequest] = useState<Partial<ITransferStudentRequest>>({
    type: 'internal',
  })
  const [previewData, setPreviewData] = useState<TransferPreview[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [executionProgress, setExecutionProgress] = useState(0)

  const { data: studentsData } = useGetStudentsQuery({
    limit: 1000, // Get all students for transfer
  })

  const students = studentsData?.students || []

  const handleRequestChange = (field: string, value: unknown) => {
    setTransferRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateTransferPreview = () => {
    if (!students.length) return

    let filteredStudents = students

    // Apply filters if needed
    if (transferRequest.newGradeCode) {
      filteredStudents = students.filter(s => s.grade === transferRequest.newGradeCode)
    }

    const preview: TransferPreview[] = filteredStudents.slice(0, 10).map(student => { // Limit for demo
      // Mock clearance status
      const clearanceStatus = {
        fees: Math.random() > 0.2,
        library: Math.random() > 0.15,
        hostel: Math.random() > 0.1,
        documents: Math.random() > 0.1,
      }

      const allCleared = Object.values(clearanceStatus).every(status => status)
      let status: TransferPreview['status'] = 'eligible'
      let reason = ''

      if (!allCleared) {
        status = 'pending_clearance'
        const pendingItems = Object.entries(clearanceStatus)
          .filter(([_, cleared]) => !cleared)
          .map(([item]) => item)
        reason = `Pending: ${pendingItems.join(', ')}`
      }

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        currentGrade: student.grade || 'Unknown',
        currentSection: student.section || 'Unknown',
        targetGrade: transferRequest.newGradeCode,
        targetSection: transferRequest.newStreamSection,
        transferType: transferRequest.type || 'internal',
        targetSchool: transferRequest.targetSchoolId,
        clearanceStatus,
        status,
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

      // Mock API call - replace with actual transfer endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setExecutionProgress(100)

      const transferredCount = selectedStudents.size
      toast.success(`Successfully transferred ${transferredCount} students!`)

      setCurrentStep('execute')
    } catch (error) {
      toast.error("Transfer failed")
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

  const updateClearanceStatus = (studentId: string, item: keyof TransferPreview['clearanceStatus'], status: boolean) => {
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

  const renderSelectionStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          Select Transfer Type & Students
        </CardTitle>
        <CardDescription>
          Choose the type of transfer and select students to transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transferType">Transfer Type</Label>
            <Select
              value={transferRequest.type}
              onValueChange={(value) => handleRequestChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Transfer (Within School)</SelectItem>
                <SelectItem value="external">External Transfer (To Another School)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Transfer Reason</Label>
            <Input
              id="reason"
              value={transferRequest.reason}
              onChange={(e) => handleRequestChange('reason', e.target.value)}
              placeholder="e.g., Academic performance, Family relocation"
            />
          </div>
        </div>

        {transferRequest.type === 'internal' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Grade</Label>
              <Select
                value={transferRequest.newGradeCode}
                onValueChange={(value) => handleRequestChange('newGradeCode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRY1">Primary 1</SelectItem>
                  <SelectItem value="PRY2">Primary 2</SelectItem>
                  <SelectItem value="PRY3">Primary 3</SelectItem>
                  <SelectItem value="JSS1">JSS 1</SelectItem>
                  <SelectItem value="JSS2">JSS 2</SelectItem>
                  <SelectItem value="JSS3">JSS 3</SelectItem>
                  <SelectItem value="SSS1">SSS 1</SelectItem>
                  <SelectItem value="SSS2">SSS 2</SelectItem>
                  <SelectItem value="SSS3">SSS 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Section</Label>
              <Select
                value={transferRequest.newStreamSection}
                onValueChange={(value) => handleRequestChange('newStreamSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="Science">Science Stream</SelectItem>
                  <SelectItem value="Arts">Arts Stream</SelectItem>
                  <SelectItem value="Commercial">Commercial Stream</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {transferRequest.type === 'external' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target School</Label>
              <Select
                value={transferRequest.targetSchoolId}
                onValueChange={(value) => handleRequestChange('targetSchoolId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school-1">Green Valley International School</SelectItem>
                  <SelectItem value="school-2">Lagos Academy</SelectItem>
                  <SelectItem value="school-3">Nigerian International School</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IconAlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">External Transfer Requirements:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>All fees must be cleared</li>
                    <li>Library books returned</li>
                    <li>Hostel checked out (if applicable)</li>
                    <li>Transfer certificate will be generated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={generateTransferPreview}>
            Generate Transfer Preview
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
            Review and update clearance status for transfer candidates
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
                  <TableHead>Current</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead>Hostel</TableHead>
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
                    <TableCell>
                      <div className="text-sm">
                        <div>{student.currentGrade}</div>
                        <div className="text-gray-500">{student.currentSection}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{student.targetGrade || 'Same'}</div>
                        <div className="text-gray-500">{student.targetSection || 'Same'}</div>
                      </div>
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
                        checked={student.clearanceStatus.library}
                        onCheckedChange={(checked) =>
                          updateClearanceStatus(student.studentId, 'library', checked === true)
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
            <Button variant="outline" onClick={() => setCurrentStep('selection')}>
              Back to Selection
            </Button>
            <Button onClick={() => setCurrentStep('preview')}>
              Review & Transfer
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
          Transfer Preview
        </CardTitle>
        <CardDescription>
          Final review before processing the transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Transfer Type</h4>
              <p className="text-sm text-gray-600 capitalize">{transferRequest.type} Transfer</p>
            </div>
            <IconArrowRight className="h-8 w-8 text-blue-600" />
          </div>

          {transferRequest.type === 'external' && transferRequest.targetSchoolId && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Target School</h4>
                <p className="text-sm text-gray-600">
                  {transferRequest.targetSchoolId === 'school-1' && 'Green Valley International School'}
                  {transferRequest.targetSchoolId === 'school-2' && 'Lagos Academy'}
                  {transferRequest.targetSchoolId === 'school-3' && 'Nigerian International School'}
                </p>
              </div>
              <IconBuilding className="h-8 w-8 text-green-600" />
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Students to Transfer</h4>
              <p className="text-sm text-gray-600">{selectedStudents.size} students</p>
            </div>
            <IconUsers className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IconCheck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Ready for Transfer!</p>
              <p className="mt-1">
                All selected students have met the transfer requirements and clearance criteria.
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
            Process Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderExecuteStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCheck className="h-5 w-5" />
          Transfer Complete
        </CardTitle>
        <CardDescription>
          Transfer process has been completed successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-8">
          <IconArrowRight className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Transfer Successful!</h3>
          <p className="text-gray-600 mb-4">
            {selectedStudents.size} students have been successfully transferred.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong><br />
              • Transfer certificates generated<br />
              • Student records updated<br />
              • Notifications sent to parents<br />
              • {transferRequest.type === 'external' && 'Transfer documents prepared for target school'}
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
          <div className={`flex items-center space-x-2 ${currentStep === 'selection' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'selection' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm">Selection</span>
          </div>
          <div className={`w-12 h-0.5 ${['details', 'clearance', 'preview', 'execute'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
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

        {currentStep === 'selection' && renderSelectionStep()}
        {currentStep === 'clearance' && renderClearanceStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'execute' && renderExecuteStep()}

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing transfer...</span>
              <span>{executionProgress}%</span>
            </div>
            <Progress value={executionProgress} />
          </div>
        )}
      </div>
    </div>
  )
}