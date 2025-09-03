"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconPlus, IconTrash, IconEdit, IconKey, IconShield, IconUsers } from "@tabler/icons-react"
import { useGetDelegatedAccountsQuery, useCreateDelegatedAccountMutation, useRevokeDelegatedAccountMutation } from "@/store/api/superAdminApi"

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
  { id: '1', name: 'schools:create', description: 'Create new schools' },
  { id: '2', name: 'schools:read', description: 'View schools' },
  { id: '3', name: 'schools:update', description: 'Update school information' },
  { id: '4', name: 'schools:delete', description: 'Delete schools' },
  { id: '5', name: 'users:create', description: 'Create new users' },
  { id: '6', name: 'users:read', description: 'View users' },
  { id: '7', name: 'users:update', description: 'Update user information' },
  { id: '8', name: 'users:delete', description: 'Delete users' },
  { id: '9', name: 'analytics:read', description: 'View analytics and reports' },
  { id: '10', name: 'audit:read', description: 'View audit logs' },
  { id: '11', name: 'system:read', description: 'View system health and metrics' },
  { id: '12', name: 'settings:read', description: 'View system settings' },
  { id: '13', name: 'settings:update', description: 'Update system settings' },
]

export default function IAMPage() {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [email, setEmail] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: delegatedAccounts, isLoading } = useGetDelegatedAccountsQuery()
  const [createDelegatedAccount] = useCreateDelegatedAccountMutation()
  const [revokeDelegatedAccount] = useRevokeDelegatedAccountMutation()

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionName])
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName))
    }
  }

  const handleCreateDelegatedAccount = async () => {
    if (!email || !expiryDate || selectedPermissions.length === 0) {
      return
    }

    try {
      await createDelegatedAccount({
        email,
        permissions: selectedPermissions,
        expiryDate,
        notes,
      }).unwrap()

      // Reset form
      setEmail("")
      setExpiryDate("")
      setNotes("")
      setSelectedPermissions([])
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create delegated account:", error)
    }
  }

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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Create Delegated Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Delegated Account</DialogTitle>
                <DialogDescription>
                  Create a delegated account with specific permissions for staff members.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                    placeholder="staff@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry" className="text-right">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry"
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Permissions
                  </Label>
                  <div className="col-span-3 space-y-2 max-h-48 overflow-y-auto">
                    {defaultPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.name)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(permission.name, checked as boolean)
                          }
                        />
                        <Label htmlFor={permission.id} className="text-sm">
                          <span className="font-medium">{permission.name}</span>
                          <span className="text-muted-foreground ml-2">{permission.description}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3"
                    placeholder="Optional notes about this delegated account"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateDelegatedAccount}>
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                          {new Date(account.expiryDate).toLocaleDateString()}
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