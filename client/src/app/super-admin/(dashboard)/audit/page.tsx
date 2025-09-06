"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconShield,
  IconUsers,
  IconActivity,
  IconSearch,
  IconFilter,
  IconDownload,
  IconEye,
  IconClock,
  IconUser,
  IconServer,
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX
} from "@tabler/icons-react"
import { apis } from "@/redux/api"
import { IAuditLog } from "@academia-pro/types/super-admin"

function AuditMetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description
}: {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: React.ComponentType<{ className?: string }>
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs mt-1">
            {changeType === 'increase' ? (
              <IconCircleCheck className="h-3 w-3 text-green-500" />
            ) : changeType === 'decrease' ? (
              <IconCircleX className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={changeType === 'increase' ? 'text-green-500' : changeType === 'decrease' ? 'text-red-500' : 'text-muted-foreground'}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground">from last week</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function AuditLogTable({ logs, isLoading }: { logs?: IAuditLog[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Role(s)</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Resource</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs?.map((log, index) => (
          <TableRow key={index}>
            <TableCell className="font-mono text-xs">
              {new Date(log.timestamp).toLocaleString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <IconUser className="h-4 w-4" />
                <span>{log.user}</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">{log.roles?.join(", ")}</TableCell>
            <TableCell>
              <Badge variant={log.actionType === 'CREATE' ? 'default' : log.actionType === 'UPDATE' ? 'secondary' : log.actionType === 'DELETE' ? 'destructive' : 'outline'}>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">{log.resource}</TableCell>
            <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
            <TableCell>
              <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                {log.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <IconEye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )) || (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              No audit logs found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default function AuditPage() {
  const [filters, setFilters] = useState({
    period: '24h',
    user: '',
    action: '',
    status: ''
  })

  const { data: auditLogs, isLoading: logsLoading } = apis.superAdmin.useGetAuditLogsQuery(filters)
  const { data: auditMetrics, isLoading: metricsLoading } = apis.superAdmin.useGetAuditMetricsQuery({ period: filters.period })

  const isLoading = logsLoading || metricsLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail of all system activities and user operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <IconDownload className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Audit Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AuditMetricCard
          title="Total Activities"
          value={auditMetrics?.totalActivities || 0}
          change={auditMetrics?.activitiesGrowth}
          changeType="increase"
          icon={IconActivity}
          description="All system activities"
        />
        <AuditMetricCard
          title="Active Users"
          value={auditMetrics?.activeUsers || 0}
          change={auditMetrics?.usersGrowth}
          changeType="increase"
          icon={IconUsers}
          description="Users with recent activity"
        />
        <AuditMetricCard
          title="API Requests"
          value={auditMetrics?.apiRequests || 0}
          change={auditMetrics?.apiGrowth}
          changeType="increase"
          icon={IconServer}
          description="Total API calls made"
        />
        <AuditMetricCard
          title="Security Events"
          value={auditMetrics?.securityEvents || 0}
          change={auditMetrics?.securityGrowth}
          changeType="decrease"
          icon={IconShield}
          description="Security-related activities"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconFilter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Input
                placeholder="Search by user..."
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="VIEW">View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconActivity className="h-5 w-5 mr-2" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Detailed log of all system activities and user operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={auditLogs?.logs} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconAlertTriangle className="h-5 w-5 mr-2" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { event: "Failed login attempt", user: "john.doe@example.com", time: "2 minutes ago", severity: "medium" },
                { event: "Suspicious API access", user: "admin@school.com", time: "15 minutes ago", severity: "high" },
                { event: "Password changed", user: "jane.smith@school.com", time: "1 hour ago", severity: "low" },
                { event: "Bulk data export", user: "superadmin@academiapro.com", time: "2 hours ago", severity: "low" }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconAlertTriangle className={`h-4 w-4 ${
                      event.severity === 'high' ? 'text-red-500' :
                      event.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{event.event}</p>
                      <p className="text-xs text-muted-foreground">{event.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                    <Badge variant={
                      event.severity === 'high' ? 'destructive' :
                      event.severity === 'medium' ? 'secondary' : 'default'
                    } className="text-xs">
                      {event.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconClock className="h-5 w-5 mr-2" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "User login", count: 245, time: "Last hour" },
                { action: "Data access", count: 189, time: "Last 6 hours" },
                { action: "Configuration changes", count: 23, time: "Last 24 hours" },
                { action: "System backups", count: 12, time: "Last week" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline">{activity.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}