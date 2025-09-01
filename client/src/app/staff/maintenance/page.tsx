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
  IconTools,
  IconAlertTriangle,
  IconPackage,
  IconUsers,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconClock,
  IconCircleCheck,
  IconBuilding,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react"

// Sample maintenance data
const workOrders = [
  {
    id: 1,
    title: "Fix Leaking Faucet",
    description: "Water leaking from bathroom faucet in Room 201",
    priority: "High",
    status: "In Progress",
    category: "Plumbing",
    location: "Room 201 Bathroom",
    reportedBy: "Janitor",
    assignedTo: "John Maintenance",
    reportedDate: "2024-01-14",
    dueDate: "2024-01-16",
    estimatedCost: 150,
  },
  {
    id: 2,
    title: "Replace Broken Light Bulb",
    description: "Light bulb in hallway needs replacement",
    priority: "Medium",
    status: "Pending",
    category: "Electrical",
    location: "Main Hallway",
    reportedBy: "Teacher",
    assignedTo: "Unassigned",
    reportedDate: "2024-01-13",
    dueDate: "2024-01-17",
    estimatedCost: 25,
  },
  {
    id: 3,
    title: "Clean Air Conditioning Filters",
    description: "Monthly maintenance for AC filters",
    priority: "Low",
    status: "Completed",
    category: "HVAC",
    location: "Library",
    reportedBy: "Maintenance Team",
    assignedTo: "Mike HVAC",
    reportedDate: "2024-01-12",
    dueDate: "2024-01-15",
    estimatedCost: 0,
  },
]

const equipment = [
  {
    id: 1,
    name: "Projector",
    category: "AV Equipment",
    location: "Room 101",
    status: "Working",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    warrantyExpiry: "2025-01-15",
    purchaseDate: "2023-01-15",
    cost: 1200,
  },
  {
    id: 2,
    name: "Air Conditioning Unit",
    category: "HVAC",
    location: "Library",
    status: "Needs Service",
    lastMaintenance: "2023-12-15",
    nextMaintenance: "2024-03-15",
    warrantyExpiry: "2024-06-30",
    purchaseDate: "2022-06-30",
    cost: 2500,
  },
  {
    id: 3,
    name: "Computer Lab Computers",
    category: "IT Equipment",
    location: "Computer Lab",
    status: "Working",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    warrantyExpiry: "2024-12-31",
    purchaseDate: "2023-01-01",
    cost: 15000,
  },
]

const preventiveMaintenance = [
  {
    id: 1,
    task: "HVAC Filter Replacement",
    frequency: "Monthly",
    nextDue: "2024-02-01",
    assignedTo: "Mike HVAC",
    status: "Scheduled",
    lastCompleted: "2024-01-01",
  },
  {
    id: 2,
    task: "Fire Extinguisher Inspection",
    frequency: "Quarterly",
    nextDue: "2024-03-15",
    assignedTo: "Safety Team",
    status: "Overdue",
    lastCompleted: "2023-12-15",
  },
  {
    id: 3,
    task: "Electrical Panel Check",
    frequency: "Semi-annual",
    nextDue: "2024-06-01",
    assignedTo: "John Electrical",
    status: "Scheduled",
    lastCompleted: "2023-12-01",
  },
]

export default function MaintenancePage() {
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

  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Pagination logic
  const totalItems = filteredWorkOrders.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedWorkOrders = filteredWorkOrders.slice(startIndex, endIndex)

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "bg-red-100 text-red-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "Low": "bg-green-100 text-green-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Completed": "bg-green-100 text-green-800",
      "Overdue": "bg-red-100 text-red-800",
      "Scheduled": "bg-purple-100 text-purple-800",
      "Working": "bg-green-100 text-green-800",
      "Needs Service": "bg-orange-100 text-orange-800",
      "Out of Service": "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getEquipmentStatusIcon = (status: string) => {
    const icons = {
      "Working": <IconCircleCheck className="w-4 h-4 text-green-600" />,
      "Needs Service": <IconAlertTriangle className="w-4 h-4 text-orange-600" />,
      "Out of Service": <IconAlertTriangle className="w-4 h-4 text-red-600" />,
    }
    return icons[status as keyof typeof icons] || <IconTools className="w-4 h-4 text-gray-600" />
  }

  const stats = {
    totalWorkOrders: workOrders.length,
    pendingWorkOrders: workOrders.filter(w => w.status === "Pending").length,
    inProgressWorkOrders: workOrders.filter(w => w.status === "In Progress").length,
    completedWorkOrders: workOrders.filter(w => w.status === "Completed").length,
    equipmentNeedingService: equipment.filter(e => e.status === "Needs Service").length,
    overdueMaintenance: preventiveMaintenance.filter(p => p.status === "Overdue").length,
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facility Maintenance</h1>
            <p className="text-muted-foreground">
              Manage work orders, equipment maintenance, and facility operations
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                New Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Work Order</DialogTitle>
                <DialogDescription>
                  Report a maintenance issue or create a work order.
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
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="carpentry">Carpentry</SelectItem>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="Where is the issue located?" />
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
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Detailed description of the issue..."
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
                <Button>Submit Work Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
              <IconTools className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Issues</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.equipmentNeedingService}</div>
              <p className="text-xs text-muted-foreground">
                Need maintenance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueMaintenance}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="work-orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="preventive">Preventive Maintenance</TabsTrigger>
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
          </TabsList>

          <TabsContent value="work-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Orders</CardTitle>
                <CardDescription>
                  Track and manage maintenance work orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search work orders..."
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
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
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
                    Export Report
                  </Button>
                </div>

                {/* Work Orders Table */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Work Order</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWorkOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Reported: {order.reportedDate}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IconBuilding className="h-4 w-4 text-muted-foreground" />
                              {order.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{order.assignedTo}</span>
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
                  {filteredWorkOrders.length > 0 && (
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

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Inventory</CardTitle>
                <CardDescription>
                  Track and maintain school equipment and assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          {getEquipmentStatusIcon(item.status)}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.category} • {item.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last maintenance: {item.lastMaintenance} • Next: {item.nextMaintenance}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(item.status)} mb-2`}>
                          {item.status}
                        </Badge>
                        <p className="text-sm">Cost: ${item.cost.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Warranty: {item.warrantyExpiry}</p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            <IconEye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconTools className="mr-2 h-4 w-4" />
                            Service
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preventive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preventive Maintenance</CardTitle>
                <CardDescription>
                  Scheduled maintenance tasks to prevent equipment failure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preventiveMaintenance.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <IconTools className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{task.task}</p>
                          <p className="text-sm text-muted-foreground">
                            Frequency: {task.frequency} • Next due: {task.nextDue}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last completed: {task.lastCompleted} • Assigned to: {task.assignedTo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(task.status)} mb-2`}>
                          {task.status}
                        </Badge>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm">
                            <IconCircleCheck className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconClock className="mr-2 h-4 w-4" />
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contractors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contractor Directory</CardTitle>
                  <CardDescription>
                    Manage external contractors and service providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John's Plumbing</p>
                          <p className="text-sm text-muted-foreground">Plumbing Services</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Mike's Electrical</p>
                          <p className="text-sm text-muted-foreground">Electrical Services</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Work</CardTitle>
                  <CardDescription>
                    Contractor performance and recent projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm mb-1">Bathroom Renovation</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        John's Plumbing • Completed Jan 10, 2024
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>Cost: $2,500</span>
                        <span>Rating: 4.8/5</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm mb-1">Electrical Panel Upgrade</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Mike's Electrical • Completed Jan 8, 2024
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>Cost: $1,800</span>
                        <span>Rating: 4.9/5</span>
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