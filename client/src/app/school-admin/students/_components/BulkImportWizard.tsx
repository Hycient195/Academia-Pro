"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  IconUpload,
  IconFileText,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconDownload,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react"
import { FormText, FormSelect, FormDateInput, FormPhoneInput } from "@/components/ui/form/form-components"
import ErrorBlock from "@/components/utilities/ErrorBlock"
import ErrorToast from "@/components/utilities/ErrorToast"
import { useBulkImportStudentsMutation } from "@/redux/api/school-admin/studentApis"
import { useUserAuth } from "@/redux/auth/userAuthContext"
import type { IBulkImportRequestDto } from "@academia-pro/types/school-admin"

interface BulkImportWizardProps {
  onComplete: () => void
}

interface StudentImportRow {
  FirstName: string
  LastName: string
  MiddleName?: string
  DateOfBirth: string
  Gender: string
  AdmissionNumber?: string
  GradeCode: string
  StreamSection: string
  FatherName: string
  MotherName: string
  Phone?: string
  Email?: string
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
    data: StudentImportRow
  }>
  preview: Array<{
    row: number
    data: StudentImportRow
    valid: boolean
    errors: string[]
  }>
}

export function BulkImportWizard({ onComplete }: BulkImportWizardProps) {
  const { user } = useUserAuth()
  const [bulkImportStudents, { isLoading: bulkImportIsLoading, error: bulkImportError, isSuccess: bulkImportIsSuccess, reset: bulkImportReset }] = useBulkImportStudentsMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'import'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<StudentImportRow[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [importProgress, setImportProgress] = useState(0)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  // Form state for manual entry
  const [manualEntry, setManualEntry] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    gradeCode: '',
    streamSection: '',
    fatherName: '',
    motherName: '',
    phone: '',
    email: ''
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast.error("Please select a CSV or Excel file")
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      setSelectedFile(file)
      toast.success("File selected successfully")
    }
  }

  const parseCSV = (csvText: string): StudentImportRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data: StudentImportRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length === headers.length) {
        const row: Partial<StudentImportRow> = {}
        headers.forEach((header, index) => {
          row[header as keyof StudentImportRow] = values[index] || ''
        })
        data.push(row as StudentImportRow)
      }
    }

    return data
  }

  const validateRow = (row: StudentImportRow, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!row.FirstName?.trim()) errors.push('First name is required')
    if (!row.LastName?.trim()) errors.push('Last name is required')
    if (!row.DateOfBirth?.trim()) errors.push('Date of birth is required')
    if (!row.Gender?.trim()) errors.push('Gender is required')
    if (!row.GradeCode?.trim()) errors.push('Grade code is required')
    if (!row.StreamSection?.trim()) errors.push('Stream section is required')
    if (!row.FatherName?.trim()) errors.push('Father name is required')
    if (!row.MotherName?.trim()) errors.push('Mother name is required')

    // Validate date format
    if (row.DateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(row.DateOfBirth)) {
      errors.push('Date of birth must be in YYYY-MM-DD format')
    }

    // Validate email format
    if (row.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email)) {
      errors.push('Invalid email format')
    }

    return { valid: errors.length === 0, errors }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsProcessingFile(true)
    try {
      const text = await selectedFile.text()
      const data = parseCSV(text)

      if (data.length === 0) {
        toast.error("No valid data found in file")
        return
      }

      const preview = data.map((row, index) => {
        const validation = validateRow(row, index)
        return {
          row: index + 1,
          data: row,
          valid: validation.valid,
          errors: validation.errors
        }
      })

      const result: ImportResult = {
        total: data.length,
        successful: preview.filter(p => p.valid).length,
        failed: preview.filter(p => !p.valid).length,
        errors: preview.filter(p => !p.valid).map(p => ({
          row: p.row,
          field: 'general',
          message: p.errors.join(', '),
          data: p.data
        })),
        preview
      }

      setParsedData(data)
      setImportResult(result)
      setCurrentStep('preview')
      toast.success(`File processed successfully. ${result.successful} valid, ${result.failed} invalid rows.`)
    } catch (error) {
      toast.error("Failed to process file")
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleImport = () => {
    if (!parsedData.length || !user?.schoolId) return

    const selectedData = parsedData.filter((_, index) => selectedRows.has(index + 1))

    if (selectedData.length === 0) {
      toast.error("Please select at least one student to import")
      return
    }

    const importData: IBulkImportRequestDto = {
      schoolId: user.schoolId,
      data: selectedData.map(row => ({
        admissionNumber: row.AdmissionNumber || '',
        firstName: row.FirstName,
        lastName: row.LastName,
        middleName: row.MiddleName || '',
        dateOfBirth: row.DateOfBirth,
        gender: row.Gender.toLowerCase() as 'male' | 'female' | 'other',
        gradeCode: row.GradeCode,
        streamSection: row.StreamSection,
        fatherName: row.FatherName,
        motherName: row.MotherName,
        phone: row.Phone || '',
        email: row.Email || ''
      }))
    }

    setImportProgress(0)

    bulkImportStudents(importData)
      .unwrap()
      .then((result) => {
        toast.success(`Successfully imported ${result.imported} students`)
        setCurrentStep('import')
        setImportProgress(100)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to import students.", { description: <ErrorToast error={bulkImportError} /> })
      })
      .finally(() => {
        // Cleanup if needed
      })
  }

  const addManualEntry = () => {
    if (!manualEntry.firstName || !manualEntry.lastName || !manualEntry.dateOfBirth || !manualEntry.gender || !manualEntry.gradeCode || !manualEntry.streamSection) {
      toast.error("Please fill in all required fields")
      return
    }

    const newRow: StudentImportRow = {
      FirstName: manualEntry.firstName,
      LastName: manualEntry.lastName,
      MiddleName: manualEntry.middleName,
      DateOfBirth: manualEntry.dateOfBirth,
      Gender: manualEntry.gender,
      AdmissionNumber: '',
      GradeCode: manualEntry.gradeCode,
      StreamSection: manualEntry.streamSection,
      FatherName: manualEntry.fatherName,
      MotherName: manualEntry.motherName,
      Phone: manualEntry.phone,
      Email: manualEntry.email
    }

    setParsedData(prev => [...prev, newRow])

    // Reset form
    setManualEntry({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      gradeCode: '',
      streamSection: '',
      fatherName: '',
      motherName: '',
      phone: '',
      email: ''
    })

    toast.success("Student added to import list")
  }

  const downloadTemplate = () => {
    // Create a sample CSV template
    const headers = [
      'FirstName',
      'LastName',
      'MiddleName',
      'DateOfBirth',
      'Gender',
      'BloodGroup',
      'Email',
      'Phone',
      'AdmissionNumber',
      'Stage',
      'GradeCode',
      'StreamSection',
      'AdmissionDate',
      'EnrollmentType',
      'FatherName',
      'FatherPhone',
      'FatherEmail',
      'MotherName',
      'MotherPhone',
      'MotherEmail',
      'AddressStreet',
      'AddressCity',
      'AddressState',
      'AddressPostalCode',
      'AddressCountry'
    ]

    const sampleData = [
      'John',
      'Doe',
      'Michael',
      '2005-03-15',
      'male',
      'O+',
      'john.doe@student.school.com',
      '+1234567890',
      'ADM20240001',
      'PRY',
      'PRY1',
      'A',
      '2024-08-01',
      'regular',
      'John Doe Sr.',
      '+1234567891',
      'father@email.com',
      'Jane Doe',
      '+1234567892',
      'mother@email.com',
      '123 Main Street',
      'Springfield',
      'IL',
      '62701',
      'USA'
    ]

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleRowSelection = (rowIndex: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex)
    } else {
      newSelected.add(rowIndex)
    }
    setSelectedRows(newSelected)
  }

  const selectAllValidRows = () => {
    if (!importResult) return
    const validRows = new Set(
      importResult.preview
        .filter(row => row.valid)
        .map(row => row.row)
    )
    setSelectedRows(validRows)
  }

  const renderUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUpload className="h-5 w-5" />
          Upload Student Data
        </CardTitle>
        <CardDescription>
          Select a CSV or Excel file containing student information, or add students manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <IconFileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "No file selected"}
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: CSV, XLS, XLSX (Max 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Choose File
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormText
                labelText="First Name"
                value={manualEntry.firstName}
                onChange={(e) => setManualEntry(prev => ({ ...prev, firstName: String(e.target.value) }))}
                placeholder="Enter first name"
                required
              />
              <FormText
                labelText="Last Name"
                value={manualEntry.lastName}
                onChange={(e) => setManualEntry(prev => ({ ...prev, lastName: String(e.target.value) }))}
                placeholder="Enter last name"
                required
              />
              <FormText
                labelText="Middle Name"
                value={manualEntry.middleName}
                onChange={(e) => setManualEntry(prev => ({ ...prev, middleName: String(e.target.value) }))}
                placeholder="Enter middle name"
              />
              <FormDateInput
                labelText="Date of Birth"
                value={manualEntry.dateOfBirth}
                onChange={(e) => setManualEntry(prev => ({ ...prev, dateOfBirth: String(e.target.value) }))}
                placeholder="Select date of birth"
                required
              />
              <FormSelect
                labelText="Gender"
                value={manualEntry.gender}
                onChange={(e) => setManualEntry(prev => ({ ...prev, gender: String(e.target.value) }))}
                options={[
                  { value: 'male', text: 'Male' },
                  { value: 'female', text: 'Female' },
                  { value: 'other', text: 'Other' }
                ]}
                placeholder="Select gender"
                required
              />
              <FormText
                labelText="Grade Code"
                value={manualEntry.gradeCode}
                onChange={(e) => setManualEntry(prev => ({ ...prev, gradeCode: String(e.target.value) }))}
                placeholder="e.g., JSS1, SSS2"
                required
              />
              <FormText
                labelText="Stream Section"
                value={manualEntry.streamSection}
                onChange={(e) => setManualEntry(prev => ({ ...prev, streamSection: String(e.target.value) }))}
                placeholder="e.g., A, B, Science"
                required
              />
              <FormText
                labelText="Father's Name"
                value={manualEntry.fatherName}
                onChange={(e) => setManualEntry(prev => ({ ...prev, fatherName: String(e.target.value) }))}
                placeholder="Enter father's name"
                required
              />
              <FormText
                labelText="Mother's Name"
                value={manualEntry.motherName}
                onChange={(e) => setManualEntry(prev => ({ ...prev, motherName: String(e.target.value) }))}
                placeholder="Enter mother's name"
                required
              />
              <FormPhoneInput
                labelText="Phone"
                value={manualEntry.phone}
                onChange={(e) => setManualEntry(prev => ({ ...prev, phone: String(e.target.value) }))}
                placeholder="Enter phone number"
              />
              <FormText
                labelText="Email"
                value={manualEntry.email}
                onChange={(e) => setManualEntry(prev => ({ ...prev, email: String(e.target.value) }))}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            <Button onClick={addManualEntry} className="w-full">
              Add Student to List
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <IconDownload className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          {(selectedFile || parsedData.length > 0) && (
            <Button
              onClick={handleUpload}
              disabled={(!selectedFile && parsedData.length === 0) || isProcessingFile}
            >
              {isProcessingFile ? "Processing..." : "Upload & Preview"}
            </Button>
          )}
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <IconAlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Important:</strong> Ensure your file follows the template format.
                Required fields: FirstName, LastName, DateOfBirth, Gender, GradeCode, StreamSection, FatherName, MotherName.
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )

  const renderPreviewStep = () => {
    if (!importResult) return null

    const validRows = importResult.preview.filter(row => row.valid)
    const invalidRows = importResult.preview.filter(row => !row.valid)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconEye className="h-5 w-5" />
            Preview Import Data
          </CardTitle>
          <CardDescription>
            Review the data before importing. {validRows.length} valid, {invalidRows.length} invalid rows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <IconCheck className="h-3 w-3 mr-1" />
              {validRows.length} Valid
            </Badge>
            <Badge variant="destructive">
              <IconX className="h-3 w-3 mr-1" />
              {invalidRows.length} Invalid
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAllValidRows}>
              Select All Valid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
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
                      checked={selectedRows.size === validRows.length && validRows.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllValidRows()
                        } else {
                          setSelectedRows(new Set())
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importResult.preview.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(row.row)}
                        onCheckedChange={() => toggleRowSelection(row.row)}
                        disabled={!row.valid}
                      />
                    </TableCell>
                    <TableCell>{row.row}</TableCell>
                    <TableCell>
                      {row.data.FirstName} {row.data.LastName}
                    </TableCell>
                    <TableCell>{row.data.GradeCode}</TableCell>
                    <TableCell>
                      <Badge variant={row.valid ? "default" : "destructive"}>
                        {row.valid ? "Valid" : "Invalid"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.errors.length > 0 && (
                        <div className="text-xs text-red-600 max-w-xs truncate">
                          {row.errors.join(', ')}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('upload')}>
              Back to Upload
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedRows.size === 0 || bulkImportIsLoading}
            >
              Import {selectedRows.size} Students
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderImportStep = () => {
    if (!importResult) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCheck className="h-5 w-5" />
            Import Complete
          </CardTitle>
          <CardDescription>
            Import process has finished. Here are the results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Import Errors</h4>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>{error.field}</TableCell>
                        <TableCell className="text-red-600">{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setCurrentStep('preview')}>
              Back to Preview
            </Button>
            <Button onClick={onComplete}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Error Block */}
        <ErrorBlock error={bulkImportError} />

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm">Upload</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep !== 'upload' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm">Preview</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep === 'import' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${currentStep === 'import' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'import' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm">Import</span>
          </div>
        </div>

        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'import' && renderImportStep()}

        {(isProcessingFile || bulkImportIsLoading) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{bulkImportIsLoading ? 'Importing...' : 'Processing...'}</span>
              <span>{importProgress}%</span>
            </div>
            <Progress value={importProgress} />
          </div>
        )}
      </div>
    </div>
  )
}