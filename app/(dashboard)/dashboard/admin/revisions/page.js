"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DiffViewer from "@/components/DiffViewer"
import { Input } from "@/components/ui/input"
import {
  GitBranch,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Search
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"

export default function AdminRevisionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [postsWithRevisions, setPostsWithRevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchPostsWithRevisions = useCallback(async () => {
    try {
      setLoading(true)
      // Use dedicated API endpoint for pending revisions
      const params = new URLSearchParams()
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch)
      }

      const response = await fetch(`/api/posts/revisions/pending?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPostsWithRevisions(data.posts || [])
      } else {
        toast.error(data.error || 'Failed to fetch revisions')
      }
    } catch (error) {
      toast.error('Failed to fetch revisions')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchPostsWithRevisions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router, debouncedSearch])

  const handleApproveRevision = async (postId) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approveRevision: true }),
      })

      if (response.ok) {
        toast.success('Revision approved and published!')
        fetchPostsWithRevisions()
        setSelectedPost(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to approve revision')
      }
    } catch (error) {
      toast.error('Failed to approve revision')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectRevision = async (postId) => {
    if (!confirm('Are you sure you want to reject this revision?')) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectRevision: true,
          rejectionReason: 'Revision did not meet quality standards'
        }),
      })

      if (response.ok) {
        toast.success('Revision rejected')
        fetchPostsWithRevisions()
        setSelectedPost(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to reject revision')
      }
    } catch (error) {
      toast.error('Failed to reject revision')
    } finally {
      setActionLoading(false)
    }
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Content Revisions</h1>
        </div>
        <p className="text-muted-foreground">
          Review and approve pending revisions to published posts
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search revisions by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {postsWithRevisions.length}
              </div>
              <p className="text-sm text-muted-foreground">
                {postsWithRevisions.length === 1 ? 'Revision' : 'Revisions'} Pending Review
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-orange-400" />
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {postsWithRevisions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending revisions!</h3>
            <p className="text-muted-foreground mb-4">
              All revision requests have been reviewed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/admin/review">
                  Review New Posts
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {postsWithRevisions.map((post) => (
            <Card key={post._id} className="overflow-hidden border-orange-200">
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-orange-500">
                          <GitBranch className="h-3 w-3 mr-1" />
                          Revision Pending
                        </Badge>
                        <Badge style={{ backgroundColor: post.category?.color }}>
                          {post.category?.name}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          Currently Published
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold mb-2">
                        {post.revision?.title || post.title}
                      </h3>

                      {/* Author and Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>by {post.author?.name}</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Submitted {formatDate(post.revision?.submittedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readingTime} min read
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      onClick={() => setSelectedPost(selectedPost?._id === post._id ? null : post)}
                      variant={selectedPost?._id === post._id ? "default" : "outline"}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedPost?._id === post._id ? 'Hide' : 'Review'} Changes
                    </Button>

                    <Button
                      onClick={() => handleApproveRevision(post._id)}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleRejectRevision(post._id)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>

                    <Button variant="outline" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Eye className="h-4 w-4 mr-2" />
                        View Live Post
                      </Link>
                    </Button>
                  </div>

                  {/* Diff Viewer */}
                  {selectedPost?._id === post._id && (
                    <div className="mt-6 border-t pt-6">
                      <DiffViewer
                        original={{
                          title: post.title,
                          content: post.content,
                          excerpt: post.excerpt,
                          featuredImageUrl: post.featuredImageUrl,
                          category: post.category?._id,
                          tags: post.tags
                        }}
                        revised={{
                          title: post.revision.title,
                          content: post.revision.content,
                          excerpt: post.revision.excerpt,
                          featuredImageUrl: post.revision.featuredImageUrl,
                          category: post.revision.category,
                          tags: post.revision.tags
                        }}
                        title="Proposed Changes"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
