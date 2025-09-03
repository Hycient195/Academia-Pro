"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconShield,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconCircleCheck
} from "@tabler/icons-react"
import { useAuth } from "@/store/auth/authContext"

export default function SuperAdminSignIn() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "admin@admin.com",
    password: "Admin1234$"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Use the new AuthContext login method
      const result = await login(formData.email, formData.password)

      if (result.success) {
        // Redirect to dashboard - cookies are automatically handled
        if (typeof window !== 'undefined') window.location.href = '/super-admin'
      } else {
        setErrors({
          general: result.error || 'Login failed. Please check your credentials.'
        })
      }
    } catch (error: unknown) {
      console.error('Login failed:', error)
      setErrors({
        general: 'Login failed. Please check your credentials.'
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
            <IconShield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Super Admin Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access the system administration dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {errors.general && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <IconAlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@admin.com"
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center">
                  <IconAlertTriangle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center">
                  <IconAlertTriangle className="h-3 w-3 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <IconShield className="h-4 w-4 mr-2" />
                  Sign In as Super Admin
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              <Link
                href="/auth/forgot-password"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-xs text-gray-500">
              For security reasons, super admin access is restricted to authorized personnel only.
            </div>
          </div>

          {/* Demo Credentials */}
          {/* <div className="border-t pt-4">
            <div className="text-xs text-gray-500 mb-2">Demo Credentials:</div>
            <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono">
              <div className="flex items-center text-green-600 mb-1">
                <IconCircleCheck className="h-3 w-3 mr-1" />
                Email: admin@admin.com
              </div>
              <div className="flex items-center text-green-600">
                <IconCircleCheck className="h-3 w-3 mr-1" />
                Password: Admin1234$
              </div>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}