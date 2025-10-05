"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, Users, BarChart3, Settings, Plus, FileText, Folder } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8 fade-in">
            <div className="skeleton-text h-10 w-96 mb-2"></div>
            <div className="skeleton-text h-6 w-64"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardHeader>
                  <div className="skeleton-text h-4 w-24 mb-2"></div>
                  <div className="skeleton-text h-8 w-16"></div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <CardHeader>
                  <div className="skeleton-text h-6 w-48 mb-2"></div>
                  <div className="skeleton-text h-4 w-64"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="skeleton h-10 w-full"></div>
                  <div className="skeleton h-10 w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user.role === 'admin'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-gradient">{session.user.name}</span>
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? '🔑 Admin Dashboard' : '✍️ Author Dashboard'} - Manage your content and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="fade-in hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Posts</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center pulse-once">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total posts created</p>
          </CardContent>
        </Card>

        <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center pulse-once" style={{ animationDelay: '100ms' }}>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Posts published</p>
          </CardContent>
        </Card>

        <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center pulse-once" style={{ animationDelay: '200ms' }}>
              <PenTool className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Posts in draft</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center pulse-once" style={{ animationDelay: '300ms' }}>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="fade-in hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <PenTool className="h-5 w-5 text-primary" />
              </div>
              Content Management
            </CardTitle>
            <CardDescription>
              Create and manage your blog posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full transition-all hover:scale-105 hover:shadow-lg" asChild>
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Post
              </Link>
            </Button>
            <Button variant="outline" className="w-full transition-all hover:scale-105" asChild>
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                Manage Posts
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-yellow-600" />
                </div>
                Admin Panel
              </CardTitle>
              <CardDescription>
                Manage users, content, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full transition-all hover:scale-105" asChild>
                <Link href="/dashboard/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105" asChild>
                <Link href="/dashboard/admin/categories">
                  <Folder className="mr-2 h-4 w-4" />
                  Manage Categories
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105" asChild>
                <Link href="/dashboard/admin/review">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Posts
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full transition-all hover:scale-105" asChild>
                <Link href="/dashboard/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 fade-in" style={{ animationDelay: '200ms' }}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-lg font-semibold">
                  {isAdmin ? '🔑 Administrator' : '✍️ Author'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{session.user.email}</p>
              </div>
            </div>
            {!isAdmin && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border scale-in" style={{ animationDelay: '300ms' }}>
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> You&apos;re currently an Author. 
                  If you need admin access, please contact an existing administrator 
                  to promote your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
