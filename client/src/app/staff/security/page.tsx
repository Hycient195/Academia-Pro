"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  IconShield,
  IconAlertTriangle,
  IconKey,
  IconUsers,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconCamera,
  IconClock,
  IconMapPin,
  IconUserCheck,
  IconUserX,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react"

// Sample security data
const incidents = [
  {
    id: 1,
    title: "Unauthorized Access Attempt",
    type: "Security Breach",
    severity: "High",
    status: "Investigating",
    reportedBy: "Security Guard",
    location: "Main Entrance",
    date: "2024-01-15",
    time: "09:30 AM",
    description: "Unknown individual attempted to enter restricted area",
  },
  {
    id: 2,
    title: "Student Fight",
    type: "Behavioral Incident",
    severity: "Medium",
    status: "Resolved",
    reportedBy: "Teacher",
    location: "Cafeteria",
    date: "2024-01-14",
    time: "12:15 PM",
    description: "Physical altercation between two students",
  },
  {
    id: 3,
    title: "Lost Item",
    type: "Property Incident",
    severity: "Low",
    status: "Closed",
    reportedBy: "Student",
    location: "Library",
    date: "2024-01-13",
    time: "2:45 PM",
    description: "Student reported lost backpack",
  },
]

const accessLogs = [
  {
    id: 1,
    personName: "John Smith",
    personType: "Staff",
    accessPoint: "Main Entrance",
    accessTime: "2024-01-15 08:30 AM",
    status: "Granted",
    method: "RFID Card",
  },
  {
    id: 2,
    personName: "Sarah Johnson",
    personType: "Student",
    accessPoint: "Side Entrance",
    accessTime: "2024-01-15 08:35 AM",
    status: "Granted",
    method: "RFID Card",
  },
  {
    id: 3,
    personName: "Unknown Visitor",
    personType: "Visitor",
    accessPoint: "Main Entrance",
    accessTime: "2024-01-15 09:15 AM",
    status: "Denied",
    method: "Manual",
  },
]

const visitors = [
  {
    id: 1,
    name: "Parent Conference",
    visitorName: "Michael Johnson",
    purpose: "Parent-Teacher Meeting",
    host: "Mrs. Davis",
    checkInTime: "2024-01-15 10:00 AM",
    checkOutTime: null,
    status: "Checked In",
    badgeNumber: "V001",
  },
  {
    id: 2,
    name: "Delivery",
    visitorName: "UPS Driver",
    purpose: "Package Delivery",
    host: "Office Staff",
    checkInTime: "2024-01-15 11:30 AM",
    checkOutTime: "2024-01-15 11:45 AM",
    status: "Checked Out",
    badgeNumber: "V002",
  },
]

export default function SecurityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter
    const matchesType = typeFilter === "all" || incident.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination logic
  const totalItems = filteredIncidents.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)

  const getSeverityColor = (severity: string) => {
    const colors = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "Low": "bg-green-100 text-green-800",
    }
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "Investigating": "bg-blue-100 text-blue-800",
      "Resolved": "bg-green-100 text-green-800",
      "Closed": "bg-gray-100 text-gray-800",
      "Granted": "bg-green-100 text-green-800",
      "Denied": "bg-red-100 text-red-800",
      "Checked In": "bg-blue-100 text-blue-800",
      "Checked Out": "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getAccessStatusIcon = (status: string) => {
    return status === "Granted" ? <IconUserCheck className="w-4 h-4 text-green-600" /> : <IconUserX className="w-4 h-4 text-red-600" />
  }

  const stats = {
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter(i => i.status === "Investigating").length,
    resolvedIncidents: incidents.filter(i => i.status === "Resolved").length,
    todayAccess: accessLogs.filter(a => a.accessTime.includes("2024-01-15")).length,
    currentVisitors: visitors.filter(v => v.status === "Checked In").length,
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
            <p className="text-muted-foreground">
              Monitor security incidents, manage access control, and track visitors
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Report Security Incident</DialogTitle>
                <DialogDescription>
                  Report a security incident or safety concern.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security-breach">Security Breach</SelectItem>
                      <SelectItem value="behavioral">Behavioral Incident</SelectItem>
                      <SelectItem value="property">Property Incident</SelectItem>
                      <SelectItem value="medical">Medical Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="Where did the incident occur?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the incident in detail..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reported By</label>
                  <Input placeholder="Your name or position" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Report Incident</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIncidents}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Under investigation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Access</CardTitle>
              <IconKey className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAccess}</div>
              <p className="text-xs text-muted-foreground">
                Access attempts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Visitors</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentVisitors}</div>
              <p className="text-xs text-muted-foreground">
                On campus
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Incidents</CardTitle>
                <CardDescription>
                  Track and manage security incidents and safety concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search incidents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Investigating">Investigating</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Security Breach">Security Breach</SelectItem>
                        <SelectItem value="Behavioral Incident">Behavioral</SelectItem>
                        <SelectItem value="Property Incident">Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>

                {/* Incidents Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Incident</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{incident.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {incident.date} at {incident.time}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{incident.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IconMapPin className="h-4 w-4 text-muted-foreground" />
                              {incident.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconFileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredIncidents.length > 0 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Control Logs</CardTitle>
                <CardDescription>
                  Monitor and track access attempts across campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          {getAccessStatusIcon(log.status)}
                        </div>
                        <div>
                          <p className="font-medium">{log.personName}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.personType} • {log.accessPoint} • {log.accessTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(log.status)} mb-2`}>
                          {log.status}
                        </Badge>
                        <p className="text-sm">Method: {log.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Management</CardTitle>
                <CardDescription>
                  Track visitors and manage campus access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visitors.map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{visitor.visitorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{visitor.visitorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {visitor.purpose} • Host: {visitor.host}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Badge: {visitor.badgeNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(visitor.status)} mb-2`}>
                          {visitor.status}
                        </Badge>
                        <p className="text-sm">Check-in: {visitor.checkInTime}</p>
                        {visitor.checkOutTime && (
                          <p className="text-sm">Check-out: {visitor.checkOutTime}</p>
                        )}
                        {visitor.status === "Checked In" && (
                          <Button variant="outline" size="sm" className="mt-2">
                            Check Out
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Security Cameras</CardTitle>
                  <CardDescription>
                    Live camera feeds and recordings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <IconCamera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Main Entrance</p>
                      </div>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <IconCamera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Parking Lot</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Alerts</CardTitle>
                  <CardDescription>
                    Recent security notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <IconAlertTriangle className="h-5 w-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Unauthorized Access</p>
                        <p className="text-xs text-muted-foreground">Main entrance - 5 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded">
                      <IconClock className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Late Check-out</p>
                        <p className="text-xs text-muted-foreground">Visitor V001 - 15 min ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}