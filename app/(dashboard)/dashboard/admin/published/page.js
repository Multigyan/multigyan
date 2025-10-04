"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle,
  User,
  Calendar,
  Heart,
  MessageSquare,
  TrendingUp,
  Filter,
  Loader2,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/helpers"

/**
 * BEGINNER'S GUIDE TO THIS FILE:
 * ================================
 * 
 * This is the "Published Posts Page" for admins to view all published content.
 * 
 * FEATURES:
 * - View all published posts
 * - Search posts by title/content
 * - Filter by category
 * - Sort by date, views, or likes
 * - Quick actions (edit, delete, view on site)
 * - View post statistics
 * 
 * KEY COMPONENTS:
 * - Search bar: Find posts by keywords
 * - Filters: Category and sort options
 * - Post cards: Display post information
 * - Pagination: Navigate through multiple pages of posts
 */

export default function PublishedPostsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // State management
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, views, likes
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  })

  /**
   * Check if user is admin
   * Only admins can access this page
   */
  useEffect(() => {
    if (session && session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [session, router])

  /**
   * Fetch data when filters change
   */
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchCategories()
      fetchPosts()
      fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, categoryFilter, sortBy, session])

  /**
   * FUNCTION: Fetch all categories
   * Used for the category filter dropdown
   */
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  /**
   * FUNCTION: Fetch published posts with filters
   */
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        status: 'published'
      })
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      // Add sort parameter
      if (sortBy === 'oldest') {
        params.append('sort', 'createdAt')
        params.append('order', 'asc')
      } else if (sortBy === 'views') {
        params.append('sort', 'views')
        params.append('order', 'desc')
      } else if (sortBy === 'likes') {
        params.append('sort', 'likeCount')
        params.append('order', 'desc')
      } else {
        // Default: newest first
        params.append('sort', 'publishedAt')
        params.append('order', 'desc')
      }

      const response = await fetch(`/api/posts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  /**
   * FUNCTION: Fetch statistics
   * Get totals for views, likes, and comments
   */
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/posts?status=published&limit=1000')
      const data = await response.json()

      if (response.ok) {
        const allPosts = data.posts
        setStats({
          totalPosts: allPosts.length,
          totalViews: allPosts.reduce((sum, post) => sum + (post.views || 0), 0),
          totalLikes: allPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
          totalComments: allPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  /**
   * FUNCTION: Handle search
   * Triggered when user submits search form
   */
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts()
  }

  /**
   * FUNCTION: Delete a post
   * Permanently removes a post from the database
   */
  const handleDelete = async (postId, postTitle) => {
    if (!confirm(`Are you sure you want to delete &quot;${postTitle}&quot;? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Post deleted successfully')
        fetchPosts()
        fetchStats()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete post')
    }
  }

  /**
   * FUNCTION: Reset all filters
   */
  const resetFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setSortBy("newest")
    setCurrentPage(1)
  }

  // Show loading spinner while checking permissions
  if (!session || session.user.role !== 'admin') {
    return null
  }

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading published posts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Published Posts</h1>
        <p className="text-muted-foreground">
          View and manage all published content on your platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total discussions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search published posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit">Search</Button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Filters */}
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Posts Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'No published posts available yet.'}
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Featured Image */}
              <div className="relative h-48 bg-muted">
                {post.featuredImageUrl ? (
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt || post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-primary/60" />
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                {/* Category Badge */}
                {post.category && (
                  <Badge className="mb-3" style={{ backgroundColor: post.category.color }}>
                    {post.category.name}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-primary">
                  <Link href={`/dashboard/posts/${post._id}`}>
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt || 'No excerpt available'}
                </p>

                {/* Author and Meta */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    {post.author?.profilePictureUrl ? (
                      <Image
                        src={post.author.profilePictureUrl}
                        alt={post.author.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    <span>{post.author?.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}m
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/posts/${post._id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(post._id, post.title)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          
          <span className="px-4 text-sm text-muted-foreground">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
