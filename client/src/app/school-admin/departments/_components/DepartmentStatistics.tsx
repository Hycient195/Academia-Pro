import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { IDepartmentStatistics } from '@academia-pro/types/school-admin';

interface DepartmentStatisticsProps {
  stats?: IDepartmentStatistics;
}

export function DepartmentStatistics({ stats }: DepartmentStatisticsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topDepartments = stats.departmentsWithMostStaff?.slice(0, 3);

  console.log('Department Statistics:', stats);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Departments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDepartments}</div>
          <p className="text-xs text-muted-foreground">
            Active departments
          </p>
        </CardContent>
      </Card>

      {/* Average Staff per Department */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Staff/Dept</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageStaffPerDepartment}</div>
          <p className="text-xs text-muted-foreground">
            Staff distribution
          </p>
        </CardContent>
      </Card>

      {/* Department Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Department Types</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(stats.departmentsByType).length}</div>
          <p className="text-xs text-muted-foreground">
            Different categories
          </p>
        </CardContent>
      </Card>

      {/* Top Department */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Department</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topDepartments[0]?.staffCount || 0}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {topDepartments[0]?.departmentName || 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}