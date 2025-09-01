import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  IconFileText,
  IconPlus,
  IconEye,
  IconEdit,
  IconDownload,
  IconCalendar,
} from "@tabler/icons-react"

// Sample policies data
const policies = [
  {
    id: 1,
    title: "Academic Integrity Policy",
    category: "Academic",
    version: "2.1",
    lastUpdated: "2024-11-15",
    status: "Active",
    downloads: 245,
    description: "Guidelines for maintaining academic honesty and integrity",
  },
  {
    id: 2,
    title: "Student Code of Conduct",
    category: "Discipline",
    version: "3.0",
    lastUpdated: "2024-10-20",
    status: "Active",
    downloads: 189,
    description: "Rules and expectations for student behavior",
  },
  {
    id: 3,
    title: "Attendance Policy",
    category: "Academic",
    version: "1.5",
    lastUpdated: "2024-09-10",
    status: "Active",
    downloads: 156,
    description: "Guidelines for student attendance and excused absences",
  },
  {
    id: 4,
    title: "Technology Use Policy",
    category: "Technology",
    version: "2.0",
    lastUpdated: "2024-08-05",
    status: "Draft",
    downloads: 0,
    description: "Rules for appropriate use of school technology resources",
  },
]

const getStatusColor = (status: string) => {
  const colors = {
    "Active": "bg-green-100 text-green-800",
    "Draft": "bg-yellow-100 text-yellow-800",
    "Archived": "bg-gray-100 text-gray-800",
  }
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

const getCategoryColor = (category: string) => {
  const colors = {
    "Academic": "bg-blue-100 text-blue-800",
    "Discipline": "bg-red-100 text-red-800",
    "Technology": "bg-purple-100 text-purple-800",
    "Safety": "bg-orange-100 text-orange-800",
  }
  return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

export default function PoliciesComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Policies</h1>
            <p className="text-muted-foreground">
              Manage and distribute school policies and guidelines
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export All
            </Button>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              New Policy
            </Button>
          </div>
        </div>

        {/* Policy Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
              <IconFileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{policies.length}</div>
              <p className="text-xs text-muted-foreground">
                Active policies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <IconDownload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {policies.reduce((sum, policy) => sum + policy.downloads, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <IconEye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {policies.filter(p => p.status === "Active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in effect
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Policies</CardTitle>
              <IconEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {policies.filter(p => p.status === "Draft").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Policies List */}
        <Card>
          <CardHeader>
            <CardTitle>All Policies</CardTitle>
            <CardDescription>
              Manage school policies and procedures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <IconFileText className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{policy.title}</h3>
                      <Badge className={`${getStatusColor(policy.status)} text-xs`}>
                        {policy.status}
                      </Badge>
                      <Badge className={`${getCategoryColor(policy.category)} text-xs`}>
                        {policy.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {policy.description}
                    </p>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span>Version {policy.version}</span>
                      <span>•</span>
                      <span>Updated {policy.lastUpdated}</span>
                      <span>•</span>
                      <span>{policy.downloads} downloads</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <IconEdit className="h-4 w-4" />
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common policy management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconPlus className="h-5 w-5" />
                <span>Create New Policy</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconDownload className="h-5 w-5" />
                <span>Bulk Download</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <IconCalendar className="h-5 w-5" />
                <span>Schedule Review</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}