"use client"

import { AuthProvider } from "@/redux/auth/authContext"

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