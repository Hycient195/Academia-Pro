"use client"

import { useCallback, useMemo, useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import apis from "@/redux/api"
const { useGetStudentsQuery } = apis.schoolAdmin.student
import type { TGradeCode } from "@academia-pro/types/student/student.types"
import {
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconAlertTriangle,
  IconFileText,
  IconUsers,
  IconClipboardList,
  IconX,
} from "@tabler/icons-react"
import { ITransferStudentRequest } from "@academia-pro/types/school-admin"
import type { ITransferStudentRequestDto } from "@academia-pro/types/school-admin"

// Custom form inputs
import { FormSelect, FormText, FormDateInput } from "@/components/ui/form/form-components"
import { FormSchoolSelect } from "@/components/ui/form/FormSchoolSelect"
import { FormStudentSelect } from "@/components/ui/form/FormStudentSelect"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import ErrorToast from "@/components/utilities/ErrorToast"

type FormValue = string | number | boolean
type FormChangeArg =
  | { target: { value: FormValue; name?: string } }
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>

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
  const [currentStep, setCurrentStep] = useState<'selection' | 'clearance' | 'preview' | 'execute'>('selection')

  // Request state augmented to include dates
  const [transferRequest, setTransferRequest] = useState<Partial<ITransferStudentRequest> & {
    applicationDate?: string
    transferDate?: string
  }>({
    type: 'internal',
  })

  // New: allow selecting source grade to target from (for preview filtering)
  const [sourceGradeFilter, setSourceGradeFilter] = useState<string | undefined>(undefined)
  const [previewData, setPreviewData] = useState<TransferPreview[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [executionProgress, setExecutionProgress] = useState(0)

  const { data: studentsData } = useGetStudentsQuery({
    limit: 1000, // Get all students for transfer
  })

  const students = studentsData?.data || []

  // Candidate selection (optional)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())
  const [studentToAddId, setStudentToAddId] = useState<string>("")
  const selectedCandidateStudents = useMemo(
    () => students.filter(s => selectedCandidateIds.has(s.id)),
    [students, selectedCandidateIds]
  )
  

  // Batch transfer hook from RTK Query
  const [batchTransfer, { isLoading: batchTransferIsLoading, error: batchTransferError, isSuccess: batchTransferIsSuccess, reset: batchTransferReset }] = apis.schoolAdmin.student.useBatchTransferStudentsMutation()

  // Generic form onChange handler compatible with our custom form components
  const handleFormChange = useCallback(
    (arg: FormChangeArg) => {
      const tName = (arg.target as { name?: string }).name
      const raw = (arg.target as { value: unknown }).value
      const value: FormValue =
        typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean"
          ? raw
          : String(raw ?? "")

      if (!tName) return

      if (tName === "sourceGradeFilter") {
        setSourceGradeFilter(value ? String(value) : undefined)
        return
      }

      setTransferRequest(prev => ({
        ...prev,
        [tName]: value,
      }))
    },
    []
  )

  // Options
  const gradeOptions = useMemo(
    () => ([
      { value: "PRY1", text: "Primary 1" },
      { value: "PRY2", text: "Primary 2" },
      { value: "PRY3", text: "Primary 3" },
      { value: "JSS1", text: "JSS 1" },
      { value: "JSS2", text: "JSS 2" },
      { value: "JSS3", text: "JSS 3" },
      { value: "SSS1", text: "SSS 1" },
      { value: "SSS2", text: "SSS 2" },
      { value: "SSS3", text: "SSS 3" },
    ]), []
  )

  const sectionOptions = useMemo(
    () => ([
      { value: "A", text: "Section A" },
      { value: "B", text: "Section B" },
      { value: "C", text: "Section C" },
      { value: "Science", text: "Science Stream" },
      { value: "Arts", text: "Arts Stream" },
      { value: "Commercial", text: "Commercial Stream" },
    ]), []
  )

  const transferTypeOptions = useMemo(
    () => ([
      { value: "internal", text: "Internal Transfer (Within School)" },
      { value: "external", text: "External Transfer (To Another School)" },
    ]), []
  )

 // Validate inputs before generating preview
 const validatePreviewInputs = (): string[] => {
   const errs: string[] = []
   const t = transferRequest.type

   if (!t) errs.push("Transfer type is required")

   if (t === "internal") {
     if (!transferRequest.newGradeCode) errs.push("Target grade is required for internal transfers")
     if (!transferRequest.newStreamSection) errs.push("Target section is required for internal transfers")
   }

   if (t === "external") {
     if (!transferRequest.targetSchoolId) errs.push("Target school is required for external transfers")
   }

   return errs
 }

  const generateTransferPreview = () => {
    const validationErrors = validatePreviewInputs()

    // Ensure student list is loaded
    if (!students || students.length === 0) {
      toast.error('Students list is still loading. Please try again.')
      return
    }

    let filteredStudents = [...students]

    // Limit to explicitly selected candidates if any
    if (selectedCandidateIds.size > 0) {
      filteredStudents = filteredStudents.filter(s => selectedCandidateIds.has(s.id))
      if (filteredStudents.length === 0) {
        validationErrors.push("No selected students found in current filters")
      }
    }

    // Apply source grade filter: show students who currently belong to a selected source grade
    if (sourceGradeFilter) {
      filteredStudents = filteredStudents.filter(s => s.gradeCode === sourceGradeFilter)
    }


    if (validationErrors.length > 0) {
      validationErrors.forEach(msg => toast.error(msg))
      return
    }

    const preview: TransferPreview[] = filteredStudents.slice(0, 200).map(student => {
      // Mock clearance status
      const clearanceStatus = {
        fees: Math.random() > 0.2,
        library: Math.random() > 0.15,
        hostel: Math.random() > 0.1,
        documents: Math.random() > 0.1,
      }

      const allCleared = Object.values(clearanceStatus).every(status => status)
      const status: TransferPreview['status'] = allCleared ? 'eligible' : 'pending_clearance'
      let reason = ''

      if (!allCleared) {
        const pendingItems = Object.entries(clearanceStatus)
          .filter(([, cleared]) => !cleared)
          .map(([item]) => item)
        reason = `Pending: ${pendingItems.join(', ')}`
      }

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        currentGrade: student.gradeCode || 'Unknown',
        currentSection: student.streamSection || 'Unknown',
        targetGrade: transferRequest.newGradeCode as TGradeCode,
        targetSection: transferRequest.newStreamSection,
        transferType: (transferRequest.type as 'internal' | 'external') || 'internal',
        targetSchool: transferRequest.targetSchoolId,
        clearanceStatus,
        status,
        reason,
      }
    })

    if (preview.length === 0) {
      toast.error("No students matched your selection and filters")
      return
    }

    setPreviewData(preview)
    setCurrentStep('clearance')
  }

  // Candidate selection handlers
  const addCandidate = () => {
    const id = String(studentToAddId || "").trim()
    if (!id) {
      toast.error("Select a student to add")
      return
    }
    if (selectedCandidateIds.has(id)) {
      toast.error("Student already added")
      return
    }
    const next = new Set(selectedCandidateIds)
    next.add(id)
    setSelectedCandidateIds(next)
    setStudentToAddId("")
    toast.success("Student added to candidates")
  }

  const removeCandidate = (id: string) => {
    const next = new Set(selectedCandidateIds)
    next.delete(id)
    setSelectedCandidateIds(next)
  }

  const clearCandidates = () => {
    setSelectedCandidateIds(new Set())
  }

  const handleExecute = () => {
    // Client-side validations
    if (selectedStudents.size === 0) {
      toast.error("No students selected for transfer.")
      return
    }

    if (!transferRequest.type) {
      toast.error("Transfer type is required.")
      return
    }

    if (transferRequest.type === 'internal' && (!transferRequest.newGradeCode || !transferRequest.newStreamSection)) {
      toast.error("Target grade and section are required for internal transfers.")
      return
    }

    if (transferRequest.type === 'external' && !transferRequest.targetSchoolId) {
      toast.error("Target school is required for external transfers.")
      return
    }

    setExecutionProgress(0)
    let progressInterval: NodeJS.Timeout | null = null

    progressInterval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 90) {
          if (progressInterval) clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    const payload = {
      fromSchoolId: 'current-school-id', // TODO: Get from context
      toSchoolId: transferRequest.targetSchoolId || 'current-school-id', // TODO: Get from context
      studentIds: Array.from(selectedStudents),
      transferReason: transferRequest.transferReason || 'Transfer request',
      // informational; backend may ignore these:
      applicationDate: transferRequest.applicationDate,
      transferDate: transferRequest.transferDate,
      // Additional fields for service compatibility
      reason: transferRequest.transferReason,
      newGradeCode: transferRequest.newGradeCode,
      newStreamSection: transferRequest.newStreamSection,
      type: transferRequest.type,
      targetSchoolId: transferRequest.targetSchoolId,
    }

    batchTransfer(payload as unknown as ITransferStudentRequestDto)
      .unwrap()
      .then((result) => {
        if (progressInterval) clearInterval(progressInterval)
        setExecutionProgress(100)
        toast.success(result?.message || `Successfully transferred ${result?.transferred ?? selectedStudents.size} students`)
        // Auto-complete: call onComplete to close parent dialog and refresh
        onComplete()
        setCurrentStep('execute')
      })
      .catch((err) => {
        console.error(err)
        toast.error("Transfer failed. Please try again.", { description: <ErrorToast error={batchTransferError} /> })
      })
      .finally(() => {
        if (progressInterval) clearInterval(progressInterval)
        // Cleanup actions if needed
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

  const updateClearanceStatus = (studentId: string, item: keyof TransferPreview['clearanceStatus'], status: boolean) => {
    setPreviewData(prev =>
      prev.map(student => {
        if (student.studentId !== studentId) return student

        const updatedClearance = {
          ...student.clearanceStatus,
          [item]: status
        }

        const allCleared = Object.values(updatedClearance).every(Boolean)

        return {
          ...student,
          clearanceStatus: updatedClearance,
          status: allCleared ? 'eligible' : 'pending_clearance',
          reason: allCleared ? undefined : `Pending: ${Object.entries(updatedClearance).filter(([, v]) => !v).map(([k]) => k).join(', ')}`,
        }
      })
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
          <FormSelect
            labelText="Transfer Type"
            name="type"
            value={String(transferRequest.type || "")}
            options={transferTypeOptions}
            onChange={handleFormChange}
            placeholder="Select transfer type"
            required
          />

          <FormText
            labelText="Transfer Reason"
            name="transferReason"
            value={String(transferRequest.transferReason || "")}
            onChange={handleFormChange}
            placeholder="e.g., Academic performance, Family relocation"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormDateInput
            labelText="Application Date"
            name="applicationDate"
            value={transferRequest.applicationDate || ""}
            onChange={handleFormChange}
            placeholder="Pick application date"
          />
          <FormDateInput
            labelText="Transfer Date"
            name="transferDate"
            value={transferRequest.transferDate || ""}
            onChange={handleFormChange}
            placeholder="Pick transfer date"
          />
        </div>

        {/* Student selection (optional) */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Students (optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <FormStudentSelect
              labelText="Find student"
              name="studentToAddId"
              value={studentToAddId}
              onChange={(arg) => {
                if ('target' in arg) {
                  setStudentToAddId(String(arg.target.value || ""))
                }
              }}
              placeholder="Search by name or admission number"
            />
            <Button type="button" onClick={addCandidate} className="h-[2.35rem]">
              Add
            </Button>
            <Button type="button" variant="outline" onClick={clearCandidates} className="h-[2.35rem]">
              Clear Selected
            </Button>
          </div>

          {selectedCandidateStudents.length > 0 && (
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  Selected candidates: <span className="font-medium text-foreground">{selectedCandidateStudents.length}</span>
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCandidateStudents.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{s.firstName} {s.lastName}</TableCell>
                        <TableCell>{s.admissionNumber || "-"}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCandidate(s.id)}>
                            <IconX className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {transferRequest.type === 'internal' && (
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              labelText="Target Grade"
              name="newGradeCode"
              value={String(transferRequest.newGradeCode || "")}
              options={gradeOptions}
              onChange={handleFormChange}
              placeholder="Select target grade"
            />

            <FormSelect
              labelText="Target Section"
              name="newStreamSection"
              value={String(transferRequest.newStreamSection || "")}
              options={sectionOptions}
              onChange={handleFormChange}
              placeholder="Select target section"
            />
          </div>
        )}

        {transferRequest.type === 'external' && (
          <div className="space-y-4">
            <FormSchoolSelect
              labelText="Target School"
              name="targetSchoolId"
              value={String(transferRequest.targetSchoolId || "")}
              onChange={handleFormChange}
              placeholder="Select target school"
              required
            />

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
                        {student.status.replaceAll('_', ' ')}
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
        <ErrorBlock error={batchTransferError} className="mb-2" scrollIntoView />
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
                  {/* Target school label is fetched in selection step; here we just show ID */}
                  {transferRequest.targetSchoolId}
                </p>
              </div>
              <IconBuilding className="h-8 w-8 text-green-600" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Application Date</h4>
                <p className="text-sm text-gray-600">{transferRequest.applicationDate || '-'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Transfer Date</h4>
                <p className="text-sm text-gray-600">{transferRequest.transferDate || '-'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Students to Transfer</h4>
              <p className="text-sm text-gray-600">{selectedStudents.size} students</p>
            </div>
            <IconUsers className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            labelText="Source Grade (optional)"
            name="sourceGradeFilter"
            value={String(sourceGradeFilter || "")}
            onChange={handleFormChange}
            placeholder="Filter students by current grade (optional)"
            options={[
              { value: "", text: "All grades" },
              ...gradeOptions
            ]}
          />
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
            disabled={selectedStudents.size === 0 || batchTransferIsLoading}
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

        {currentStep === 'selection' && renderSelectionStep()}
        {currentStep === 'clearance' && renderClearanceStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'execute' && renderExecuteStep()}

        {batchTransferIsLoading && (
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