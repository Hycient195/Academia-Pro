"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconSchool,
  IconShield,
  IconHelp,
  IconUser,
  IconUsers,
  IconUserShield,
  IconBuildingBank,
} from "@tabler/icons-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLoginMutation } from "@/store/api/authApi"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/store/slices/authSlice"
import { toast } from "sonner"

type UserType = "school-admin" | "student" | "parent" | "teacher"

const userTypes = [
  {
    id: "school-admin" as UserType,
    name: "School Admin",
    description: "Manage school operations and administration",
    icon: IconUserShield,
    redirectPath: "/dashboard",
    color: "bg-blue-500",
  },
  {
    id: "student" as UserType,
    name: "Student",
    description: "Access your academic information and grades",
    icon: IconUser,
    redirectPath: "/student/dashboard",
    color: "bg-green-500",
  },
  {
    id: "parent" as UserType,
    name: "Parent",
    description: "Monitor your children's academic progress",
    icon: IconUsers,
    redirectPath: "/parent/dashboard",
    color: "bg-purple-500",
  },
  {
    id: "teacher" as UserType,
    name: "Teacher",
    description: "Manage classes and student performance",
    icon: IconBuildingBank,
    redirectPath: "/teacher/dashboard",
    color: "bg-orange-500",
  },
]

export default function SignInPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)

  const [login, { isLoading }] = useLoginMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserType) {
      toast.error("Please select a user type")
      return
    }

    try {
      const result = await login({
        email,
        password,
      }).unwrap()

      // Store credentials in Redux
      dispatch(setCredentials({
        user: {
          ...result.user,
          name: `${result.user.firstName} ${result.user.lastName}`,
          role: result.user.role as 'super-admin' | 'school-admin' | 'teacher' | 'student' | 'parent',
          permissions: [], // TODO: Get permissions from API
        },
        token: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      }))

      // Redirect based on user role from API response
      const userRole = result.user.role
      let redirectPath = "/dashboard"

      switch (userRole) {
        case "student":
          redirectPath = "/student/dashboard"
          break
        case "parent":
          redirectPath = "/parent/dashboard"
          break
        case "teacher":
          redirectPath = "/teacher/dashboard"
          break
        case "school-admin":
          redirectPath = "/school-admin/dashboard"
          break
        case "super-admin":
          redirectPath = "/super-admin/dashboard"
          break
        default:
          redirectPath = "/dashboard"
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
            Choose your role and sign in to access your portal
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
                <Label htmlFor="userType">User Type</Label>
                <Select value={selectedUserType || ""} onValueChange={(value) => setSelectedUserType(value as UserType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || !selectedUserType}
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
        <Card className="border-amber-200 bg-amber-50 max-w-lg mx-auto">
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
        </Card>
      </div>
    </div>
  )
}