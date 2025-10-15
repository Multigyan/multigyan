"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Heart,
  Share2,
  Loader2
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"

/**
 * BEGINNER'S GUIDE TO THIS FILE:
 * ================================
 * 
 * This is a "Post Preview Page" that shows:
 * - Full post details
 * - Post metadata (author, date, category, etc.)
 * - Quick actions for admins (approve, reject, edit, delete)
 * 
 * KEY CONCEPTS:
 * 1. useState: Stores data that can change (like post details, loading state)
 * 2. useEffect: Runs code when the page loads (fetches post data)
 * 3. useRouter: Allows navigation to other pages
 * 4. API calls: fetch() sends requests to the backend to get/update data
 */

export default function PostPreviewPage({ params }) {
  const { data: session } = useSession()
  const router = useRouter()
  
  // STATE MANAGEMENT - Think of these as "memory boxes" that store data
  const [post, setPost] = useState(null) // Stores the post data
  const [loading, setLoading] = useState(true) // Is the page loading?
  const [actionLoading, setActionLoading] = useState(false) // Is an action being processed?
  const [postId, setPostId] = useState(null) // Stores the post ID from URL
  const [showRejectDialog, setShowRejectDialog] = useState(false) // Show rejection dialog?
  const [rejectionReason, setRejectionReason] = useState("") // Rejection reason text

  /**
   * STEP 1: Extract post ID from URL
   * When you visit /dashboard/posts/123, we need to get "123"
   */
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params
      setPostId(resolvedParams.id)
    }
    fetchParams()
  }, [params])

  /**
   * STEP 2: Fetch post data from the backend
   * Once we have the post ID, we load the post details
   */
  // ✅ FIX: Moved fetchPost definition BEFORE this useEffect
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${postId}`)
      const data = await response.json()

      if (response.ok) {
        // ✅ FIX: API returns { post: {...} }, so we need to access data.post
        const postData = data.post || data
        console.log('Fetched post data:', postData) // Debug log
        setPost(postData) // Store the post in state
      } else {
        toast.error(data.error || 'Failed to load post')
        router.push('/dashboard/posts')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Failed to load post')
      router.push('/dashboard/posts')
    } finally {
      setLoading(false)
    }
  }, [postId, router])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId, fetchPost])

  /**
   * FUNCTION: Approve a post (Admin only)
   * Changes post status from "pending_review" to "published"
   */
  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve and publish this post?')) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${postId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (response.ok) {
        toast.success('Post approved and published successfully!')
        router.push('/dashboard/admin/review')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to approve post')
      }
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to approve post')
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * FUNCTION: Reject a post (Admin only)
   * Changes post status to "rejected" with a reason
   */
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${postId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject',
          reason: rejectionReason.trim()
        }),
      })

      if (response.ok) {
        toast.success('Post rejected successfully')
        setShowRejectDialog(false)
        router.push('/dashboard/admin/review')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to reject post')
      }
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Failed to reject post')
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * FUNCTION: Delete a post
   * Permanently removes the post from the database
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Post deleted successfully')
        router.push('/dashboard/posts')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete post')
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * FUNCTION: Get status badge styling
   * Returns different colors for different post statuses
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-500', icon: Edit },
      pending_review: { label: 'Pending Review', color: 'bg-yellow-500', icon: Clock },
      published: { label: 'Published', color: 'bg-green-500', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Check if current user is admin
  const isAdmin = session?.user?.role === 'admin'
  const isAuthor = session?.user?.id === post?.author?._id

  /**
   * LOADING STATE
   * Shows a spinner while the post is being loaded
   */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  /**
   * ERROR STATE
   * If post doesn't exist, show error message
   */
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Post Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The post you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard/posts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * MAIN RENDER
   * This is the actual page layout that users see
   */
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={isAdmin && post.status === 'pending_review' 
              ? "/dashboard/admin/review" 
              : "/dashboard/posts"
            }>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Show edit button for author or admin */}
            {(isAuthor || isAdmin) && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/posts/${postId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}

            {/* Show delete button for author or admin */}
            {(isAuthor || isAdmin) && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Admin Quick Actions - Only show for pending posts */}
        {isAdmin && post.status === 'pending_review' && (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Review and take action on this post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Publish
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Post Content Card */}
      <Card>
        <CardContent className="p-8">
          {/* Post Status */}
          <div className="mb-6">
            {getStatusBadge(post.status)}
          </div>

          {/* Post Title */}
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {/* Post Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author?.profilePictureUrl ? (
                <Image
                  src={post.author.profilePictureUrl}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
              <span className="font-medium">{post.author?.name}</span>
            </div>

            {/* Created Date */}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </span>

            {/* Reading Time */}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime} min read
            </span>

            {/* Category */}
            {post.category && (
              <Badge style={{ backgroundColor: post.category.color }}>
                {post.category.name}
              </Badge>
            )}

            {/* Views (if published) */}
            {post.status === 'published' && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views} views
              </span>
            )}

            {/* Likes (if published) */}
            {post.status === 'published' && (
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likeCount} likes
              </span>
            )}
          </div>

          {/* Featured Image */}
          {post.featuredImageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Post Excerpt */}
          {post.excerpt && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-lg font-medium italic">{post.excerpt}</p>
            </div>
          )}

          {/* Post Content (HTML) */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {post.status === 'rejected' && post.rejectionReason && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive mb-1">Rejection Reason:</p>
                  <p className="text-sm text-muted-foreground">{post.rejectionReason}</p>
                  {post.reviewedBy && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Reviewed by {post.reviewedBy.name} on {formatDate(post.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEO Info (for admins) */}
          {isAdmin && (post.seoTitle || post.seoDescription) && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">SEO Information</h3>
              <div className="space-y-3">
                {post.seoTitle && (
                  <div>
                    <Label className="text-xs text-muted-foreground">SEO Title</Label>
                    <p className="text-sm">{post.seoTitle}</p>
                  </div>
                )}
                {post.seoDescription && (
                  <div>
                    <Label className="text-xs text-muted-foreground">SEO Description</Label>
                    <p className="text-sm">{post.seoDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Provide feedback to help the author improve this post.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this post is being rejected and what needs to be improved..."
                className="mt-1"
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
