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
  IconDeviceDesktop,
  IconSearch,
  IconPlus,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconSettings,
  IconServer,
  IconWifi,
  IconDeviceLaptop,
  IconPrinter,
  IconHeadphones,
  IconTool,
  IconFilter,
  IconUserCheck,
  IconCalendar,
  IconFileText,
} from "@tabler/icons-react"

// Sample IT support data
const supportTickets = [
  {
    id: 1,
    title: "Computer not starting up",
    description: "Student laptop won't boot up in classroom 101",
    priority: "High",
    status: "In Progress",
    category: "Hardware",
    reportedBy: "Sarah Johnson",
    assignedTo: "John Smith",
    createdDate: "2024-01-14",
    dueDate: "2024-01-15",
    avatar: "/avatars/student1.jpg",
  },
  {
    id: 2,
    title: "Internet connection issues",
    description: "WiFi connectivity problems in library",
    priority: "Medium",
    status: "Open",
    category: "Network",
    reportedBy: "Mike Chen",
    assignedTo: "Unassigned",
    createdDate: "2024-01-13",
    dueDate: "2024-01-16",
    avatar: "/avatars/student2.jpg",
  },
  {
    id: 3,
    title: "Printer out of toner",
    description: "Main office printer needs toner replacement",
    priority: "Low",
    status: "Resolved",
    category: "Printer",
    reportedBy: "Admin Office",
    assignedTo: "Jane Doe",
    createdDate: "2024-01-12",
    dueDate: "2024-01-13",
    avatar: "/avatars/admin.jpg",
  },
]

const systemMaintenance = [
  {
    id: 1,
    title: "Server Backup",
    description: "Daily automated backup of all school servers",
    type: "Automated",
    status: "Completed",
    lastRun: "2024-01-14 02:00 AM",
    nextRun: "2024-01-15 02:00 AM",
    success: true,
  },
  {
    id: 2,
    title: "Software Updates",
    description: "Windows security patches and updates",
    type: "Scheduled",
    status: "In Progress",
    lastRun: "2024-01-13 10:00 PM",
    nextRun: "2024-01-14 10:00 PM",
    success: null,
  },
  {
    id: 3,
    title: "Network Monitoring",
    description: "Continuous network health monitoring",
    type: "Continuous",
    status: "Active",
    lastRun: "Real-time",
    nextRun: "Ongoing",
    success: true,
  },
]

const equipmentInventory = [
  {
    id: 1,
    name: "Dell Latitude 5420",
    type: "Laptop",
    serialNumber: "DL5420-001",
    location: "Classroom 101",
    status: "Active",
    assignedTo: "Sarah Johnson",
    purchaseDate: "2023-08-15",
    warrantyExpiry: "2026-08-15",
  },
  {
    id: 2,
    name: "HP LaserJet Pro",
    type: "Printer",
    serialNumber: "HPLJP-045",
    location: "Admin Office",
    status: "Active",
    assignedTo: "Admin Office",
    purchaseDate: "2023-06-20",
    warrantyExpiry: "2025-06-20",
  },
  {
    id: 3,
    name: "Cisco Router",
    type: "Network Equipment",
    serialNumber: "CISCO-RT-089",
    location: "Server Room",
    status: "Active",
    assignedTo: "IT Department",
    purchaseDate: "2023-09-10",
    warrantyExpiry: "2026-09-10",
  },
]

const getPriorityBadge = (priority: string) => {
  const variants = {
    "High": "destructive",
    "Medium": "default",
    "Low": "secondary",
  }
  return (
    <Badge variant={variants[priority as keyof typeof variants] as any}>
      {priority}
    </Badge>
  )
}

const getStatusBadge = (status: string) => {
  const variants = {
    "Open": "secondary",
    "In Progress": "default",
    "Resolved": "default",
    "Closed": "secondary",
    "Active": "default",
    "Inactive": "secondary",
    "Completed": "default",
  }
  const icons = {
    "Open": <IconClock className="w-3 h-3 mr-1" />,
    "In Progress": <IconSettings className="w-3 h-3 mr-1" />,
    "Resolved": <IconCircleCheck className="w-3 h-3 mr-1" />,
    "Closed": <IconCircleCheck className="w-3 h-3 mr-1" />,
    "Active": <IconCircleCheck className="w-3 h-3 mr-1" />,
    "Inactive": <IconAlertTriangle className="w-3 h-3 mr-1" />,
    "Completed": <IconCircleCheck className="w-3 h-3 mr-1" />,
  }
  return (
    <Badge variant={variants[status as keyof typeof variants] as any} className="flex items-center">
      {icons[status as keyof typeof icons]}
      {status}
    </Badge>
  )
}

const getCategoryIcon = (category: string) => {
  const icons = {
    "Hardware": <IconDeviceLaptop className="w-4 h-4" />,
    "Software": <IconDeviceDesktop className="w-4 h-4" />,
    "Network": <IconWifi className="w-4 h-4" />,
    "Printer": <IconPrinter className="w-4 h-4" />,
    "Audio/Video": <IconHeadphones className="w-4 h-4" />,
    "Other": <IconTool className="w-4 h-4" />,
  }
  return icons[category as keyof typeof icons] || icons.Other
}

export default function ITPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(10)

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Pagination logic
  const totalItems = filteredTickets.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex)

  const getSystemStats = () => {
    const totalTickets = supportTickets.length
    const openTickets = supportTickets.filter(t => t.status === "Open").length
    const inProgressTickets = supportTickets.filter(t => t.status === "In Progress").length
    const resolvedTickets = supportTickets.filter(t => t.status === "Resolved").length
    const highPriorityTickets = supportTickets.filter(t => t.priority === "High").length

    return { totalTickets, openTickets, inProgressTickets, resolvedTickets, highPriorityTickets }
  }

  const stats = getSystemStats()

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">IT Support Dashboard</h1>
            <p className="text-muted-foreground">
              Manage technical issues, system maintenance, and equipment inventory
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Report a technical issue or request IT support.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue Title</label>
                    <Input placeholder="Brief description of the issue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="audio-video">Audio/Video</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Detailed description of the issue..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input placeholder="Where is the issue occurring?" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Ticket</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <IconDeviceDesktop className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <IconSettings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highPriorityTickets}</div>
              <p className="text-xs text-muted-foreground">
                Urgent issues
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="maintenance">System Maintenance</TabsTrigger>
            <TabsTrigger value="inventory">Equipment Inventory</TabsTrigger>
            <TabsTrigger value="network">Network Status</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>
                  Track and manage technical support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>

                {/* Tickets Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ticket.title}</p>
                              <p className="text-sm text-muted-foreground">{ticket.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(ticket.category)}
                              <span>{ticket.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={ticket.avatar} />
                                <AvatarFallback className="text-xs">
                                  {ticket.reportedBy.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{ticket.reportedBy}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {ticket.assignedTo === "Unassigned" ? (
                                <Badge variant="outline">Unassigned</Badge>
                              ) : (
                                ticket.assignedTo
                              )}
                            </span>
                          </TableCell>
                          <TableCell>{ticket.dueDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                Update
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {filteredTickets.length > 0 && (
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

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Overall system performance and health status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Server Uptime</span>
                      <span className="font-medium">99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Performance</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span className="font-medium">67.3%</span>
                    </div>
                    <Progress value={67.3} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common maintenance and monitoring tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <IconServer className="mr-2 h-4 w-4" />
                    Run System Scan
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconSettings className="mr-2 h-4 w-4" />
                    Update Software
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconWifi className="mr-2 h-4 w-4" />
                    Network Diagnostics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <IconCalendar className="mr-2 h-4 w-4" />
                    Schedule Maintenance
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>
                  Automated and scheduled maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMaintenance.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <IconServer className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Last: {task.lastRun}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Next: {task.nextRun}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {task.type}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.status)}
                          {task.success !== null && (
                            <div className={`w-2 h-2 rounded-full ${task.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Inventory</CardTitle>
                <CardDescription>
                  Track and manage IT equipment and assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <IconDeviceLaptop className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • SN: {item.serialNumber}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Location: {item.location}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Assigned: {item.assignedTo}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(item.status)}
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Network Status</CardTitle>
                  <CardDescription>
                    Current network health and connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconWifi className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <p className="text-2xl font-bold text-green-600">Online</p>
                    <p className="text-muted-foreground">All systems operational</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Internet Speed</CardTitle>
                  <CardDescription>
                    Current internet connection performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconWifi className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-2xl font-bold">150 Mbps</p>
                    <p className="text-muted-foreground">Download speed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Devices</CardTitle>
                  <CardDescription>
                    Active network connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <IconDeviceLaptop className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-muted-foreground">Active connections</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Network Monitoring</CardTitle>
                <CardDescription>
                  Real-time network performance and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Alerts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">High latency detected</p>
                          <p className="text-xs text-muted-foreground">Library WiFi • 5 min ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Network restored</p>
                          <p className="text-xs text-muted-foreground">Classroom 203 • 12 min ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Network Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Bandwidth Usage</span>
                        <span className="font-medium">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Packet Loss</span>
                        <span className="font-medium">0.1%</span>
                      </div>
                      <Progress value={0.1} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span className="font-medium">23ms</span>
                      </div>
                      <Progress value={77} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}