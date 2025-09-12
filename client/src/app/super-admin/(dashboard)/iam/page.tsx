"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconTrash, IconKey, IconShield, IconUsers, IconEdit, IconPlayerPause, IconPlayerPlay, IconSearch } from "@tabler/icons-react"
import apis from "@/redux/api"
import type { IRole } from '@academia-pro/types/super-admin'
import { CreateDelegatedAccountModal } from "./_components/CreateDelegatedAccountModal"
import { EditDelegatedAccountModal } from "./_components/EditDelegatedAccountModal"
import { CreateRoleModal } from "./_components/CreateRoleModal"
import { EditRoleModal } from "./_components/EditRoleModal"
import { DeleteRoleModal } from "./_components/DeleteRoleModal"
import { useState, useMemo } from "react"
import { SuspendConfirmationModal } from "./_components/SuspendConfirmationModal"
import { DeleteConfirmationModal } from "./_components/DeleteConfirmationModal"
import { FormText } from "@/components/ui/form/form-components"

interface Permission {
  id: string
  name: string
  description: string
}

interface DelegatedAccount {
  id: string
  email: string
  permissions: string[]
  startDate?: string
  expiryDate?: string
  status: 'active' | 'inactive' | 'suspended' | 'expired' | 'revoked'
  createdAt: string
  notes?: string
}

interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
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
  const { data: delegatedAccounts, isLoading, refetch } = apis.superAdmin.iam.useGetDelegatedAccountsQuery({})
  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = apis.superAdmin.iam.useGetRolesQuery({})
  const { data: permissions } = apis.superAdmin.iam.useGetPermissionsQuery()

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; account: DelegatedAccount | null }>({
    isOpen: false,
    account: null
  })
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; account: DelegatedAccount | null }>({
    isOpen: false,
    account: null
  })
  const [editModal, setEditModal] = useState<{ isOpen: boolean; account: DelegatedAccount | null }>({
    isOpen: false,
    account: null
  })

  // Role modal states
  const [editRoleModal, setEditRoleModal] = useState<{ isOpen: boolean; role: IRole | null }>({
    isOpen: false,
    role: null
  })
  const [deleteRoleModal, setDeleteRoleModal] = useState<{ isOpen: boolean; role: IRole | null }>({
    isOpen: false,
    role: null
  })

  // Search states
  const [permissionsSearchTerm, setPermissionsSearchTerm] = useState("")

  // Filter permissions based on search term
  const filteredPermissions = useMemo(() => {
    return defaultPermissions.filter(permission =>
      permission.name.toLowerCase().includes(permissionsSearchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(permissionsSearchTerm.toLowerCase())
    )
  }, [permissionsSearchTerm])

  const openDeleteModal = (account: DelegatedAccount) => {
    setDeleteModal({ isOpen: true, account })
  }

  const openSuspendModal = (account: DelegatedAccount) => {
    setSuspendModal({ isOpen: true, account })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, account: null })
    refetch()
  }

  const closeSuspendModal = () => {
    setSuspendModal({ isOpen: false, account: null })
    refetch()
  }

  const openEditModal = (account: DelegatedAccount) => {
    setEditModal({ isOpen: true, account })
  }

  const closeEditModal = () => {
    setEditModal({ isOpen: false, account: null })
    refetch()
  }

  const openEditRoleModal = (role: IRole) => {
    setEditRoleModal({ isOpen: true, role })
  }

  const closeEditRoleModal = () => {
    setEditRoleModal({ isOpen: false, role: null })
    refetchRoles()
  }

  const openDeleteRoleModal = (role: IRole) => {
    setDeleteRoleModal({ isOpen: true, role })
  }

  const closeDeleteRoleModal = () => {
    setDeleteRoleModal({ isOpen: false, role: null })
    refetchRoles()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Inactive</Badge>
      case 'suspended':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Suspended</Badge>
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
                    {delegatedAccounts?.data?.map((account: DelegatedAccount) => (
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
                              onClick={() => openSuspendModal(account)}
                              disabled={account.status === 'revoked' || account.status === 'expired'}
                            >
                              {account.status === 'suspended' ? (
                                <IconPlayerPlay className="h-4 w-4" />
                              ) : (
                                <IconPlayerPause className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(account)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(account)}
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
              {/* Search Input */}
              <div className="relative mb-6">
                <FormText
                  labelText=""
                  placeholder="Search permissions..."
                  value={permissionsSearchTerm}
                  onChange={(e) => setPermissionsSearchTerm(String(e.target.value))}
                  className="pl-10"
                />
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPermissions.map((permission) => (
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

              {filteredPermissions.length === 0 && permissionsSearchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  No permissions found matching {`"${permissionsSearchTerm}"`}
                </div>
              )}
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
              <div className="flex items-center justify-between mb-6">
                <div></div>
                <CreateRoleModal
                  defaultPermissions={permissions?.data || []}
                  onRoleCreated={refetchRoles}
                />
              </div>

              {rolesLoading ? (
                <div className="text-center py-4">Loading roles...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles?.data?.map((role: IRole) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || 'No description'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission.id} variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditRoleModal(role)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteRoleModal(role)}
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

              {roles?.data && roles.data.length === 0 && !rolesLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No roles found. Create your first role to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        accountId={deleteModal.account?.id || ''}
        accountEmail={deleteModal.account?.email || ''}
      />

      <SuspendConfirmationModal
        isOpen={suspendModal.isOpen}
        onClose={closeSuspendModal}
        accountId={suspendModal.account?.id || ''}
        accountEmail={suspendModal.account?.email || ''}
        isCurrentlySuspended={suspendModal.account?.status === 'suspended'}
      />

      <EditDelegatedAccountModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        account={editModal.account}
        availablePermissions={defaultPermissions}
      />

      <EditRoleModal
         isOpen={editRoleModal.isOpen}
         onClose={closeEditRoleModal}
         role={editRoleModal.role}
         availablePermissions={permissions?.data || []}
         onRoleUpdated={refetchRoles}
       />

      <DeleteRoleModal
        isOpen={deleteRoleModal.isOpen}
        onClose={closeDeleteRoleModal}
        role={deleteRoleModal.role}
        onRoleDeleted={refetchRoles}
      />
    </div>
  )
}