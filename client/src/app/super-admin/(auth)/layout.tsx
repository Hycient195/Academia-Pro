"use client"

import { SuperAdminAuthProvider } from "@/redux/auth/superAdminAuthContext"

export default function SuperAdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SuperAdminAuthProvider>
      {children}
    </SuperAdminAuthProvider>
  )
}