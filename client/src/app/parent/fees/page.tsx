import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  IconFileText,
  IconCreditCard,
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour1,
  IconDownload,
  IconReceipt,
  IconCalendar,
  IconTrendingUp,
  IconUsers,
  IconCurrencyDollar,
} from "@tabler/icons-react"

// Sample fee data for children
const childrenFees = {
  emma: {
    name: "Emma Johnson",
    totalFees: 2500,
    paidAmount: 2200,
    pendingAmount: 300,
    overdueAmount: 0,
    lastPayment: "2024-01-10",
    nextDue: "2024-02-15",
    feeBreakdown: [
      { category: "Tuition Fee", amount: 2000, status: "paid", dueDate: "2024-01-15" },
      { category: "Library Fee", amount: 100, status: "paid", dueDate: "2024-01-20" },
      { category: "Lab Fee", amount: 200, status: "pending", dueDate: "2024-01-25" },
      { category: "Transportation", amount: 200, status: "pending", dueDate: "2024-02-01" },
    ],
    paymentHistory: [
      { date: "2024-01-10", amount: 2000, method: "Online", reference: "TXN001" },
      { date: "2024-01-12", amount: 100, method: "Cash", reference: "TXN002" },
      { date: "2023-12-15", amount: 1900, method: "Online", reference: "TXN003" },
    ]
  },
  michael: {
    name: "Michael Johnson",
    totalFees: 2200,
    paidAmount: 1800,
    pendingAmount: 400,
    overdueAmount: 200,
    lastPayment: "2024-01-08",
    nextDue: "2024-01-25",
    feeBreakdown: [
      { category: "Tuition Fee", amount: 1800, status: "paid", dueDate: "2024-01-15" },
      { category: "Library Fee", amount: 100, status: "paid", dueDate: "2024-01-20" },
      { category: "Sports Fee", amount: 150, status: "overdue", dueDate: "2024-01-10" },
      { category: "Activity Fee", amount: 150, status: "pending", dueDate: "2024-02-01" },
    ],
    paymentHistory: [
      { date: "2024-01-08", amount: 1800, method: "Bank Transfer", reference: "TXN004" },
      { date: "2024-01-10", amount: 100, method: "Online", reference: "TXN005" },
      { date: "2023-12-12", amount: 1700, method: "Cash", reference: "TXN006" },
    ]
  }
}

const getStatusBadge = (status: string) => {
  const variants = {
    "paid": "bg-green-100 text-green-800",
    "pending": "bg-yellow-100 text-yellow-800",
    "overdue": "bg-red-100 text-red-800",
  }
  const icons = {
    "paid": <IconCircleCheck className="h-3 w-3 mr-1" />,
    "pending": <IconClockHour1 className="h-3 w-3 mr-1" />,
    "overdue": <IconAlertTriangle className="h-3 w-3 mr-1" />,
  }
  return (
    <Badge className={`${variants[status as keyof typeof variants]} flex items-center`}>
      {icons[status as keyof typeof icons]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function ParentFeesPage() {
  const totalFamilyFees = Object.values(childrenFees).reduce((sum, child) => sum + child.totalFees, 0)
  const totalPaid = Object.values(childrenFees).reduce((sum, child) => sum + child.paidAmount, 0)
  const totalPending = Object.values(childrenFees).reduce((sum, child) => sum + child.pendingAmount, 0)
  const totalOverdue = Object.values(childrenFees).reduce((sum, child) => sum + child.overdueAmount, 0)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fees & Payments</h1>
            <p className="text-muted-foreground">
              Track and manage fee payments for all your children
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Download Statements
            </Button>
            <Button>
              <IconCreditCard className="mr-2 h-4 w-4" />
              Make Payment
            </Button>
          </div>
        </div>

        {/* Family Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Family Fees</CardTitle>
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFamilyFees}</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPaid}</div>
              <p className="text-xs text-muted-foreground">
                {((totalPaid / totalFamilyFees) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <IconClockHour1 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${totalPending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalOverdue}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Children Fee Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(childrenFees).map(([key, child]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{child.name}</h3>
                  <Badge variant="outline">
                    Next due: {new Date(child.nextDue).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-lg font-semibold">${child.totalFees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-lg font-semibold text-green-600">${child.paidAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-lg font-semibold text-yellow-600">${child.pendingAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-lg font-semibold text-red-600">${child.overdueAmount}</p>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Payment Progress</span>
                    <span>{((child.paidAmount / child.totalFees) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(child.paidAmount / child.totalFees) * 100} className="h-2" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Fee Management */}
        <Tabs defaultValue="emma" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emma">Emma Johnson</TabsTrigger>
            <TabsTrigger value="michael">Michael Johnson</TabsTrigger>
          </TabsList>

          {Object.entries(childrenFees).map(([key, child]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {/* Fee Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>{child.name} - Fee Breakdown</CardTitle>
                  <CardDescription>
                    Detailed breakdown of all fees for the current semester
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {child.feeBreakdown.map((fee, index) => {
                      const daysUntilDue = getDaysUntilDue(fee.dueDate)
                      const isOverdue = daysUntilDue < 0
                      const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                      return (
                        <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${
                          isOverdue ? 'border-red-200 bg-red-50' :
                          isDueSoon ? 'border-orange-200 bg-orange-50' :
                          'border-gray-200'
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <IconFileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{fee.category}</h3>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(fee.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold mb-2">${fee.amount}</div>
                            {getStatusBadge(fee.status)}
                            {isOverdue && (
                              <p className="text-xs text-red-600 mt-1">
                                {Math.abs(daysUntilDue)} days overdue
                              </p>
                            )}
                            {isDueSoon && !isOverdue && (
                              <p className="text-xs text-orange-600 mt-1">
                                Due in {daysUntilDue} days
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Complete record of all payments made for {child.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {child.paymentHistory.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">${payment.amount}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <IconReceipt className="mr-1 h-3 w-3" />
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common fee-related tasks for {child.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <IconCreditCard className="h-6 w-6" />
                      <span>Pay Outstanding</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <IconDownload className="h-6 w-6" />
                      <span>Download Invoice</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <IconCalendar className="h-6 w-6" />
                      <span>Payment Plan</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <IconReceipt className="h-6 w-6" />
                      <span>Tax Receipt</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}