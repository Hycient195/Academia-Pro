"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
  IconCircleX,
  IconWifi,
  IconWifiOff,
  IconRefresh
} from "@tabler/icons-react"
import { apis } from "@/redux/api"
import { IAuditLog } from "@academia-pro/types/super-admin"
import { useWebSocket } from "@/hooks/useWebSocket"

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

function AuditLogTable({ logs, pagination, isLoading }: { logs?: IAuditLog[], pagination?: PaginationInfo, isLoading: boolean }) {
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
    status: '',
    search: '',
    page: 1,
    limit: 50
  })

  const { data: auditLogs, isLoading: logsLoading, refetch: refetchLogs, error: logsError } = apis.superAdmin.useGetAuditLogsQuery(filters)
  const { data: auditMetrics, isLoading: metricsLoading, refetch: refetchMetrics, error: metricsError } = apis.superAdmin.useGetAuditMetricsQuery({ period: filters.period })

  const isLoading = logsLoading || metricsLoading
  const hasError = logsError || metricsError

  console.log(auditLogs)
  console.log(auditMetrics)

  // WebSocket integration for real-time updates
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    subscribe,
    onMessage,
    offMessage
  } = useWebSocket({
    namespace: '/audit',
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  // Real-time data state
  const [realTimeLogs, setRealTimeLogs] = useState<IAuditLog[]>([])
  const [realTimeMetrics, setRealTimeMetrics] = useState(auditMetrics)
  const [newEventsCount, setNewEventsCount] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  // WebSocket event handlers
  const handleAuditEvent = useCallback((data: unknown) => {
    try {
      const eventData = data as { event: IAuditLog; timestamp: string; broadcastId: string }
      const newLog: IAuditLog = {
        ...eventData.event,
        timestamp: eventData.timestamp,
        id: eventData.broadcastId,
      } as IAuditLog

      setRealTimeLogs(prev => [newLog, ...prev.slice(0, 49)]) // Keep last 50 events
      setNewEventsCount(prev => prev + 1)
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error('Failed to process audit event:', error)
    }
  }, [])

  const handleMetricsUpdate = useCallback((data: unknown) => {
    try {
      const metricsData = data as {
        metrics: typeof auditMetrics;
        timestamp: string;
        updateId: string;
      }
      setRealTimeMetrics(metricsData.metrics)
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error('Failed to process metrics update:', error)
    }
  }, [auditMetrics])

  // WebSocket connection and subscription management
  useEffect(() => {
    if (isConnected) {
      // Subscribe to audit events
      subscribe({
        eventTypes: ['*'], // All event types
        severities: ['high', 'critical'], // Only high-priority events
        minSeverity: 'medium',
      })

      // Set up event listeners
      onMessage('audit_event', handleAuditEvent)
      onMessage('metrics_update', handleMetricsUpdate)
      onMessage('connected', (data) => {
        console.log('WebSocket connected:', data)
      })
      onMessage('error', (data) => {
        console.error('WebSocket error:', data)
      })
    }

    return () => {
      if (isConnected) {
        offMessage('audit_event', handleAuditEvent)
        offMessage('metrics_update', handleMetricsUpdate)
      }
    }
  }, [isConnected, subscribe, onMessage, offMessage, handleAuditEvent, handleMetricsUpdate])

  // Update real-time metrics when API data changes
  useEffect(() => {
    if (auditMetrics) {
      setRealTimeMetrics(auditMetrics)
    }
  }, [auditMetrics])

  // Function to clear real-time events
  const clearRealTimeEvents = useCallback(() => {
    setRealTimeLogs([])
    setNewEventsCount(0)
  }, [])

  // Retry mechanism
  const handleRetry = () => {
    if (logsError) refetchLogs()
    if (metricsError) refetchMetrics()
  }

  // Export functionality
  const handleExport = async () => {
    try {
      // Create a download link for the export
      const exportUrl = `${process.env.NEXT_PUBLIC_API_URL}/super-admin/audit/export`
      const response = await fetch(exportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          format: 'csv',
          filters: filters
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      // Could show a toast notification here
    }
  }

  // Handle search input with debouncing
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }))
  }, [debouncedSearchTerm])

  // Refresh data function
  const handleRefresh = () => {
    refetchLogs()
    refetchMetrics()
  }

  // Real-time updates with polling
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (autoRefresh) {
      intervalId = setInterval(() => {
        handleRefresh()
      }, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh, refreshInterval])

  // Connection status component
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <IconWifi className="h-4 w-4 text-green-500" />
      ) : isConnecting ? (
        <IconRefresh className="h-4 w-4 text-yellow-500 animate-spin" />
      ) : (
        <IconWifiOff className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">
        {isConnected ? 'Real-time' : isConnecting ? 'Connecting...' : 'Offline'}
      </span>
      {newEventsCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {newEventsCount} new
        </Badge>
      )}
      {lastUpdateTime && (
        <span className="text-xs text-muted-foreground">
          Last update: {lastUpdateTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail of all system activities and user operations
          </p>
          <ConnectionStatus />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={hasError ? handleRetry : handleRefresh} disabled={isLoading}>
            {hasError ? <IconAlertTriangle className="h-4 w-4 mr-2" /> : <IconClock className="h-4 w-4 mr-2" />}
            {hasError ? 'Retry' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <IconDownload className="h-4 w-4 mr-2" />
            Export Logs
          </Button>

          {/* WebSocket controls */}
          <div className="flex items-center space-x-2">
            <Switch
              id="websocket"
              checked={isConnected}
              onCheckedChange={(checked) => {
                if (checked) {
                  connect()
                } else {
                  disconnect()
                }
              }}
            />
            <Label htmlFor="websocket" className="text-sm">Real-time</Label>
          </div>

          {/* Auto-refresh controls */}
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            {autoRefresh && (
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15000">15s</SelectItem>
                  <SelectItem value="30000">30s</SelectItem>
                  <SelectItem value="60000">1m</SelectItem>
                  <SelectItem value="300000">5m</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <IconAlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Failed to load audit data</h3>
              <p className="text-sm text-red-600 mt-1">
                {logsError && 'Failed to load audit logs. '}
                {metricsError && 'Failed to load audit metrics. '}
                Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AuditMetricCard
          title="Total Activities"
          value={realTimeMetrics?.totalActivities || auditMetrics?.totalActivities || 0}
          change={realTimeMetrics?.activitiesGrowth || auditMetrics?.activitiesGrowth}
          changeType="increase"
          icon={IconActivity}
          description="All system activities"
        />
        <AuditMetricCard
          title="Active Users"
          value={realTimeMetrics?.activeUsers || auditMetrics?.activeUsers || 0}
          change={realTimeMetrics?.usersGrowth || auditMetrics?.usersGrowth}
          changeType="increase"
          icon={IconUsers}
          description="Users with recent activity"
        />
        <AuditMetricCard
          title="API Requests"
          value={realTimeMetrics?.apiRequests || auditMetrics?.apiRequests || 0}
          change={realTimeMetrics?.apiGrowth || auditMetrics?.apiGrowth}
          changeType="increase"
          icon={IconServer}
          description="Total API calls made"
        />
        <AuditMetricCard
          title="Security Events"
          value={realTimeMetrics?.securityEvents || auditMetrics?.securityEvents || 0}
          change={realTimeMetrics?.securityGrowth || auditMetrics?.securityGrowth}
          changeType="decrease"
          icon={IconShield}
          description="Security-related activities"
        />
      </div>

      {/* Real-time Events Section */}
      {realTimeLogs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <IconActivity className="h-5 w-5 mr-2" />
                  Real-time Events
                  {newEventsCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {newEventsCount} new
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Live audit events as they occur
                </CardDescription>
              </div>
              {realTimeLogs.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearRealTimeEvents}>
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {realTimeLogs.slice(0, 10).map((log, index) => (
                <div key={`${log.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center space-x-3">
                    <IconCircleCheck className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.userId} • {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    log.status === 'FAILED' ? 'destructive' :
                    log.status === 'WARNING' ? 'secondary' : 'default'
                  }>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
            {realTimeLogs.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                And {realTimeLogs.length - 10} more events...
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
          <AuditLogTable logs={auditLogs?.logs} pagination={auditLogs?.pagination} isLoading={isLoading} />
        </CardContent>

        {/* Pagination Controls */}
        {auditLogs?.pagination && auditLogs.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((auditLogs.pagination.page - 1) * auditLogs.pagination.limit) + 1} to{' '}
              {Math.min(auditLogs.pagination.page * auditLogs.pagination.limit, auditLogs.pagination.total)} of{' '}
              {auditLogs.pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={auditLogs.pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {auditLogs.pagination.page} of {auditLogs.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={auditLogs.pagination.page >= auditLogs.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
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