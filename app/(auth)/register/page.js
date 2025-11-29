"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Eye, EyeOff, UserPlus, Mail, User, Lock, Check, X, Loader2, AtSign } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  })

  // Username validation states
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: ""
  })
  const [usernameDebounceTimer, setUsernameDebounceTimer] = useState(null)

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      toast.info("You are already logged in!")
      router.push('/dashboard')
    }
  }, [status, router])

  // Auto-suggest username from name
  useEffect(() => {
    if (formData.name && !formData.username) {
      const suggestedUsername = formData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 30)

      if (suggestedUsername.length >= 3) {
        setFormData(prev => ({ ...prev, username: suggestedUsername }))
      }
    }
  }, [formData.name])

  // Check username availability with debounce
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: username ? "Username must be at least 3 characters" : ""
      })
      return
    }

    // Validate format
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Only lowercase letters, numbers, and underscores allowed"
      })
      return
    }

    if (username.startsWith('_') || username.endsWith('_')) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Username cannot start or end with underscore"
      })
      return
    }

    if (username.includes('__')) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Username cannot contain consecutive underscores"
      })
      return
    }

    setUsernameStatus({ checking: true, available: null, message: "Checking..." })

    try {
      const response = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      const data = await response.json()

      setUsernameStatus({
        checking: false,
        available: data.available,
        message: data.message
      })
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: "Error checking username"
      })
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Debounced username check
    if (name === 'username') {
      if (usernameDebounceTimer) {
        clearTimeout(usernameDebounceTimer)
      }

      const timer = setTimeout(() => {
        checkUsernameAvailability(value.toLowerCase().trim())
      }, 500)

      setUsernameDebounceTimer(timer)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields")
      setIsLoading(false)
      return
    }

    // Username validation
    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters")
      setIsLoading(false)
      return
    }

    if (!usernameStatus.available) {
      toast.error("Please choose an available username")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success("Account created successfully! Please sign in.")
      router.push('/login')

    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render the form if already authenticated
  if (status === "authenticated") {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold title-gradient">Multigyan</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Join Multigyan</h1>
          <p className="text-muted-foreground mt-2">Create your account to start writing</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Account
            </CardTitle>
            <CardDescription>
              Fill in your details to get started as an author
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username
                  <span className="text-xs text-muted-foreground ml-2">
                    (will be used in your profile URL)
                  </span>
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="john_doe"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${usernameStatus.available === true
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : usernameStatus.available === false
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    required
                  />
                  {/* Status Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {usernameStatus.checking ? (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    ) : usernameStatus.available === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : usernameStatus.available === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {/* Validation Message */}
                {usernameStatus.message && (
                  <p className={`text-xs ${usernameStatus.available === true
                      ? 'text-green-600'
                      : usernameStatus.available === false
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }`}>
                    {usernameStatus.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and underscores. 3-30 characters.
                </p>
              </div>

              {/* Role Info - Read Only */}
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center p-3 bg-muted/50 rounded-md border">
                  <UserPlus className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Author (Admin access is granted by existing administrators)
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  At least 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to homepage */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
