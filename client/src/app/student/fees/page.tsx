import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@tabler/icons-react"

// Sample fee data
const feeStructure = [
  { category: "Tuition Fee", amount: 2500, dueDate: "2024-01-15", status: "paid", paidDate: "2024-01-10" },
  { category: "Library Fee", amount: 100, dueDate: "2024-01-20", status: "paid", paidDate: "2024-01-12" },
  { category: "Lab Fee", amount: 200, dueDate: "2024-01-25", status: "pending", paidDate: null },
  { category: "Sports Fee", amount: 150, dueDate: "2024-02-01", status: "pending", paidDate: null },
  { category: "Transportation", amount: 300, dueDate: "2024-02-05", status: "overdue", paidDate: null },
]

const paymentHistory = [
  { date: "2024-01-10", amount: 2500, method: "Online", reference: "TXN001", status: "successful" },
  { date: "2024-01-12", amount: 100, method: "Cash", reference: "TXN002", status: "successful" },
  { date: "2023-12-15", amount: 2400, method: "Online", reference: "TXN003", status: "successful" },
  { date: "2023-11-10", amount: 2400, method: "Bank Transfer", reference: "TXN004", status: "successful" },
]

const upcomingFees = [
  { category: "Tuition Fee", amount: 2500, dueDate: "2024-02-15", priority: "high" },
  { category: "Exam Fee", amount: 300, dueDate: "2024-02-20", priority: "medium" },
  { category: "Activity Fee", amount: 200, dueDate: "2024-03-01", priority: "low" },
]

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

const getPriorityBadge = (priority: string) => {
  const variants = {
    "high": "bg-red-100 text-red-800",
    "medium": "bg-yellow-100 text-yellow-800",
    "low": "bg-green-100 text-green-800",
  }
  return (
    <Badge className={variants[priority as keyof typeof variants]}>
      {priority.charAt(0).toUpperCase()} Priority
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

export default function FeesPage() {
  const totalPaid = feeStructure.filter(f => f.status === "paid").reduce((sum, fee) => sum + fee.amount, 0)
  const totalPending = feeStructure.filter(f => f.status === "pending").reduce((sum, fee) => sum + fee.amount, 0)
  const totalOverdue = feeStructure.filter(f => f.status === "overdue").reduce((sum, fee) => sum + fee.amount, 0)
  const totalFees = feeStructure.reduce((sum, fee) => sum + fee.amount, 0)

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fees</h1>
            <p className="text-muted-foreground">
              Manage your fee payments and view payment history
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button>
              <IconCreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          </div>
        </div>

        {/* Fee Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPaid}</div>
              <p className="text-xs text-muted-foreground">
                This semester
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Due</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$200</div>
              <p className="text-xs text-muted-foreground">
                Due in 3 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fee Management Tabs */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Fees</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Semester Fee Structure</CardTitle>
                <CardDescription>
                  Overview of all fees for the current semester
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeStructure.map((fee, index) => {
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
                              {fee.paidDate && ` • Paid: ${new Date(fee.paidDate).toLocaleDateString()}`}
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

                {/* Payment Progress */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Payment Progress</span>
                    <span className="text-sm text-muted-foreground">
                      ${totalPaid} of ${totalFees} paid
                    </span>
                  </div>
                  <Progress value={(totalPaid / totalFees) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {((totalPaid / totalFees) * 100).toFixed(1)}% of semester fees paid
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Fee Payments</CardTitle>
                <CardDescription>
                  Fees due in the coming weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingFees.map((fee, index) => {
                    const daysUntilDue = getDaysUntilDue(fee.dueDate)
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <IconCalendar className="h-6 w-6 text-blue-600" />
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
                          {getPriorityBadge(fee.priority)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : 'Overdue'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Complete record of all your fee payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentHistory.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <IconCircleCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">${payment.amount} Payment</h3>
                          <p className="text-sm text-muted-foreground">
                            {payment.method} • Ref: {payment.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-2">
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <IconReceipt className="mr-1 h-3 w-3" />
                          Receipt
                        </Button>
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