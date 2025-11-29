"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  AlertCircle,
  FileText,
  MessageSquare,
  Trash2,
  Edit,
  Check,
  X,
  Loader2
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"
import { BulkConfirmDialog } from "@/components/ConfirmDialog"

export default function AdminReviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pendingPosts, setPendingPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  // Bulk operations state
  const [selectedPosts, setSelectedPosts] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [bulkActionType, setBulkActionType] = useState('')

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchPendingPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router, currentPage])

  // Set page title
  useEffect(() => {
    document.title = "Content Review | Multigyan"
  }, [])

  const fetchPendingPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/pending?page=${currentPage}&limit=10`)
      const data = await response.json()

      if (response.ok) {
        setPendingPosts(data.posts || [])
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Failed to fetch pending posts')
      }
    } catch (error) {
      toast.error('Failed to fetch pending posts')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postId) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${postId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (response.ok) {
        toast.success('Post approved and published successfully!')
        fetchPendingPosts() // Refresh the list
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to approve post')
      }
    } catch (error) {
      toast.error('Failed to approve post')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPost || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/posts/${selectedPost._id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          reason: rejectionReason.trim()
        }),
      })

      if (response.ok) {
        toast.success('Post rejected successfully')
        setShowRejectDialog(false)
        setRejectionReason("")
        setSelectedPost(null)
        fetchPendingPosts() // Refresh the list
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to reject post')
      }
    } catch (error) {
      toast.error('Failed to reject post')
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectDialog = (post) => {
    setSelectedPost(post)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  /**
   * FUNCTION: Delete a post
   * Permanently removes the post from the database
   */
  const handleDelete = async (postId) => {
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
        fetchPendingPosts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk operation handlers
  const togglePostSelection = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPosts.length === pendingPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(pendingPosts.map(post => post._id))
    }
  }

  const handleBulkAction = (action) => {
    if (selectedPosts.length === 0) {
      toast.error('Please select at least one post')
      return
    }
    setBulkActionType(action)
    setShowBulkConfirm(true)
  }

  const executeBulkAction = async () => {
    try {
      setActionLoading(true)
      const promises = selectedPosts.map(postId => {
        if (bulkActionType === 'approve') {
          return fetch(`/api/posts/${postId}/actions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve' })
          })
        } else if (bulkActionType === 'reject') {
          return fetch(`/api/posts/${postId}/actions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject', reason: 'Bulk rejection' })
          })
        } else if (bulkActionType === 'delete') {
          return fetch(`/api/posts/${postId}`, { method: 'DELETE' })
        }
      })

      await Promise.all(promises)

      toast.success(`Successfully ${bulkActionType}d ${selectedPosts.length} posts`)
      setSelectedPosts([])
      setShowBulkConfirm(false)
      fetchPendingPosts()
    } catch (error) {
      toast.error(`Failed to ${bulkActionType} posts`)
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green/5 via-transparent to-green/5 rounded-lg -z-10"></div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent">Content Review</span>
        </h1>
        <p className="text-muted-foreground/80">
          Review and moderate posts submitted by authors
        </p>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-500/30 bg-gradient-to-br from-background to-yellow-50/30 dark:to-yellow-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              {pagination?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground/80">
              Posts awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {pendingPosts.length > 0 ? 'Active' : 'Empty'}
            </div>
            <p className="text-xs text-muted-foreground/80">
              Current queue status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Operations Toolbar */}
      {pendingPosts.length > 0 && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedPosts.length === pendingPosts.length && pendingPosts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="cursor-pointer font-medium">
                  {selectedPosts.length > 0
                    ? `${selectedPosts.length} selected`
                    : 'Select All'}
                </Label>
              </div>

              {selectedPosts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve ({selectedPosts.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('reject')}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject ({selectedPosts.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('delete')}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedPosts.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {pendingPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground mb-4">
              No posts are currently pending review. Great job keeping up with the content!
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingPosts.map((post) => (
            <Card key={post._id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm ${selectedPosts.includes(post._id) ? 'border-primary' : 'border-transparent hover:border-primary/20'}`}>
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Selection Checkbox */}
                  <div className="flex items-center justify-center p-4 border-r">
                    <Checkbox
                      checked={selectedPosts.includes(post._id)}
                      onCheckedChange={() => togglePostSelection(post._id)}
                      id={`select-${post._id}`}
                    />
                  </div>

                  {/* Post Image */}
                  <div className="lg:w-64 h-48 lg:h-auto relative bg-muted flex-shrink-0">
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

                  {/* Post Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Review
                          </Badge>
                          <Badge style={{ backgroundColor: post.category?.color }}>
                            {post.category?.name}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Author and Meta Info */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            {post.author?.profilePictureUrl ? (
                              <Image
                                src={post.author.profilePictureUrl}
                                alt={post.author.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                            )}
                            <span>by {post.author?.name}</span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readingTime} min read
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => handleApprove(post._id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Publish
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => openRejectDialog(post)}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/posts/${post._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Link>
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/posts/${post._id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDelete(post._id, post.title)}
                        disabled={actionLoading}
                        className="text-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

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
      )}

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &quot;{selectedPost?.title}&quot;.
              This will help the author understand what needs to be improved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this post is being rejected and what the author should do to improve it..."
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      {/* Bulk Action Confirmation Dialog */}
      <BulkConfirmDialog
        open={showBulkConfirm}
        onOpenChange={setShowBulkConfirm}
        onConfirm={executeBulkAction}
        action={bulkActionType}
        count={selectedPosts.length}
        itemType="posts"
        loading={actionLoading}
      />
    </div>
  )
}