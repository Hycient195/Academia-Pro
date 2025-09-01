import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  IconFileText,
  IconDownload,
  IconEye,
  IconCalendar,
  IconUsers,
  IconTrendingUp,
  IconChartBar,
} from "@tabler/icons-react"

// Sample reports data
const reportsData = [
  {
    id: 1,
    title: "Monthly Attendance Report",
    type: "Attendance",
    period: "October 2024",
    generatedDate: "2024-11-01",
    status: "Ready",
    downloads: 45,
    size: "2.3 MB",
  },
  {
    id: 2,
    title: "Academic Performance Summary",
    type: "Academic",
    period: "Q3 2024",
    generatedDate: "2024-10-31",
    status: "Ready",
    downloads: 32,
    size: "4.1 MB",
  },
  {
    id: 3,
    title: "Student Enrollment Report",
    type: "Administrative",
    period: "September 2024",
    generatedDate: "2024-10-15",
    status: "Ready",
    downloads: 28,
    size: "1.8 MB",
  },
  {
    id: 4,
    title: "Financial Summary Report",
    type: "Financial",
    period: "Q3 2024",
    generatedDate: "2024-10-30",
    status: "Processing",
    downloads: 0,
    size: "Pending",
  },
]

const reportCategories = [
  {
    name: "Academic Reports",
    count: 12,
    icon: IconChartBar,
    description: "Grades, assessments, and academic progress",
  },
  {
    name: "Attendance Reports",
    count: 8,
    icon: IconCalendar,
    description: "Student attendance and participation",
  },
  {
    name: "Administrative Reports",
    count: 15,
    icon: IconFileText,
    description: "School operations and management",
  },
  {
    name: "Financial Reports",
    count: 6,
    icon: IconTrendingUp,
    description: "Budget, fees, and financial data",
  },
]

const getStatusColor = (status: string) => {
  const colors = {
    "Ready": "bg-green-100 text-green-800",
    "Processing": "bg-yellow-100 text-yellow-800",
    "Failed": "bg-red-100 text-red-800",
  }
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

const getTypeColor = (type: string) => {
  const colors = {
    "Academic": "bg-blue-100 text-blue-800",
    "Attendance": "bg-green-100 text-green-800",
    "Administrative": "bg-purple-100 text-purple-800",
    "Financial": "bg-orange-100 text-orange-800",
  }
  return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

export default function ReportsComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Generate and manage school reports and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconChartBar className="mr-2 h-4 w-4" />
              Analytics Dashboard
            </Button>
            <Button>
              <IconFileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.count} reports</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Report Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <IconFileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">41</div>
              <p className="text-xs text-muted-foreground">
                Generated this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <IconDownload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Reports in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.7 GB</div>
              <p className="text-xs text-muted-foreground">
                Report files stored
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Latest generated reports and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsData.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <IconFileText className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{report.title}</h3>
                      <Badge className={`${getStatusColor(report.status)} text-xs`}>
                        {report.status}
                      </Badge>
                      <Badge className={`${getTypeColor(report.type)} text-xs`}>
                        {report.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground mb-3">
                      <span>Period: {report.period}</span>
                      <span>•</span>
                      <span>Generated: {report.generatedDate}</span>
                      <span>•</span>
                      <span>{report.downloads} downloads</span>
                      <span>•</span>
                      <span>Size: {report.size}</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconDownload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report Generation</CardTitle>
            <CardDescription>
              Generate common reports with predefined templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconUsers className="h-5 w-5" />
                <span>Student List Report</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconCalendar className="h-5 w-5" />
                <span>Monthly Attendance</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconChartBar className="h-5 w-5" />
                <span>Grade Distribution</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}