"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
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
  AlertCircle,
  ShieldAlert,
  GitBranch,
  Info,
  ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/helpers"

const statusConfig = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-gradient-to-r from-gray-500 to-gray-600', textColor: 'text-white' },
  pending_review: { label: 'Pending Review', icon: Clock, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600', textColor: 'text-white' },
  published: { label: 'Published', icon: CheckCircle, color: 'bg-gradient-to-r from-green-500 to-green-600', textColor: 'text-white' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-gradient-to-r from-red-500 to-red-600', textColor: 'text-white' }
}

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  // Set page title
  useEffect(() => {
    document.title = isAdmin ? "All Posts | Multigyan" : "My Posts | Multigyan"
  }, [isAdmin])

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

  const handleDelete = async (post) => {
    // ✅ Check if author can delete published post
    if (!isAdmin && post.status === 'published') {
      toast.error('Published posts cannot be deleted. Please contact an administrator.')
      return
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
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
      <Badge variant="secondary" className={`${config.color} ${config.textColor} shadow-md hover:shadow-lg transition-shadow`}>
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
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg -z-10"></div>
        <div className="py-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isAdmin ? (
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">All Posts</span>
            ) : (
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">Your Posts</span>
            )}
          </h1>
          <p className="text-muted-foreground/80">
            {isAdmin
              ? 'Manage all posts from all authors'
              : 'Manage and organize your blog posts'}
          </p>
          {/* ✅ NEW: Show draft count */}
          {pagination && (
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-muted-foreground">
                Total: <span className="font-medium text-foreground">{pagination.total}</span>
              </span>
              {statusFilter === 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter('draft')}
                  className="h-7 text-xs hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View Drafts
                </Button>
              )}
            </div>
          )}
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl transition-all">
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      {/* ✅ Info Banner for Authors */}
      {!isAdmin && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Important: How Post Editing Works
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Published posts cannot be deleted by authors</li>
                  <li>When you edit a published post, changes will be submitted for admin approval</li>
                  <li>Your original post remains live until the revision is approved</li>
                  <li>You can only edit drafts and pending posts directly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Filters */}
      <Card className="mb-6 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm transition-all duration-300">
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
                  className="pl-10 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 focus:border-primary/50">
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
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg">Search</Button>
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
            <Card key={post._id} className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Enhanced Featured Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-full md:w-40 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      {post.featuredImageUrl ? (
                        <Image
                          src={post.featuredImageUrl}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 160px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30">
                          <ImageIcon className="h-12 w-12 text-primary/60 transition-transform group-hover:scale-110" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                        <Link href={`/dashboard/posts/${post._id}`}>
                          {post.title}
                        </Link>
                      </h3>
                      {getStatusBadge(post.status)}

                      {/* ✅ Show if post has pending revision */}
                      {post.hasRevision && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <GitBranch className="w-3 h-3 mr-1" />
                          Revision Pending
                        </Badge>
                      )}

                      {/* ✅ Show if post was edited by admin */}
                      {post.lastEditedBy && isAdmin && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          Edited by Admin
                        </Badge>
                      )}
                    </div>

                    {/* ✅ Show author name for admins */}
                    {isAdmin && post.author && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Author: <span className="font-medium">{post.author.name}</span>
                      </p>
                    )}

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
                </div>

                {/* Enhanced Actions Row */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild className="hover:border-primary/50 hover:shadow-md transition-all">
                    <Link href={`/dashboard/posts/${post._id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  {post.status === 'published' && (
                    <Button variant="outline" size="sm" asChild className="hover:border-green-500/50 hover:shadow-md transition-all">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  {/* ✅ Only show delete for non-published posts or admins */}
                  {(isAdmin || post.status !== 'published') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post)}
                      className="text-destructive hover:text-destructive hover:border-destructive/50 hover:shadow-md transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* ✅ Show rejection reason */}
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

                {/* ✅ Show admin edit reason */}
                {post.lastEditedBy && post.editReason && !isAdmin && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Edited by Admin {post.lastEditedAt && `on ${formatDate(post.lastEditedAt)}`}
                        </p>
                        <p className="text-sm text-purple-700 mt-1">
                          <span className="font-medium">Reason:</span> {post.editReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Show revision info */}
                {post.hasRevision && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <GitBranch className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">
                          Revision Pending Approval
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          {isAdmin
                            ? 'This post has pending changes that need your review.'
                            : 'Your changes are pending admin approval. The original post remains published.'}
                        </p>
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
