"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import apis from "@/redux/api"
import { IAuditLog, TAuditActionType, TAuditStatus, IAuditMetrics } from "@academia-pro/types/super-admin"
import { useWebSocket } from "@/hooks/useWebSocket"
import { FormSchoolSelect } from "@/components/ui/form/FormSchoolSelect"
import { FormUserSelect } from "@/components/ui/form/FormUserSelect"
import { FormDateInput, FormSelect, FormText } from "@/components/ui/form/form-components"

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
          <TableHead>Severity</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs?.map((log, index) => (
          <TableRow key={log.id || index}>
            <TableCell className="font-mono text-xs">
              {new Date(log.timestamp).toLocaleString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <IconUser className="h-4 w-4" />
                <span>
                  {typeof log.user === 'string'
                    ? log.user
                    : log.user?.fullName || log.user?.email || 'Unknown User'
                  }
                </span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {typeof log.user === 'string'
                ? log.roles?.join(", ") || 'N/A'
                : log.user?.roles?.join(", ") || 'N/A'
              }
            </TableCell>
            <TableCell>
              <Badge variant={
                log.action?.includes('CREATE') ? 'default' :
                log.action?.includes('UPDATE') ? 'secondary' :
                log.action?.includes('DELETE') ? 'destructive' :
                'outline'
              }>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">{log.resource}</TableCell>
            <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
            <TableCell>
              <Badge variant={
                log.severity === 'critical' ? 'destructive' :
                log.severity === 'high' ? 'destructive' :
                log.severity === 'medium' ? 'secondary' :
                'default'
              }>
                {log.severity?.toUpperCase() || 'LOW'}
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
            <TableCell colSpan={8} className="text-center text-muted-foreground">
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
    userId: '',
    schoolId: '',
    resource: '',
    resourceId: '',
    action: '',
    severity: '',
    startDate: '',
    endDate: '',
    period: '24h',
    ipAddress: '',
    searchTerm: '',
    page: 1,
    limit: 50
  })

  // Clean filters to remove empty values and format dates properly
  const cleanFilters = Object.fromEntries(
    Object.entries(filters)
      .filter(([key, value]) => {
        if (typeof value === 'string') {
          return value.trim() !== '';
        }
        return value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        // Format dates to ISO strings if they are date fields
        if ((key === 'startDate' || key === 'endDate') && value) {
          try {
            const date = new Date(value as string);
            if (!isNaN(date.getTime())) {
              return [key, date.toISOString()];
            }
          } catch (error) {
            console.warn(`Invalid date format for ${key}:`, value);
            return [key, value];
          }
        }
        return [key, value];
      })
  );

  const { data: auditLogs, isLoading: logsLoading, refetch: refetchLogs, error: logsError } = apis.superAdmin.audit.useGetAuditLogsQuery(cleanFilters)
  const { data: auditMetrics, isLoading: metricsLoading, refetch: refetchMetrics, error: metricsError } = apis.superAdmin.audit.useGetAuditMetricsQuery({ period: filters.period })
  const { data: securityEvents, isLoading: securityEventsLoading, refetch: refetchSecurityEvents } = apis.superAdmin.audit.useGetSecurityEventsQuery({ period: filters.period })
  // const { data: activityTimeline, isLoading: activityTimelineLoading, refetch: refetchActivityTimeline } = apis.superAdmin.useGetActivityTimelineQuery({ period: filters.period })

  console.log(securityEvents)
  const isLoading = logsLoading || metricsLoading
  const hasError = logsError || metricsError

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
  const [realTimeMetrics, setRealTimeMetrics] = useState<IAuditMetrics | null>(null)
  const [newEventsCount, setNewEventsCount] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  // Define proper types for WebSocket audit events
  interface AuditEventData {
    userId: string;
    user?: {
      fullName?: string;
      email?: string;
      roles?: string[];
    };
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
  }

  interface WebSocketAuditEvent {
    event: AuditEventData;
    timestamp: string;
    broadcastId: string;
  }

  // WebSocket event handlers
  const handleAuditEvent = useCallback((data: unknown) => {
    try {
      console.log('🔥 Received audit event:', data)
      const eventData = data as WebSocketAuditEvent

      // Transform backend audit log format to frontend format
      const newLog: IAuditLog = {
        id: eventData.broadcastId,
        userId: eventData.event.userId,
        user: eventData.event.user ? {
          id: eventData.event.userId,
          email: eventData.event.user.email || '',
          firstName: '', // Not available in WebSocket data
          lastName: '', // Not available in WebSocket data
          middleName: undefined, // Not available in WebSocket data
          roles: eventData.event.user.roles || [],
          fullName: eventData.event.user.fullName
        } : eventData.event.userId, // Fallback to userId as string
        roles: eventData.event.user?.roles || [],
        action: eventData.event.action,
        actionType: eventData.event.action?.includes('created') ? TAuditActionType.CREATE :
                    eventData.event.action?.includes('updated') ? TAuditActionType.UPDATE :
                    eventData.event.action?.includes('deleted') ? TAuditActionType.DELETE : TAuditActionType.VIEW,
        resource: eventData.event.resource,
        resourceId: eventData.event.resourceId,
        ipAddress: eventData.event.ipAddress,
        status: TAuditStatus.SUCCESS, // Default status
        timestamp: eventData.timestamp,
        resourceType: 'api', // Default resource type
      }

      console.log('📝 Processed audit log:', newLog)
      setRealTimeLogs(prev => [newLog, ...prev.slice(0, 49)]) // Keep last 50 events
      setNewEventsCount(prev => prev + 1)
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error('❌ Failed to process audit event:', error)
    }
  }, [])

  const handleMetricsUpdate = useCallback((data: unknown) => {
    try {
      console.log('📊 Received metrics update:', data)
      const metricsData = data as {
        metrics: IAuditMetrics;
        timestamp: string;
        updateId: string;
      }
      setRealTimeMetrics(metricsData.metrics)
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error('❌ Failed to process metrics update:', error)
    }
  }, [])

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
    if (securityEvents) refetchSecurityEvents()
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
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearchTerm }))
  }, [debouncedSearchTerm])

  // Refresh data function
  const handleRefresh = () => {
    refetchLogs()
    refetchMetrics()
    refetchSecurityEvents()
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
    <div className="space-y-4">
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
      {/* <Card>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <FormSelect
              labelText="Time Period"
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e?.target?.value as string }))}
              options={[ { text: "Last hour", value: "1h" },{ text: "Last 24 hours", value: "24h" },{ text: "Last 7 days", value: "7d" },{ text: "Last 30 days", value: "30d" }, ]}
            />
             <FormUserSelect
              placeholder="Search by user ID..."
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            />
            <FormSchoolSelect
              placeholder="Filter by school..."
              value={filters.schoolId}
              onChange={(e) => setFilters(prev => ({ ...prev, schoolId: e.target.value }))}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Input
                placeholder="Filter by resource..."
                value={filters.resource}
                onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
              />
            </div>
            <FormSelect
              labelText="Action"
              placeholder="All actions"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e?.target?.value as string }))}
              options={[ { text: "Login", value: "LOGIN" },{ text: "Logout", value: "LOGOUT" },{ text: "Create", value: "CREATE" },{ text: "Update", value: "UPDATE" },{ text: "Delete", value: "DELETE" },{ text: "View", value: "VIEW" }, ]}
            />
            <FormSelect
              labelText="Severity"
              placeholder="All Severities"
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e?.target?.value as string }))}
              options={[ { text: "Low", value: "low" },{ text: "Medium", value: "medium" },{ text: "High", value: "high" },{ text: "Critical", value: "critical" } ]}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <FormText
              labelText="IP Address"
              placeholder="Filter by IP..."
              value={filters.ipAddress}
              onChange={(e) => setFilters(prev => ({ ...prev, ipAddress: e.target.value as string }))}
            />
            <FormDateInput
              labelText="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value as string }))}
            />
            <FormDateInput
              labelText="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value as string }))}
            />
            <FormText
              labelText="Search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value as string)}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconActivity className="h-5 w-5 mr-2" />
            Audit Logs
          </CardTitle>
          <CardDescription className="w-full gap-3 flex justify-between">
            Detailed log of all system activities and user operations
            <button className="text-active flex flex-row items-center rounded-md hover:"><IconFilter className="h-5 w-5 mr-2" />Filters</button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <FormSelect
              labelText="Time Period"
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e?.target?.value as string }))}
              options={[ { text: "Last hour", value: "1h" },{ text: "Last 24 hours", value: "24h" },{ text: "Last 7 days", value: "7d" },{ text: "Last 30 days", value: "30d" }, ]}
            />
             <FormUserSelect
              placeholder="Search by user ID..."
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            />
            <FormSchoolSelect
              placeholder="Filter by school..."
              value={filters.schoolId}
              onChange={(e) => setFilters(prev => ({ ...prev, schoolId: e.target.value }))}
            />
            <FormText
              labelText="Resource"
              placeholder="Filter by resource..."
              value={filters.resource}
              onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value as string }))}
            />
            <FormSelect
              labelText="Action"
              placeholder="All actions"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e?.target?.value as string }))}
              options={[ { text: "Login", value: "LOGIN" },{ text: "Logout", value: "LOGOUT" },{ text: "Create", value: "CREATE" },{ text: "Update", value: "UPDATE" },{ text: "Delete", value: "DELETE" },{ text: "View", value: "VIEW" }, ]}
            />
            <FormSelect
              labelText="Severity"
              placeholder="All Severities"
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e?.target?.value as string }))}
              options={[ { text: "Low", value: "low" },{ text: "Medium", value: "medium" },{ text: "High", value: "high" },{ text: "Critical", value: "critical" } ]}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <FormText
              labelText="IP Address"
              placeholder="Filter by IP..."
              value={filters.ipAddress}
              onChange={(e) => setFilters(prev => ({ ...prev, ipAddress: e.target.value as string }))}
            />
            <FormDateInput
              labelText="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value as string }))}
            />
            <FormDateInput
              labelText="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value as string }))}
            />
            <FormText
              labelText="Search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value as string)}
            />
          </div>
        </CardContent>
        <CardContent>
          <AuditLogTable logs={auditLogs?.data} pagination={auditLogs?.pagination} isLoading={isLoading} />
        </CardContent>

        {/* Pagination Controls */}
        {auditLogs && auditLogs.pagination.totalPages > 1 && (
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconAlertTriangle className="h-5 w-5 mr-2" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {securityEventsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : securityEvents?.data && securityEvents.data.length > 0 ? (
              <div className="space-y-4">
                {securityEvents.data.map((event, index) => (
                  <div key={event.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconAlertTriangle className={`h-4 w-4 ${
                        event.severity === 'high' || event.severity === 'critical' ? 'text-red-500' :
                        event.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground">{event.userId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</p>
                      <Badge variant={
                        event.severity === 'high' || event.severity === 'critical' ? 'destructive' :
                        event.severity === 'medium' ? 'secondary' : 'default'
                      } className="text-xs">
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <IconAlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security events found</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}