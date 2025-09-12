"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useGetStudentByIdQuery, useUpdateStudentMutation } from "@/redux/api/schoolAdminApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { useToast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"
import { Loader2, Save, Upload, FileText, Calendar, Phone, Mail, User, School, GraduationCap, Home } from "lucide-react"
import type { IStudent } from "@academia-pro/types/student"
import type { TStudentStage, TGradeCode } from "@academia-pro/types/student"
import { toast } from "sonner"

const stageLabels = {
  EY: "Early Years",
  PRY: "Primary",
  JSS: "Junior Secondary",
  SSS: "Senior Secondary",
} as Record<TStudentStage, string>

const gradeCodeLabels = {
  CRECHE: "Creche",
  N1: "Nursery 1",
  N2: "Nursery 2",
  KG1: "KG 1",
  KG2: "KG 2",
  PRY1: "Primary 1",
  PRY2: "Primary 2",
  PRY3: "Primary 3",
  PRY4: "Primary 4",
  PRY5: "Primary 5",
  PRY6: "Primary 6",
  JSS1: "JSS 1",
  JSS2: "JSS 2",
  JSS3: "JSS 3",
  SSS1: "SSS 1",
  SSS2: "SSS 2",
  SSS3: "SSS 3",
} as Record<TGradeCode, string>

export default function StudentProfilePage() {
  const params = useParams()
  const id = params.id as string
  // const { toast } = useToast()
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: student, isLoading, error } = useGetStudentByIdQuery(id)
  const [updateStudent] = useUpdateStudentMutation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Student not found</h3>
          <p className="text-sm text-muted-foreground mt-1">The student profile could not be loaded.</p>
        </div>
      </div>
    )
  }

  const handleSave = async (updates: Partial<IStudent>) => {
    try {
      await updateStudent({ studentId: id, updates }).unwrap()
      toast({
        title: "Success",
        description: "Student profile updated successfully.",
      })
      setEditMode(false)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update student profile.",
        variant: "destructive",
      })
    }
  }

  const router = useRouter()

  const handleInternalTransfer = async (formData: FormData) => {
    const newGradeCode = formData.get('newGradeCode') as string
    const newStreamSection = formData.get('newStreamSection') as string
    const reason = formData.get('reason') as string

    try {
      await updateStudent({
        studentId: id,
        updates: { gradeCode: newGradeCode, streamSection: newStreamSection, reason }
      }).unwrap()
      toast({
        title: "Success",
        description: "Internal transfer completed.",
      })
      router.refresh()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process internal transfer.",
        variant: "destructive",
      })
    }
  }

  const handleExternalTransfer = async (formData: FormData) => {
    const targetSchoolId = formData.get('targetSchoolId') as string
    const exitReason = formData.get('exitReason') as string
    const clearanceDocuments = formData.getAll('clearanceDocuments') as string[]

    try {
      await updateStudent({
        studentId: id,
        updates: { targetSchoolId, exitReason, clearanceDocuments }
      }).unwrap()
      toast({
        title: "Success",
        description: "External transfer initiated.",
      })
      router.refresh()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process external transfer.",
        variant: "destructive",
      })
    }
  }

  const handleGraduate = async (formData: FormData) => {
    const graduationYear = parseInt(formData.get('graduationYear') as string)
    const clearanceStatus = formData.get('clearanceStatus') as string

    try {
      await updateStudent({
        studentId: id,
        updates: { graduationYear, clearanceStatus }
      }).unwrap()
      toast({
        title: "Success",
        description: "Student graduated successfully.",
      })
      router.refresh()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to graduate student.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => setEditMode(true)
  const handleCancel = () => setEditMode(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="h-20 w-20">
              {student.firstName[0]}{student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {student.firstName} {student.middleName} {student.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {gradeCodeLabels[student.gradeCode as TGradeCode] || student.gradeCode} - {stageLabels[student.stage as TStudentStage]}
              </Badge>
              <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                {student.status}
              </Badge>
              {student.isBoarding && <Badge variant="outline">Boarding</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">Admission No: {student.admissionNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={editMode ? "outline" : "default"} onClick={handleEdit}>
                <Save className="h-4 w-4 mr-2" />
                {editMode ? "Cancel" : "Edit Profile"}
              </Button>
            </DialogTrigger>
            {editMode && (
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to the student profile.
                  </DialogDescription>
                </DialogHeader>
                {/* Edit form here */}
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={() => handleSave({})}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p>{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p>{student.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Blood Group</Label>
                    <p>{student.bloodGroup || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p>{student.email || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p>{student.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p>{student.address?.street}, {student.address?.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p>{student.medicalInfo?.emergencyContact?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p>{student.medicalInfo?.emergencyContact?.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Relation</Label>
                    <p>{student.medicalInfo?.emergencyContact?.relation || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Student's academic details and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Current Stage</Label>
                  <p className="mt-1">{stageLabels[student.stage as TStudentStage]}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Grade</Label>
                  <p className="mt-1">{gradeCodeLabels[student.gradeCode as TGradeCode]}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Stream/Section</Label>
                  <p className="mt-1">{student.streamSection}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Admission Date</Label>
                  <p className="mt-1">{new Date(student.admissionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">GPA</Label>
                  <p className="mt-1">{student.gpa || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Credits</Label>
                  <p className="mt-1">{student.totalCredits || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Academic Standing</Label>
                <div className="mt-2 space-y-1">
                  {student.academicStanding?.honors && <Badge variant="secondary">Honors</Badge>}
                  {student.academicStanding?.probation && <Badge variant="destructive">Probation</Badge>}
                  {student.academicStanding?.academicWarning && <Badge variant="outline">Warning</Badge>}
                  {student.academicStanding?.disciplinaryStatus && (
                    <Badge variant="secondary">{student.academicStanding.disciplinaryStatus}</Badge>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Promotion History</Label>
                <div className="mt-2 space-y-2">
                  {student.promotionHistory?.length > 0 ? (
                    student.promotionHistory.map((promo, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{gradeCodeLabels[promo.fromGrade as TGradeCode]} → {gradeCodeLabels[promo.toGrade as TGradeCode]}</span>
                          <span className="text-sm text-muted-foreground">{promo.academicYear}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{promo.reason || 'Standard promotion'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No promotion history</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Student's uploaded documents and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.documents?.length > 0 ? (
                  student.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  </div>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>Select a file to upload</DialogDescription>
                    </DialogHeader>
                    <Input type="file" />
                    <DialogFooter>
                      <Button type="submit">Upload</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Student's academic and transfer history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Transfer History</Label>
                <div className="mt-2 space-y-2">
                  {student.transferHistory?.length > 0 ? (
                    student.transferHistory.map((transfer, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {transfer.type === 'internal' ? 'Internal' : 'External'} Transfer
                          </span>
                          <Badge variant="outline">{transfer.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          From: {transfer.fromSection} To: {transfer.toSection}
                        </p>
                        {transfer.reason && <p className="text-sm text-muted-foreground">{transfer.reason}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transfer.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No transfer history</p>
                  )}
                </div>
              </div>

              {student.graduationYear && (
                <div>
                  <Label className="text-sm font-medium">Graduation</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Graduated in {student.graduationYear}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Student's fee and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Fee Category</Label>
                  <p className="mt-1">{student.financialInfo?.feeCategory || 'Standard'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Outstanding Balance</Label>
                  <p className="mt-1 font-mono">${student.financialInfo?.outstandingBalance || 0}</p>
                </div>
                {student.financialInfo?.scholarship && (
                  <div className="col-span-full">
                    <Label className="text-sm font-medium">Scholarship</Label>
                    <div className="mt-2 p-3 border rounded-lg bg-blue-50">
                      <div className="flex justify-between">
                        <span>Type: {student.financialInfo.scholarship.type}</span>
                        <span>Amount: ${student.financialInfo.scholarship.amount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Valid until {new Date(student.financialInfo.scholarship.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Payment Plan</Label>
                  <p className="mt-1">{student.financialInfo?.paymentPlan || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Payment</Label>
                  <p className="mt-1">{student.financialInfo?.lastPaymentDate ? new Date(student.financialInfo.lastPaymentDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}