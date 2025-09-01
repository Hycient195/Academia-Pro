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
import { Progress } from "@/components/ui/progress"
import { Pagination, usePagination } from "@/components/ui/pagination"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import {
  IconBuildingBank,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconTrendingUp,
  IconTrendingDown,
  IconCoin,
  IconCreditCard,
  IconReceipt,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react"

// Sample financial data
const payments = [
  {
    id: 1,
    student: "Sarah Johnson",
    studentAvatar: "/avatars/student1.jpg",
    amount: 1200,
    type: "Tuition Fee",
    status: "Paid",
    date: "2024-01-15",
    method: "Bank Transfer",
    grade: "Grade 10-A",
  },
  {
    id: 2,
    student: "Michael Chen",
    studentAvatar: "/avatars/student2.jpg",
    amount: 1200,
    type: "Tuition Fee",
    status: "Pending",
    date: "2024-01-15",
    method: "Cash",
    grade: "Grade 9-B",
  },
  {
    id: 3,
    student: "Emily Rodriguez",
    studentAvatar: "/avatars/student3.jpg",
    amount: 800,
    type: "Lab Fee",
    status: "Overdue",
    date: "2024-01-10",
    method: "Online",
    grade: "Grade 11-C",
  },
  {
    id: 4,
    student: "David Kim",
    studentAvatar: "/avatars/student4.jpg",
    amount: 500,
    type: "Transportation",
    status: "Paid",
    date: "2024-01-12",
    method: "Card",
    grade: "Grade 12-A",
  },
]

const revenueData = [
  { month: "Jul", revenue: 180000, expenses: 45000 },
  { month: "Aug", revenue: 195000, expenses: 52000 },
  { month: "Sep", revenue: 210000, expenses: 48000 },
  { month: "Oct", revenue: 225000, expenses: 55000 },
  { month: "Nov", revenue: 240000, expenses: 50000 },
  { month: "Dec", revenue: 245678, expenses: 58000 },
]

const feeStructure = [
  { grade: "Grade 9", tuition: 1000, lab: 200, transport: 150, total: 1350 },
  { grade: "Grade 10", tuition: 1100, lab: 250, transport: 150, total: 1500 },
  { grade: "Grade 11", tuition: 1200, lab: 300, transport: 150, total: 1650 },
  { grade: "Grade 12", tuition: 1300, lab: 350, transport: 150, total: 1800 },
]

export default function FinancialPage() {
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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter
    const matchesType = typeFilter === "all" || payment.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination logic
  const totalItems = filteredPayments.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    const variants = {
      "Paid": "default",
      "Pending": "secondary",
      "Overdue": "destructive",
    }
    const icons = {
      "Paid": <IconCircleCheck className="w-3 h-3 mr-1" />,
      "Pending": <IconClock className="w-3 h-3 mr-1" />,
      "Overdue": <IconAlertTriangle className="w-3 h-3 mr-1" />,
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="flex items-center">
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      "Bank Transfer": <IconBuildingBank className="w-4 h-4" />,
      "Cash": <IconCoin className="w-4 h-4" />,
      "Online": <IconCreditCard className="w-4 h-4" />,
      "Card": <IconCreditCard className="w-4 h-4" />,
    }
    return icons[method as keyof typeof icons] || <IconReceipt className="w-4 h-4" />
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-muted-foreground">
              Manage fees, payments, expenses, and financial reporting
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IconBuildingBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$245,678</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <IconTrendingUp className="w-3 h-3 mr-1 text-green-500" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">
                8 outstanding payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$58,000</div>
              <p className="text-xs text-muted-foreground">
                -2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <IconCoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$187,678</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <IconTrendingUp className="w-3 h-3 mr-1 text-green-500" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="fees">Fee Structure</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  Track all student payments and fee collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search payments..."
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
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Tuition Fee">Tuition Fee</SelectItem>
                        <SelectItem value="Lab Fee">Lab Fee</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                {/* Payments Table */}
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={payment.studentAvatar} />
                                <AvatarFallback>
                                  {payment.student.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{payment.student}</p>
                                <p className="text-sm text-muted-foreground">{payment.grade}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(payment.method)}
                              <span className="text-sm">{payment.method}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredPayments.length > 0 && (
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
                <CardDescription>
                  Manage fee structures for different grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeStructure.map((fee) => (
                    <div key={fee.grade} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">{fee.grade}</h4>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          ${fee.total}/month
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Tuition</p>
                          <p className="font-semibold">${fee.tuition}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Lab Fee</p>
                          <p className="font-semibold">${fee.lab}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Transport</p>
                          <p className="font-semibold">${fee.transport}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold text-green-600">${fee.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>Monthly financial overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCreditCard className="w-4 h-4 text-blue-500" />
                        <span>Online/Card</span>
                      </div>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconBuildingBank className="w-4 h-4 text-green-500" />
                        <span>Bank Transfer</span>
                      </div>
                      <span className="font-medium">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCoin className="w-4 h-4 text-yellow-500" />
                        <span>Cash</span>
                      </div>
                      <span className="font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Tracking</CardTitle>
                <CardDescription>
                  Monitor and categorize school expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Salaries", amount: 35000, percentage: 60 },
                    { category: "Utilities", amount: 8000, percentage: 14 },
                    { category: "Maintenance", amount: 6000, percentage: 10 },
                    { category: "Supplies", amount: 5000, percentage: 9 },
                    { category: "Other", amount: 4000, percentage: 7 },
                  ].map((expense) => (
                    <div key={expense.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div>
                          <p className="font-medium">{expense.category}</p>
                          <p className="text-sm text-muted-foreground">{expense.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${expense.amount.toLocaleString()}</p>
                        <Progress value={expense.percentage} className="h-2 w-20 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}