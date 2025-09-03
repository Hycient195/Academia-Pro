"use client"

import { AuthProvider } from "@/store/auth/authContext"

export default function SuperAdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}