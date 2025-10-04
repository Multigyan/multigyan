"use client"

import { useState, useEffect, Suspense } from "react"
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
  Activity
} from "lucide-react"
import { formatDate } from "@/lib/helpers"

function AdminDashboardContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, authors: 0, inactive: 0 },
    posts: { total: 0, published: 0, pending: 0, draft: 0, rejected: 0 },
    engagement: { totalViews: 0, totalLikes: 0, totalComments: 0 },
    categories: { total: 0, active: 0 }
  })
  const [recentActivity, setRecentActivity] = useState([])
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
      
      // Fetch all the admin data
      const [usersRes, postsRes, categoriesRes, pendingRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/posts'),
        fetch('/api/categories'),
        fetch('/api/posts/pending?limit=5')
      ])

      const [usersData, postsData, categoriesData, pendingData] = await Promise.all([
        usersRes.json(),
        postsRes.json(),
        categoriesRes.json(),
        pendingRes.json()
      ])

      // Process users data
      if (usersRes.ok && usersData.users) {
        const users = usersData.users
        setStats(prev => ({
          ...prev,
          users: {
            total: users.length,
            admins: users.filter(u => u.role === 'admin').length,
            authors: users.filter(u => u.role === 'author').length,
            inactive: users.filter(u => !u.isActive).length
          }
        }))
      }

      // Process posts data
      if (postsRes.ok && postsData.posts) {
        const posts = postsData.posts
        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
        
        setStats(prev => ({
          ...prev,
          posts: {
            total: postsData.pagination?.total || posts.length,
            published: posts.filter(p => p.status === 'published').length,
            pending: posts.filter(p => p.status === 'pending_review').length,
            draft: posts.filter(p => p.status === 'draft').length,
            rejected: posts.filter(p => p.status === 'rejected').length
          },
          engagement: {
            totalViews,
            totalLikes,
            totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
          }
        }))
      }

      // Process categories data
      if (categoriesRes.ok && categoriesData.categories) {
        const categories = categoriesData.categories
        setStats(prev => ({
          ...prev,
          categories: {
            total: categories.length,
            active: categories.filter(c => c.isActive).length
          }
        }))
      }

      // Process pending posts
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview and management of your Multigyan platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/admin/users">Manage Users</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/review">Review Posts</Link>
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                {stats.users.admins} Admins
              </span>
              <span>{stats.users.authors} Authors</span>
            </div>
          </CardContent>
        </Card>

        {/* Posts Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts.total}</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="text-green-600">{stats.posts.published} Published</span>
              <span className="text-yellow-600">{stats.posts.pending} Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagement.totalViews.toLocaleString()}</div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {stats.engagement.totalLikes} Likes
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.posts.pending}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.posts.pending > 0 ? 'Needs attention' : 'All caught up!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
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

        <Card>
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

        <Card>
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

      {/* Quick Actions & Pending Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
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

        {/* Recent Pending Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Posts Awaiting Review</CardTitle>
            <CardDescription>
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}