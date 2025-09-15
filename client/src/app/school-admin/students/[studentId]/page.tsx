"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import apis from "@/redux/api"
const { useGetStudentQuery, useUpdateStudentMutation } = apis.schoolAdmin.student
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Download } from "lucide-react"
import { Loader2, Save, Upload, FileText, Calendar, Phone, Mail, User, School, GraduationCap, Home, Edit, X } from "lucide-react"
import type { IStudent, IUpdateStudentRequest } from "@academia-pro/types/school-admin"
import type { TStudentStage, TGradeCode } from "@academia-pro/types/student"
import { StudentPersonalInfoForm } from "./_components/StudentPersonalInfoForm"
import { StudentContactInfoForm } from "./_components/StudentContactInfoForm"
import { StudentAcademicInfoForm } from "./_components/StudentAcademicInfoForm"
import { StudentMedicalInfoForm } from "./_components/StudentMedicalInfoForm"
import { StudentParentInfoForm } from "./_components/StudentParentInfoForm"
import { EditReasonModal } from "./_components/EditReasonModal"

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
  const id = params.studentId as string
  const router = useRouter()
  // const { toast } = useToast()
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [pendingUpdates, setPendingUpdates] = useState<Partial<IUpdateStudentRequest> | null>(null)

  const { data: student, isLoading, error } = useGetStudentQuery(id)
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

  const handleSave = (updates: Partial<IUpdateStudentRequest>) => {
    setPendingUpdates(updates)
    setIsReasonModalOpen(true)
  }

  const handleReasonConfirm = async (reason: string) => {
    if (!pendingUpdates) return

    try {
      await updateStudent({ id, data: pendingUpdates, reason }).unwrap()
      toast.success("Student profile updated successfully.")
      setEditMode(false)
      setPendingUpdates(null)
    } catch (err) {
      toast.error("Failed to update student profile.")
    }
  }

  const handleReasonCancel = () => {
    setPendingUpdates(null)
    setIsReasonModalOpen(false)
  }

  const handleInternalTransfer = async (formData: FormData) => {
    const newGradeCode = formData.get('newGradeCode') as string
    const newStreamSection = formData.get('newStreamSection') as string
    const reason = formData.get('reason') as string

    try {
      await updateStudent({
        id,
        data: { gradeCode: newGradeCode, streamSection: newStreamSection }
      }).unwrap()
      toast.success("Internal transfer completed.")
      router.refresh()
    } catch (err) {
      toast.error("Failed to process internal transfer.")
    }
  }

  const handleExternalTransfer = async (formData: FormData) => {
    const targetSchoolId = formData.get('targetSchoolId') as string
    const exitReason = formData.get('exitReason') as string
    const clearanceDocuments = formData.getAll('clearanceDocuments') as string[]

    try {
      await updateStudent({
        id,
        data: { status: 'transferred' }
      }).unwrap()
      toast.success("External transfer initiated.")
      router.refresh()
    } catch (err) {
      toast.error("Failed to process external transfer.")
    }
  }

  const handleGraduate = async (formData: FormData) => {
    const graduationYear = parseInt(formData.get('graduationYear') as string)
    const clearanceStatus = formData.get('clearanceStatus') as string

    try {
      await updateStudent({
        id,
        data: { status: 'graduated' }
      }).unwrap()
      toast.success("Student graduated successfully.")
      router.refresh()
    } catch (err) {
      toast.error("Failed to graduate student.")
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
          <Button variant={editMode ? "outline" : "default"} onClick={editMode ? handleCancel : handleEdit}>
            {editMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {editMode ? (
            <div className="space-y-6">
              <StudentPersonalInfoForm
                student={student}
                onSave={handleSave}
                onCancel={handleCancel}
              />
              <StudentContactInfoForm
                student={student}
                onSave={handleSave}
                onCancel={handleCancel}
              />
              <StudentAcademicInfoForm
                student={student}
                onSave={handleSave}
                onCancel={handleCancel}
              />
              <StudentParentInfoForm
                student={student}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
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
                      <p>{student.medicalInfo?.bloodGroup || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
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
                      <p>{student.medicalInfo?.emergencyContact?.relationship || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Parent Information</CardTitle>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("parents")}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Father</Label>
                      <p className="text-sm">{student.parentInfo?.fatherName || 'Not specified'}</p>
                      <p className="text-xs text-muted-foreground">{student.parentInfo?.fatherPhone || ''}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mother</Label>
                      <p className="text-sm">{student.parentInfo?.motherName || 'Not specified'}</p>
                      <p className="text-xs text-muted-foreground">{student.parentInfo?.motherPhone || ''}</p>
                    </div>
                    {student.parentInfo?.guardianName && (
                      <div>
                        <Label className="text-sm font-medium">Guardian</Label>
                        <p className="text-sm">{student.parentInfo.guardianName}</p>
                        <p className="text-xs text-muted-foreground">{student.parentInfo.guardianPhone || ''}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="parents">
          {editMode ? (
            <StudentParentInfoForm
              student={student}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Parent Information</CardTitle>
                  <CardDescription>Student's parent and guardian details</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <Label className="text-sm font-medium">Father's Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">{student.parentInfo?.fatherName || 'Not specified'}</p>
                      <p className="text-sm text-muted-foreground">{student.parentInfo?.fatherPhone || ''}</p>
                      <p className="text-sm text-muted-foreground">{student.parentInfo?.fatherEmail || ''}</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-pink-50">
                    <Label className="text-sm font-medium">Mother's Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">{student.parentInfo?.motherName || 'Not specified'}</p>
                      <p className="text-sm text-muted-foreground">{student.parentInfo?.motherPhone || ''}</p>
                      <p className="text-sm text-muted-foreground">{student.parentInfo?.motherEmail || ''}</p>
                    </div>
                  </div>
                </div>

                {student.parentInfo?.guardianName && (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <Label className="text-sm font-medium">Guardian's Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">{student.parentInfo.guardianName}</p>
                      <p className="text-sm text-muted-foreground">{student.parentInfo.guardianPhone || ''}</p>
                      <p className="text-sm text-muted-foreground">{student.parentInfo.guardianEmail || ''}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Student&apos;s academic details and history</CardDescription>
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
                  {student.promotionHistory && student.promotionHistory.length > 0 ? (
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

        <TabsContent value="medical">
          {editMode ? (
            <StudentMedicalInfoForm
              student={student}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>Student's health and medical details</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Blood Group</Label>
                    <p className="mt-1">{student.medicalInfo?.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Emergency Contact</Label>
                    <p className="mt-1">{student.medicalInfo?.emergencyContact?.name || 'Not specified'}</p>
                    <p className="text-sm text-muted-foreground">{student.medicalInfo?.emergencyContact?.phone || ''}</p>
                    <p className="text-sm text-muted-foreground">{student.medicalInfo?.emergencyContact?.relationship || ''}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Allergies</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {student.medicalInfo?.allergies && student.medicalInfo.allergies.length > 0 ? (
                      student.medicalInfo.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline">{allergy}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No allergies recorded</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Medications</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {student.medicalInfo?.medications && student.medicalInfo.medications.length > 0 ? (
                      student.medicalInfo.medications.map((medication, index) => (
                        <Badge key={index} variant="secondary">{medication}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No medications recorded</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Medical Conditions</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {student.medicalInfo?.conditions && student.medicalInfo.conditions.length > 0 ? (
                      student.medicalInfo.conditions.map((condition, index) => (
                        <Badge key={index} variant="destructive">{condition}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                    )}
                  </div>
                </div>

                {student.medicalInfo?.doctorInfo && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <Label className="text-sm font-medium">Primary Care Physician</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">{student.medicalInfo.doctorInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{student.medicalInfo.doctorInfo.phone}</p>
                      <p className="text-sm text-muted-foreground">{student.medicalInfo.doctorInfo.clinic}</p>
                    </div>
                  </div>
                )}

                {student.medicalInfo?.insuranceInfo && (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <Label className="text-sm font-medium">Insurance Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">{student.medicalInfo.insuranceInfo.provider}</p>
                      <p className="text-sm text-muted-foreground">Policy: {student.medicalInfo.insuranceInfo.policyNumber}</p>
                      <p className="text-sm text-muted-foreground">Coverage: ${student.medicalInfo.insuranceInfo.coverageAmount || 0}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Student&apos;s uploaded documents and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.documents && student.documents.length > 0 ? (
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
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Student&apos;s academic and transfer history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Transfer History</Label>
                <div className="mt-2 space-y-2">
                  {student.transferHistory && student.transferHistory.length > 0 ? (
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
              <CardDescription>Student&apos;s fee and payment details</CardDescription>
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

      <EditReasonModal
        isOpen={isReasonModalOpen}
        onClose={handleReasonCancel}
        onConfirm={handleReasonConfirm}
      />
    </div>
  )
}