"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import useSWR from "swr"
import { dashboardStatsConfig } from "@/lib/swr-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, Users, BarChart3, Settings, Plus, FileText, Folder, TrendingUp, History, MessageSquareText, Image } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // ⚡ SWR OPTIMIZATION: Automatic caching, revalidation, and loading states
  // Data is cached and instantly available on revisit
  const { data: statsData, error, isLoading } = useSWR(
    session ? '/api/users/dashboard/stats' : null,
    dashboardStatsConfig
  )

  const stats = statsData?.stats || {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0
  }

  const loading = isLoading || status === "loading"

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
  }, [session, status, router])

  // Set page title
  useEffect(() => {
    document.title = "Dashboard | Multigyan"
  }, [])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8 fade-in">
            <div className="skeleton-text h-8 sm:h-10 w-64 sm:w-96 mb-2"></div>
            <div className="skeleton-text h-5 sm:h-6 w-48 sm:w-64"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardHeader>
                  <div className="skeleton-text h-4 w-24 mb-2"></div>
                  <div className="skeleton-text h-8 w-16"></div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <CardHeader>
                  <div className="skeleton-text h-6 w-48 mb-2"></div>
                  <div className="skeleton-text h-4 w-64"></div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="skeleton h-11 w-full"></div>
                  <div className="skeleton h-11 w-full"></div>
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Enhanced header with gradient */}
      <div className="mb-6 sm:mb-8 fade-in relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg -z-10"></div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Welcome back, <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">{session.user.name}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground/80">
          {isAdmin ? '🔑 Admin Dashboard' : '✍️ Author Dashboard'} - Manage your content and settings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Your Personal Posts' : 'Your Posts'}
            </CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground/80">
              {isAdmin ? 'Posts you created (not platform total)' : 'Total posts created by you'}
            </p>
          </CardContent>
        </Card>

        <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-500/30 bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/20 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '100ms' }}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground/80">Posts published</p>
          </CardContent>
        </Card>

        <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-500/30 bg-gradient-to-br from-background to-yellow-50/30 dark:to-yellow-950/20 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '200ms' }}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <PenTool className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.draftPosts}</div>
            <p className="text-xs text-muted-foreground/80">Posts in draft</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '300ms' }}>
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground/80">Registered users</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm relative overflow-hidden group">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <CardHeader className="pb-3 sm:pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <PenTool className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Content Management
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
              Create and manage your blog posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 relative z-10">
            <Button className="w-full transition-all hover:scale-105 hover:shadow-xl min-h-[44px] bg-gradient-to-r from-primary to-primary/90" asChild>
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Create New Post</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-primary/50" asChild>
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Manage Posts</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-500/30 bg-gradient-to-br from-background to-yellow-50/30 dark:to-yellow-950/20 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '150ms' }}>
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="pb-3 sm:pb-4 relative z-10">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Admin Panel
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
                Manage users, content, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 relative z-10">
              <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-yellow-500/50" asChild>
                <Link href="/dashboard/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-yellow-500/50" asChild>
                <Link href="/dashboard/admin/categories">
                  <Folder className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Manage Categories</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-yellow-500/50" asChild>
                <Link href="/dashboard/admin/review">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Review Posts</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '150ms' }}>
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="pb-3 sm:pb-4 relative z-10">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Account Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 relative z-10">
              <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-primary/50" asChild>
                <Link href="/dashboard/profile">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Edit Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-primary/50" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Phase 4 Features - Analytics & Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '200ms' }}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <CardHeader className="pb-3 sm:pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Analytics & Insights
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
              Track performance and analyze content metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 relative z-10">
            <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-purple-500/50" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Analytics Dashboard</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-purple-500/50" asChild>
              <Link href="/dashboard/posts">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Top Posts</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="fade-in hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-pink-500/30 bg-gradient-to-br from-background to-pink-50/30 dark:to-pink-950/20 backdrop-blur-sm relative overflow-hidden group" style={{ animationDelay: '250ms' }}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <CardHeader className="pb-3 sm:pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <History className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Collaboration Tools
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
              Version history, reviews, and team collaboration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 relative z-10">
            <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-pink-500/50" asChild>
              <Link href="/dashboard/posts">
                <History className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Version History</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px] hover:border-pink-500/50" asChild>
              <Link href="/dashboard/reviews">
                <MessageSquareText className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Draft Reviews</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 sm:mt-8 fade-in" style={{ animationDelay: '200ms' }}>
        <Card className="glass">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-base sm:text-lg font-semibold">
                  {isAdmin ? '🔑 Administrator' : '✍️ Author'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base sm:text-lg truncate">{session.user.email}</p>
              </div>
            </div>
            {!isAdmin && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border scale-in" style={{ animationDelay: '300ms' }}>
                <p className="text-xs sm:text-sm text-muted-foreground">
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
