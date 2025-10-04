"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/helpers"

const statusConfig = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-gray-500' },
  pending_review: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-500' },
  published: { label: 'Published', icon: CheckCircle, color: 'bg-green-500' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-500' }
}

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
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
      toast.error('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts()
  }

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Post deleted successfully')
        fetchPosts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Posts</h1>
          <p className="text-muted-foreground">Manage and organize your blog posts</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'Get started by creating your first post.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                        <Link href={`/dashboard/posts/${post._id}`}>
                          {post.title}
                        </Link>
                      </h3>
                      {getStatusBadge(post.status)}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {post.excerpt || 'No excerpt available'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {post.category?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} min read
                      </span>
                      <span>
                        {post.status === 'published' 
                          ? `Published ${formatDate(post.publishedAt)}`
                          : `Updated ${formatDate(post.updatedAt)}`
                        }
                      </span>
                      {post.status === 'published' && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post._id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    {post.status === 'published' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(post._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {post.status === 'rejected' && post.rejectionReason && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                        <p className="text-sm text-muted-foreground">{post.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4 text-sm text-muted-foreground">
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