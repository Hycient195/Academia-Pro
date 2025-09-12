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

interface BulkImportWizardProps {
  onComplete: () => void
}

interface StudentImportData {
  FirstName: string
  LastName: string
  MiddleName?: string
  DateOfBirth: string
  Gender: 'male' | 'female' | 'other'
  BloodGroup?: string
  Email?: string
  Phone?: string
  AdmissionNumber: string
  Stage: string
  GradeCode: string
  StreamSection: string
  AdmissionDate: string
  EnrollmentType: string
  FatherName?: string
  FatherPhone?: string
  FatherEmail?: string
  MotherName?: string
  MotherPhone?: string
  MotherEmail?: string
  AddressStreet?: string
  AddressCity?: string
  AddressState?: string
  AddressPostalCode?: string
  AddressCountry?: string
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
    data: StudentImportData
  }>
  preview: Array<{
    row: number
    data: StudentImportData
    valid: boolean
    errors: string[]
  }>
}

export function BulkImportWizard({ onComplete }: BulkImportWizardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'import'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [importProgress, setImportProgress] = useState(0)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type)) {
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

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock result
      const mockResult: ImportResult = {
        total: 100,
        successful: 85,
        failed: 15,
        errors: [
          { row: 5, field: 'email', message: 'Invalid email format', data: { FirstName: 'Invalid', LastName: 'Student', DateOfBirth: 'invalid', Gender: 'male', AdmissionNumber: 'ADM001', Stage: 'PRY', GradeCode: 'PRY1', StreamSection: 'A', AdmissionDate: '2024-01-01', EnrollmentType: 'regular' } },
          { row: 12, field: 'dateOfBirth', message: 'Invalid date format', data: { FirstName: 'Another', LastName: 'Student', DateOfBirth: 'invalid', Gender: 'female', AdmissionNumber: 'ADM002', Stage: 'JSS', GradeCode: 'JSS1', StreamSection: 'B', AdmissionDate: '2024-01-01', EnrollmentType: 'regular' } },
        ],
        preview: Array.from({ length: 100 }, (_, i) => ({
          row: i + 1,
          data: {
            FirstName: `Student${i + 1}`,
            LastName: `Last${i + 1}`,
            DateOfBirth: `200${5 + (i % 5)}-03-15`,
            Gender: i % 2 === 0 ? 'male' : 'female',
            AdmissionNumber: `ADM${String(i + 1).padStart(4, '0')}`,
            Stage: i % 3 === 0 ? 'PRY' : i % 3 === 1 ? 'JSS' : 'SSS',
            GradeCode: i % 3 === 0 ? 'PRY1' : i % 3 === 1 ? 'JSS1' : 'SSS1',
            StreamSection: 'A',
            AdmissionDate: '2024-08-01',
            EnrollmentType: 'regular'
          },
          valid: i < 85,
          errors: i >= 85 ? ['Invalid data'] : []
        }))
      }

      setImportResult(mockResult)
      setCurrentStep('preview')
    } catch (error) {
      toast.error("Failed to process file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !importResult) return

    setIsLoading(true)
    try {
      setImportProgress(0)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000))

      clearInterval(progressInterval)
      setImportProgress(100)

      // Update result with final import data
      const finalResult = {
        ...importResult,
        successful: selectedRows.size,
        failed: importResult.total - selectedRows.size
      }

      setImportResult(finalResult)
      setCurrentStep('import')

      if (finalResult.failed === 0) {
        toast.success(`Successfully imported ${finalResult.successful} students`)
      } else {
        toast.warning(`Imported ${finalResult.successful} students with ${finalResult.failed} errors`)
      }
    } catch (error) {
      toast.error("Import failed")
    } finally {
      setIsLoading(false)
    }
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
          Select a CSV or Excel file containing student information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <IconDownload className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? "Processing..." : "Upload & Preview"}
          </Button>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <IconAlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Important:</strong> Ensure your file follows the template format.
                Required fields: FirstName, LastName, DateOfBirth, Gender, Stage, GradeCode, StreamSection.
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
              disabled={selectedRows.size === 0 || isLoading}
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

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{importProgress}%</span>
            </div>
            <Progress value={importProgress} />
          </div>
        )}
      </div>
    </div>
  )
}