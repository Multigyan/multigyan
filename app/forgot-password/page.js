"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resetUrl, setResetUrl] = useState("") // For development testing

  // Set page title
  useEffect(() => {
    document.title = "Forgot Password | Multigyan"
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate email
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)

        // Store reset URL for development testing
        if (data.resetUrl) {
          setResetUrl(data.resetUrl)
        }

        toast.success("Password reset instructions sent!")
      } else {
        // Handle specific error cases
        if (data.emailNotFound) {
          toast.error("No account found with this email address")
        } else {
          toast.error(data.error || "Failed to send reset email")
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // If email was sent successfully
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent password reset instructions to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="font-medium text-foreground">{email}</p>
            </div>

            {/* Development mode - show reset link */}
            {resetUrl && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Development Mode - Reset Link:
                    </p>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded border border-yellow-200 dark:border-yellow-700">
                      <code className="text-xs break-all text-yellow-900 dark:text-yellow-100">
                        {resetUrl}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.open(resetUrl, '_blank')
                      }}
                    >
                      Open Reset Link
                    </Button>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      ⚠️ In production, this link will only be sent via email
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-foreground">Didn&apos;t receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and check again</li>
                  <li>The email may take up to 5 minutes to arrive</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false)
                  setResetUrl("")
                }}
                className="w-full"
              >
                Try Another Email
              </Button>
              <Button
                variant="ghost"
                asChild
                className="w-full"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main forgot password form
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            No worries! Enter your email address and we&apos;ll send you instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll verify your account and send a password reset link
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> We&apos;ll check if an account exists with this email before sending the reset link.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying account...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                asChild
                className="text-sm"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-center space-y-2">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
