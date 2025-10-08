"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool, Users, BarChart3, Settings, Plus, FileText, Folder } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
    else fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch user's posts stats
      const postsResponse = await fetch('/api/posts?limit=1000')
      const postsData = await postsResponse.json()
      
      if (postsResponse.ok && postsData.posts) {
        const allPosts = postsData.posts
        const published = allPosts.filter(p => p.status === 'published').length
        const drafts = allPosts.filter(p => p.status === 'draft').length
        
        setStats(prev => ({
          ...prev,
          totalPosts: allPosts.length,
          publishedPosts: published,
          draftPosts: drafts
        }))
      }

      // Fetch total users (admin only)
      if (session?.user?.role === 'admin') {
        const usersResponse = await fetch('/api/users')
        const usersData = await usersResponse.json()
        
        if (usersResponse.ok && usersData.users) {
          setStats(prev => ({
            ...prev,
            totalUsers: usersData.users.length
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="mb-6 sm:mb-8 fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-gradient">{session.user.name}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isAdmin ? '🔑 Admin Dashboard' : '✍️ Author Dashboard'} - Manage your content and settings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="fade-in hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Posts</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center pulse-once">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
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
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
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
            <div className="text-2xl font-bold">{stats.draftPosts}</div>
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
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="fade-in hover:shadow-lg transition-all">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <PenTool className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              Content Management
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Create and manage your blog posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button className="w-full transition-all hover:scale-105 hover:shadow-lg min-h-[44px]" asChild>
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Create New Post</span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full transition-all hover:scale-105 min-h-[44px]" asChild>
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Manage Posts</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '150ms' }}>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                Admin Panel
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage users, content, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Button variant="outline" className="w-full transition-all hover:scale-105 min-h-[44px]" asChild>
                <Link href="/dashboard/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105 min-h-[44px]" asChild>
                <Link href="/dashboard/admin/categories">
                  <Folder className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Manage Categories</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105 min-h-[44px]" asChild>
                <Link href="/dashboard/admin/review">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Review Posts</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="fade-in hover:shadow-lg transition-all" style={{ animationDelay: '150ms' }}>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                Account Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Button variant="outline" className="w-full transition-all hover:scale-105 min-h-[44px]" asChild>
                <Link href="/dashboard/profile">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Edit Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full transition-all hover:scale-105 min-h-[44px]" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
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
