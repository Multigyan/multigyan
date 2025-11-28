"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Crown,
  AlertTriangle,
  Activity,
  Mail,
  Folder,
  BarChart3,
  GitBranch
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, authors: 0, inactive: 0 },
    posts: { total: 0, published: 0, pending: 0, draft: 0, rejected: 0 },
    engagement: { totalViews: 0, totalLikes: 0, totalComments: 0 },
    categories: { total: 0, active: 0 }
  })
  const [pendingPosts, setPendingPosts] = useState([])

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchAdminData()
  }, [session, router])

  const fetchAdminData = async () => {
    try {
      setLoading(true)

      // ✅ FIX: Use dedicated admin stats endpoint for platform-wide data
      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/posts/pending?limit=5')
      ])

      const [statsData, pendingData] = await Promise.all([
        statsRes.json(),
        pendingRes.json()
      ])

      // Update stats from admin endpoint
      if (statsRes.ok && statsData) {
        setStats(statsData)
      }

      // Update pending posts
      if (pendingRes.ok && pendingData.posts) {
        setPendingPosts(pendingData.posts)
      }

    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow/5 via-transparent to-yellow/5 rounded-lg -z-10"></div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">Admin Dashboard</span>
          </h1>
          <p className="text-muted-foreground/80">
            Overview and management of your Multigyan platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl transition-all">
            <Link href="/dashboard/admin/users">Manage Users</Link>
          </Button>
          <Button variant="outline" asChild className="hover:border-primary/50 transition-colors">
            <Link href="/dashboard/admin/review">Review Posts</Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Stats */}
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.users.total}</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/80 mt-2">
              <span className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                {stats.users.admins} Admins
              </span>
              <span>{stats.users.authors} Authors</span>
            </div>
          </CardContent>
        </Card>

        {/* Posts Stats */}
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-500/30 bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.posts.total}</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mt-2">
              <span className="text-green-600">{stats.posts.published} Published</span>
              <span className="text-yellow-600">{stats.posts.pending} Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{stats.engagement.totalViews.toLocaleString()}</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mt-2">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {stats.engagement.totalLikes} Likes
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-500/30 bg-gradient-to-br from-background to-yellow-50/30 dark:to-yellow-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">{stats.posts.pending}</div>
            <p className="text-xs text-muted-foreground/80 mt-2">
              {stats.posts.pending > 0 ? 'Needs attention' : 'All caught up!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Content Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Published</span>
                </div>
                <span className="font-semibold">{stats.posts.published}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending Review</span>
                </div>
                <span className="font-semibold">{stats.posts.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Drafts</span>
                </div>
                <span className="font-semibold">{stats.posts.draft}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Rejected</span>
                </div>
                <span className="font-semibold">{stats.posts.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Administrators</span>
                </div>
                <span className="font-semibold">{stats.users.admins} / 3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Authors</span>
                </div>
                <span className="font-semibold">{stats.users.authors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Active Users</span>
                </div>
                <span className="font-semibold">{stats.users.total - stats.users.inactive}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Inactive</span>
                </div>
                <span className="font-semibold">{stats.users.inactive}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Categories</span>
                <span className="font-semibold">{stats.categories.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Views/Post</span>
                <span className="font-semibold">
                  {stats.posts.published > 0
                    ? Math.round(stats.engagement.totalViews / stats.posts.published)
                    : 0
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Engagement Rate</span>
                <span className="font-semibold">
                  {stats.engagement.totalViews > 0
                    ? Math.round((stats.engagement.totalLikes / stats.engagement.totalViews) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform Status</span>
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions & Pending Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Frequently used admin functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <Link href="/dashboard/admin/review">
                <Clock className="mr-2 h-4 w-4" />
                Review Pending Posts ({stats.posts.pending})
              </Link>
            </Button>

            {/* NEW: Analytics Dashboard */}
            <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
              <Link href="/dashboard/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics Dashboard
              </Link>
            </Button>

            {/* NEW: Revisions */}
            <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50" asChild>
              <Link href="/dashboard/admin/revisions">
                <GitBranch className="mr-2 h-4 w-4 text-orange-600" />
                Review Revisions
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/admin/comments">
                <MessageCircle className="mr-2 h-4 w-4" />
                Manage Comments ({stats.engagement.totalComments || 0})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users ({stats.users.total})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/admin/newsletter">
                <Mail className="mr-2 h-4 w-4" />
                Newsletter Management
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/admin/categories">
                <Folder className="mr-2 h-4 w-4" />
                Manage Categories ({stats.categories.active})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/admin/authors">
                <Users className="mr-2 h-4 w-4" />
                Manage Authors ({stats.users.authors})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                View All Posts
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/blog">
                <Eye className="mr-2 h-4 w-4" />
                View Public Site
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Recent Pending Posts */}
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Posts Awaiting Review</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Latest submissions from authors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPosts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No posts pending review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{post.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>by {post.author?.name}</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <Badge variant="outline" style={{ backgroundColor: post.category?.color, color: 'white' }}>
                          {post.category?.name}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/admin/review`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
                {pendingPosts.length >= 5 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/admin/review">
                      View All Pending Posts
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Needed Alerts */}
      {(stats.posts.pending > 0 || stats.users.inactive > 0) && (
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {stats.posts.pending > 0 && (
                <p className="text-yellow-700">
                  • {stats.posts.pending} post{stats.posts.pending !== 1 ? 's' : ''} awaiting review
                </p>
              )}
              {stats.users.inactive > 0 && (
                <p className="text-yellow-700">
                  • {stats.users.inactive} inactive user{stats.users.inactive !== 1 ? 's' : ''} may need attention
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}