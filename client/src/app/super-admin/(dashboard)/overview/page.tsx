"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconBuilding,
  IconUsers,
  IconSchool,
  IconActivity,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconMapPin
} from "@tabler/icons-react"
import { apis } from "@/redux/api"
import { IAlert } from "@academia-pro/types/shared"
import { IActivity } from "@academia-pro/types/parent-portal"

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center space-x-1 text-xs">
            {trend === 'up' ? (
              <IconTrendingUp className="h-3 w-3 text-green-500" />
            ) : trend === 'down' ? (
              <IconTrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
              {trendValue > 0 ? '+' : ''}{trendValue}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: IActivity }) {
  return (
    <div className="flex items-center space-x-4 p-3 border rounded-lg">
      <div className="flex-shrink-0">
        <IconActivity className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.description}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
      {activity.studentId && (
        <Badge variant="outline" className="text-xs">
          Student {activity.studentId}
        </Badge>
      )}
    </div>
  )
}

function AlertItem({ alert }: { alert: IAlert }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <IconAlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <IconCircleCheck className="h-4 w-4 text-blue-500" />
      default:
        return <IconAlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="mb-2">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <h4 className="text-sm font-medium">{alert.title}</h4>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SuperAdminDashboard() {
  const { data: overview, isLoading: overviewLoading } = apis.superAdmin.useGetSystemOverviewQuery()
  const activities = overview?.recentActivities?.slice(0, 5) || []
  const alerts = overview?.alerts?.filter(alert => !alert.acknowledgedAt) || []
  const activitiesLoading = overviewLoading
  const alertsLoading = overviewLoading

  if (overviewLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <IconClock className="h-4 w-4 mr-2" />
            Last updated: {new Date().toLocaleTimeString()}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Schools"
          value={overview?.totalSchools || 0}
          description="Active educational institutions"
          icon={IconBuilding}
          trend="up"
          trendValue={overview?.schoolsGrowth}
        />
        <MetricCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          description="Registered system users"
          icon={IconUsers}
          trend="up"
          trendValue={overview?.usersGrowth}
        />
        <MetricCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          description="Enrolled students across schools"
          icon={IconSchool}
          trend="up"
          trendValue={overview?.studentsGrowth}
        />
        <MetricCard
          title="System Health"
          value={`${overview?.systemHealthScore || 0}%`}
          description="Overall system performance"
          icon={IconActivity}
          trend={overview?.healthTrend && overview.healthTrend > 0 ? 'up' : 'down'}
          trendValue={overview?.healthTrend}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities</p>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Active system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
                {alerts.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View all alerts ({alerts.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <IconCircleCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconMapPin className="h-5 w-5 mr-2" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Schools distribution across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Map visualization coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}