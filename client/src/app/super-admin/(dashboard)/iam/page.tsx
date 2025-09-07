"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconTrash, IconKey, IconShield, IconUsers } from "@tabler/icons-react"
import { apis } from "@/redux/api"
import { CreateDelegatedAccountModal } from "./_components/CreateDelegatedAccountModal"

interface Permission {
  id: string
  name: string
  description: string
}

interface DelegatedAccount {
  id: string
  email: string
  permissions: string[]
  expiryDate: string
  status: 'active' | 'expired' | 'revoked'
  createdAt: string
  notes?: string
}

const defaultPermissions: Permission[] = [
  // School Management
  { id: '1', name: 'schools:create', description: 'Create new schools' },
  { id: '2', name: 'schools:read', description: 'View schools' },
  { id: '3', name: 'schools:update', description: 'Update school information' },
  { id: '4', name: 'schools:delete', description: 'Delete schools' },
  { id: '5', name: 'schools:manage', description: 'Full school management' },

  // User Management
  { id: '6', name: 'users:create', description: 'Create new users' },
  { id: '7', name: 'users:read', description: 'View users' },
  { id: '8', name: 'users:update', description: 'Update user information' },
  { id: '9', name: 'users:delete', description: 'Delete users' },
  { id: '10', name: 'users:manage', description: 'Full user management' },
  { id: '11', name: 'users:reset-password', description: 'Reset user passwords' },
  { id: '12', name: 'users:deactivate', description: 'Deactivate user accounts' },

  // Analytics & Reporting
  { id: '13', name: 'analytics:read', description: 'View analytics and reports' },
  { id: '14', name: 'analytics:export', description: 'Export analytics data' },
  { id: '15', name: 'reports:generate', description: 'Generate custom reports' },
  { id: '16', name: 'reports:view', description: 'View system reports' },

  // Audit & Compliance
  { id: '17', name: 'audit:read', description: 'View audit logs' },
  { id: '18', name: 'audit:export', description: 'Export audit logs' },
  { id: '19', name: 'compliance:read', description: 'View compliance reports' },
  { id: '20', name: 'compliance:manage', description: 'Manage compliance settings' },

  // System Administration
  { id: '21', name: 'system:read', description: 'View system health and metrics' },
  { id: '22', name: 'system:update', description: 'Update system configuration' },
  { id: '23', name: 'system:backup', description: 'Create system backups' },
  { id: '24', name: 'system:restore', description: 'Restore system from backup' },

  // Settings Management
  { id: '25', name: 'settings:read', description: 'View system settings' },
  { id: '26', name: 'settings:update', description: 'Update system settings' },
  { id: '27', name: 'settings:manage', description: 'Full settings management' },

  // Financial Management
  { id: '28', name: 'finance:read', description: 'View financial data' },
  { id: '29', name: 'finance:update', description: 'Update financial records' },
  { id: '30', name: 'finance:manage', description: 'Full financial management' },
  { id: '31', name: 'billing:read', description: 'View billing information' },
  { id: '32', name: 'billing:update', description: 'Update billing settings' },

  // Communication
  { id: '33', name: 'communication:read', description: 'View communications' },
  { id: '34', name: 'communication:send', description: 'Send communications' },
  { id: '35', name: 'communication:manage', description: 'Manage communication settings' },

  // Security
  { id: '36', name: 'security:read', description: 'View security settings' },
  { id: '37', name: 'security:update', description: 'Update security configurations' },
  { id: '38', name: 'security:manage', description: 'Full security management' },

  // Academic Management
  { id: '39', name: 'academic:read', description: 'View academic data' },
  { id: '40', name: 'academic:update', description: 'Update academic records' },
  { id: '41', name: 'academic:manage', description: 'Full academic management' },

  // Staff Management
  { id: '42', name: 'staff:read', description: 'View staff information' },
  { id: '43', name: 'staff:update', description: 'Update staff records' },
  { id: '44', name: 'staff:manage', description: 'Full staff management' },

  // Student Management
  { id: '45', name: 'students:read', description: 'View student information' },
  { id: '46', name: 'students:update', description: 'Update student records' },
  { id: '47', name: 'students:manage', description: 'Full student management' },
]

export default function IAMPage() {
  const { data: delegatedAccounts, isLoading } = apis.superAdmin.useGetDelegatedAccountsQuery()
  const [revokeDelegatedAccount] = apis.superAdmin.useRevokeDelegatedAccountMutation()

  const handleRevokeAccount = async (accountId: string) => {
    try {
      await revokeDelegatedAccount(accountId).unwrap()
    } catch (error) {
      console.error("Failed to revoke account:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'expired':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expired</Badge>
      case 'revoked':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Identity & Access Management</h2>
        <div className="flex items-center space-x-2">
          <CreateDelegatedAccountModal defaultPermissions={defaultPermissions} />
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Delegated Accounts</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconUsers className="mr-2 h-5 w-5" />
                Delegated Accounts
              </CardTitle>
              <CardDescription>
                Manage delegated accounts with limited permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delegatedAccounts?.map((account: DelegatedAccount) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {account.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {account.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{account.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {account.expiryDate ? new Date(account.expiryDate).toLocaleDateString() : 'Never expires'}
                        </TableCell>
                        <TableCell>{getStatusBadge(account.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeAccount(account.id)}
                              disabled={account.status === 'revoked'}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconKey className="mr-2 h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>
                Available permissions that can be assigned to delegated accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {defaultPermissions.map((permission) => (
                  <Card key={permission.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {permission.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconShield className="mr-2 h-5 w-5" />
                Roles
              </CardTitle>
              <CardDescription>
                Predefined roles with specific permission sets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Roles feature coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}