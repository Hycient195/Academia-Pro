"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconSchool,
  IconShield,
  IconHelp,
} from "@tabler/icons-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { apis } from "@/redux/api"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/redux/slices/authSlice"
import { toast } from "sonner"
import type { IAuthUser } from "@academia-pro/types/auth"
import ErrorBlock from "@/components/utilities/ErrorBlock"


export default function SignInPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [loginForm, setLoginForm] = useState({ email: "doe@yopmail.com", password: "Test1234$", rememberMe: false })
  const [uiState, setUiState] = useState({ showPassword: false })
  const [resetState, setResetState] = useState({ open: false, newPassword: "", confirmPassword: "" })

  const [login, { isLoading, error: loginError }] = apis.auth.useLoginMutation()
  const [changePassword, { isLoading: isChangingPassword }] = apis.auth.useChangePasswordMutation()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (resetState.newPassword !== resetState.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (resetState.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    // loading state handled by RTK isChangingPassword

    try {
      // Change password for first-time login using default current password (email)
      await changePassword({
        currentPassword: loginForm.email,
        newPassword: resetState.newPassword,
        confirmPassword: resetState.confirmPassword,
      }).unwrap()

      // After password change, fetch current user and proceed
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const meRes = await fetch(`${apiBase}/api/v1/auth/me`, { credentials: 'include' })
      let userPayload: IAuthUser | null = null
      if (meRes.ok) {
        userPayload = await meRes.json()
      }

      toast.success("Password updated. Your account is now active.")

      if (userPayload) {
        dispatch(setCredentials({
          user: {
            ...userPayload,
            name: `${userPayload.firstName} ${userPayload.lastName}`,
            roles: userPayload.roles,
            permissions: [],
          },
          // Using cookie-based auth; tokens not required for client fetchBaseQuery with credentials: 'include'
          token: '',
          refreshToken: '',
        }))

        // Redirect based on user role (use first role for primary routing)
        const userRole = userPayload.roles[0] || 'student'
        let redirectPath = "/dashboard"

        switch (userRole) {
          case "student":
            redirectPath = "/student/dashboard"
            break
          case "parent":
            redirectPath = "/parent/dashboard"
            break
          case "teacher":
            // Teacher portal maps to staff area
            redirectPath = "/staff"
            break
          case "school-admin":
            redirectPath = "/school-admin"
            break
          case "super-admin":
          case "delegated-super-admin":
            redirectPath = "/super-admin/dashboard"
            break
          default:
            redirectPath = "/dashboard"
        }

        router.push(redirectPath)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Password reset failed:", error)
      toast.error("Failed to reset password. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await login({
        email: loginForm.email,
        password: loginForm.password,
      }).unwrap()

      console.log(result)

      // Check if password reset is required (first-time login)
      if (result.requiresPasswordReset) {
        setResetState((prev) => ({ ...prev, open: true }))
        return
      }

      // Store credentials in Redux
      dispatch(setCredentials({
        user: {
          ...result.user,
          name: `${result.user.firstName} ${result.user.lastName}`,
          roles: result.user.roles,
          permissions: [], // TODO: Get permissions from API
        },
        token: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      }))

      // Redirect based on user role from API response (use first role for primary routing)
      const userRole = result.user.roles[0] || 'student'
      let redirectPath = "/dashboard"

      switch (userRole) {
        case "student":
          redirectPath = "/student/overview"
          break
        case "parent":
          redirectPath = "/parent/overview"
          break
        case "teacher":
          redirectPath = "/staff/overview"
          break
        case "school-admin":
          redirectPath = "/school-admin/overview"
          break
        case "super-admin":
        case "delegated-super-admin":
          redirectPath = "/super-admin/overview"
          break
        default:
          redirectPath = "/overview"
      }

      toast.success("Login successful! Redirecting...")
      router.push(redirectPath)
    } catch (error) {
      console.error("Login failed:", error)
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Login failed. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <IconSchool className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Academia Pro</h1>
          <p className="text-gray-600 mt-2">
            Sign in to access your portal
          </p>
        </div>


        {/* Login Form */}
        <Card className="shadow-lg max-w-lg mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={uiState.showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setUiState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {uiState.showPassword ? (
                      <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IconEye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={loginForm.rememberMe}
                    onCheckedChange={(checked) => setLoginForm((prev) => ({ ...prev, rememberMe: Boolean(checked) }))}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Button variant="link" className="px-0 font-normal">
                  Forgot password?
                </Button>
              </div>
              <ErrorBlock error={loginError} />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <IconMail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <IconShield className="mr-2 h-4 w-4" />
                  SSO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-normal">
              Contact School Administration
            </Button>
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="sm">
              <IconHelp className="mr-1 h-3 w-3" />
              Help
            </Button>
            <Button variant="ghost" size="sm">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm">
              Terms of Service
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        {/* <Card className="border-amber-200 bg-amber-50 max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <IconShield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Secure Login</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your connection is encrypted and secure. All data is protected with industry-standard security measures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Password Reset Modal */}
        <Dialog open={resetState.open} onOpenChange={(open) => setResetState((prev) => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconShield className="h-5 w-5 text-blue-600" />
                Set Your Password
              </DialogTitle>
              <DialogDescription>
                Welcome! This is your first time logging in. Please set a new password for your account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={uiState.showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={resetState.newPassword}
                    onChange={(e) => setResetState((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setUiState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {uiState.showPassword ? (
                      <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IconEye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={resetState.confirmPassword}
                    onChange={(e) => setResetState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetState((prev) => ({ ...prev, open: false, newPassword: "", confirmPassword: "" }))
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isChangingPassword || !resetState.newPassword || !resetState.confirmPassword}
                >
                  {isChangingPassword ? "Setting Password..." : "Set Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}