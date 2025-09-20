"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import apis from "@/redux/api"
const { useGetDelegatedSchoolAdminsQuery } = apis.schoolAdmin.delegatedAdmin
import {
  IconUsers,
  IconPlus,
} from "@tabler/icons-react"
import type { IDelegatedAccount } from "@academia-pro/types/super-admin"

export default function DelegatedAdminsPage() {
  const { data, isFetching } = useGetDelegatedSchoolAdminsQuery({})
  const delegatedAdmins = (data?.data ?? []) as IDelegatedAccount[]

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
      expired: "bg-amber-100 text-amber-800",
      revoked: "bg-red-100 text-red-800",
    }
    const cls = map[s] || "bg-secondary"
    const label = s.charAt(0).toUpperCase() + s.slice(1)
    return <Badge variant="default" className={cls}>{label}</Badge>
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Delegated School Admins</h1>
            <p className="text-muted-foreground">
              Manage delegated administrators with limited permissions within your school
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Create Delegated Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Delegated Admins</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{delegatedAdmins.length}</div>
              <p className="text-xs text-muted-foreground">
                Active accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Delegated Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Delegated Administrators</CardTitle>
            <CardDescription>
              Manage delegated school administrators and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegatedAdmins.map((admin: IDelegatedAccount) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{getStatusBadge(admin.status)}</TableCell>
                    <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {admin.expiryDate ? new Date(admin.expiryDate).toLocaleDateString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!isFetching && delegatedAdmins.length === 0 && (
              <div className="text-center py-8">
                <IconUsers className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No delegated admins found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first delegated administrator to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}