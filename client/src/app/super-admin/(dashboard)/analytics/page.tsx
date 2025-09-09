"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBuilding,
  IconSchool,
  IconActivity,
  IconCurrencyDollar,
  IconCalendar
} from "@tabler/icons-react"
import { apis } from "@/redux/api"

function MetricCard({
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
              <IconTrendingUp className="h-3 w-3 text-green-500" />
            ) : changeType === 'decrease' ? (
              <IconTrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={changeType === 'increase' ? 'text-green-500' : changeType === 'decrease' ? 'text-red-500' : 'text-muted-foreground'}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function ChartPlaceholder({ title, height = "h-64" }: { title: string; height?: string }) {
  return (
    <Card className="!px-3 py-4 !gap-3">
      <CardHeader className="!px-1">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="!px-1">
        <div className={`${height} bg-muted rounded-lg flex items-center justify-center`}>
          <p className="text-muted-foreground">Chart visualization coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')

  const { data: analytics, isLoading: analyticsLoading } = apis.superAdmin.useGetSystemAnalyticsQuery({ period })
  const { data: metrics, isLoading: metricsLoading } = apis.superAdmin.useGetSystemMetricsQuery()

  const isLoading = analyticsLoading || metricsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for system performance and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <IconCalendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Schools"
          value={analytics?.schools?.total || 0}
          change={analytics?.schools?.growth}
          changeType="increase"
          icon={IconBuilding}
          description="Active educational institutions"
        />
        <MetricCard
          title="Total Users"
          value={analytics?.users?.total || 0}
          change={analytics?.users?.growth}
          changeType="increase"
          icon={IconUsers}
          description="Registered system users"
        />
        <MetricCard
          title="Active Schools"
          value={analytics?.schools?.active || 0}
          change={analytics?.schools?.growth}
          changeType="increase"
          icon={IconSchool}
          description="Currently active schools"
        />
        <MetricCard
          title="Revenue"
          value={`$${(analytics?.revenue?.total || 0).toLocaleString()}`}
          change={analytics?.revenue?.growth}
          changeType="increase"
          icon={IconCurrencyDollar}
          description="Total subscription revenue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartPlaceholder title="User Growth Trend" />
        <ChartPlaceholder title="Revenue Analytics" />
        <ChartPlaceholder title="School Distribution by Type" />
        <ChartPlaceholder title="System Performance Metrics" />
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconActivity className="h-5 w-5 mr-2" />
            System Performance
          </CardTitle>
          <CardDescription>
            Real-time system performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <Badge variant="default">{metrics?.uptime || 0}%</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${metrics?.uptime || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm text-muted-foreground">{metrics?.responseTime || 0}ms</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics?.responseTime || 0) / 10, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-muted-foreground">{metrics?.errorRate || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${metrics?.errorRate || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-sm text-muted-foreground">{metrics?.activeUsers || 0}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics?.activeUsers || 0) / 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Springfield Elementary", students: 450, growth: 12 },
                { name: "Riverside High School", students: 320, growth: 8 },
                { name: "Oakwood Academy", students: 280, growth: 15 }
              ].map((school, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{school.name}</p>
                    <p className="text-xs text-muted-foreground">{school.students} students</p>
                  </div>
                  <Badge variant="secondary">+{school.growth}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { metric: "Daily Active Users", value: "2,450", change: 5 },
                { metric: "Session Duration", value: "24m 32s", change: -2 },
                { metric: "Feature Adoption", value: "78%", change: 12 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.metric}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                  <div className={`text-xs ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { plan: "Basic", count: 45, percentage: 60 },
                { plan: "Premium", count: 22, percentage: 29 },
                { plan: "Enterprise", count: 8, percentage: 11 }
              ].map((plan, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{plan.plan}</span>
                    <span className="text-sm text-muted-foreground">{plan.count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${plan.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}