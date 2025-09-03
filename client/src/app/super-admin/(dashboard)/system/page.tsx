"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconActivity,
  IconAlertTriangle,
  IconCircleCheck,
  IconServer,
  IconDatabase,
  IconWifi,
  IconShield,
  IconClock,
  IconRefresh
} from "@tabler/icons-react"
import { useGetSystemHealthQuery, useGetSystemAlertsQuery, useAcknowledgeAlertMutation } from "@/store/api/superAdminApi"

function HealthStatusCard({
  title,
  status,
  value,
  icon: Icon,
  description
}: {
  title: string
  status: 'healthy' | 'warning' | 'critical'
  value?: string | number
  icon: React.ComponentType<{ className?: string }>
  description?: string
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <IconCircleCheck className="h-5 w-5 text-green-500" />
      case 'warning':
        return <IconAlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical':
        return <IconAlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <IconActivity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <div>
            <div className={`text-sm font-medium ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            {value && <div className="text-xs text-muted-foreground">{value}</div>}
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function SystemMetric({
  label,
  value,
  unit,
  status,
  threshold
}: {
  label: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  threshold?: { warning: number; critical: number }
}) {
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'critical':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{value}{unit}</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getProgressColor(status)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {threshold && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Warning: {threshold.warning}{unit}</span>
          <span>Critical: {threshold.critical}{unit}</span>
        </div>
      )}
    </div>
  )
}

export default function SystemPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useGetSystemHealthQuery()
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useGetSystemAlertsQuery({ acknowledged: false })
  const [acknowledgeAlert] = useAcknowledgeAlertMutation()

  const handleRefresh = () => {
    refetchHealth()
    refetchAlerts()
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId)
      refetchAlerts()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  if (healthLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system performance, health, and alerts in real-time
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <HealthStatusCard
              title="System Status"
              status={healthData?.overallStatus || 'healthy'}
              value="99.9% uptime"
              icon={IconActivity}
              description="Overall system health"
            />
            <HealthStatusCard
              title="Database"
              status={healthData?.database?.status || 'healthy'}
              value={healthData?.database?.responseTime || 0}
              icon={IconDatabase}
              description="Database connectivity"
            />
            <HealthStatusCard
              title="API Services"
              status={healthData?.api?.status || 'healthy'}
              value={`${healthData?.api?.responseTime || 0}ms`}
              icon={IconServer}
              description="API response time"
            />
            <HealthStatusCard
              title="Network"
              status={healthData?.network?.status || 'healthy'}
              value={healthData?.network?.latency || 0}
              icon={IconWifi}
              description="Network connectivity"
            />
          </div>

          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>Real-time system performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SystemMetric
                label="CPU Usage"
                value={healthData?.cpu?.usage || 0}
                unit="%"
                status={healthData?.cpu?.usage > 80 ? 'critical' : healthData?.cpu?.usage > 60 ? 'warning' : 'normal'}
                threshold={{ warning: 60, critical: 80 }}
              />
              <SystemMetric
                label="Memory Usage"
                value={healthData?.memory?.usage || 0}
                unit="%"
                status={healthData?.memory?.usage > 85 ? 'critical' : healthData?.memory?.usage > 70 ? 'warning' : 'normal'}
                threshold={{ warning: 70, critical: 85 }}
              />
              <SystemMetric
                label="Disk Usage"
                value={healthData?.disk?.usage || 0}
                unit="%"
                status={healthData?.disk?.usage > 90 ? 'critical' : healthData?.disk?.usage > 75 ? 'warning' : 'normal'}
                threshold={{ warning: 75, critical: 90 }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <span className="text-sm font-medium">{healthData?.performance?.avgResponseTime || 0}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requests per Minute</span>
                  <span className="text-sm font-medium">{healthData?.performance?.requestsPerMinute || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="text-sm font-medium">{healthData?.performance?.errorRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Connections</span>
                  <span className="text-sm font-medium">{healthData?.performance?.activeConnections || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Cores</span>
                    <span>{healthData?.resources?.cpuCores || 0}</span>
                  </div>
                  <Progress value={healthData?.resources?.cpuUsage || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span>{healthData?.resources?.memoryUsage || 0}GB / {healthData?.resources?.totalMemory || 0}GB</span>
                  </div>
                  <Progress value={(healthData?.resources?.memoryUsage || 0) / (healthData?.resources?.totalMemory || 1) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>{healthData?.resources?.storageUsage || 0}GB / {healthData?.resources?.totalStorage || 0}GB</span>
                  </div>
                  <Progress value={(healthData?.resources?.storageUsage || 0) / (healthData?.resources?.totalStorage || 1) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>System alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <IconAlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{alert.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'default' : 'secondary'}>
                                  {alert.priority}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAcknowledgeAlert(alert.id)}
                                >
                                  Acknowledge
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IconCircleCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No active alerts</h3>
                  <p className="text-muted-foreground">All systems are running normally</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconServer className="h-5 w-5 mr-2" />
                  Web Server
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge variant="default">Running</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>99.9%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Version</span>
                    <span>v2.1.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconDatabase className="h-5 w-5 mr-2" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connections</span>
                    <span>45/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Version</span>
                    <span>PostgreSQL 15</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconShield className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Firewall</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SSL/TLS</span>
                    <Badge variant="default">Valid</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Scan</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}