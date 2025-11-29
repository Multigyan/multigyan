"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  User,
  Check,
  X,
  Search,
  Filter,
  Eye,
  Trash2,
  Flag,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export default function AdminCommentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedComments, setSelectedComments] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    reported: 0
  })

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchCommentsAndPosts()
  }, [session, router])

  // Set page title
  useEffect(() => {
    document.title = "Comment Management | Multigyan"
  }, [])

  const fetchCommentsAndPosts = async () => {
    try {
      setLoading(true)

      // Fetch posts with comment stats
      const postsResponse = await fetch('/api/posts?includeComments=true')
      const postsData = await postsResponse.json()

      if (postsResponse.ok) {
        const postsWithComments = postsData.posts || []
        setPosts(postsWithComments)

        // Extract all comments and flatten them
        const allComments = []
        let statsCount = { total: 0, pending: 0, approved: 0, reported: 0 }

        postsWithComments.forEach(post => {
          if (post.comments && post.comments.length > 0) {
            post.comments.forEach(comment => {
              const commentWithPost = {
                ...comment,
                postTitle: post.title,
                postSlug: post.slug,
                postId: post._id
              }
              allComments.push(commentWithPost)

              // Count stats
              statsCount.total++
              if (comment.isApproved) {
                statsCount.approved++
              } else if (comment.isReported) {
                statsCount.reported++
              } else {
                statsCount.pending++
              }
            })
          }
        })

        // Sort by newest first
        allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setComments(allComments)
        setStats(statsCount)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAction = async (commentId, postId, action) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId,
          action
        })
      })

      if (response.ok) {
        await fetchCommentsAndPosts() // Refresh data
        toast.success(`Comment ${action}d successfully`)
      } else {
        const data = await response.json()
        toast.error(data.error || `Failed to ${action} comment`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} comment`)
    }
  }

  const handleDeleteComment = async (commentId, postId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments?postId=${postId}&commentId=${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCommentsAndPosts()
        toast.success('Comment deleted successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedComments.length === 0) {
      toast.error('Please select comments first')
      return
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedComments.length} comment(s)?`)) {
      return
    }

    try {
      const promises = selectedComments.map(({ commentId, postId }) => {
        if (action === 'delete') {
          return fetch(`/api/comments?postId=${postId}&commentId=${commentId}`, {
            method: 'DELETE'
          })
        } else {
          return fetch('/api/comments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId,
              commentId,
              action
            })
          })
        }
      })

      await Promise.all(promises)
      setSelectedComments([])
      await fetchCommentsAndPosts()
      toast.success(`${selectedComments.length} comment(s) ${action}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${action} comments`)
    }
  }

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      (activeTab === 'pending' && !comment.isApproved && !comment.isReported) ||
      (activeTab === 'approved' && comment.isApproved) ||
      (activeTab === 'reported' && comment.isReported) ||
      (activeTab === 'all')

    return matchesSearch && matchesTab
  })

  const toggleCommentSelection = (commentId, postId) => {
    setSelectedComments(prev => {
      const exists = prev.find(item => item.commentId === commentId)
      if (exists) {
        return prev.filter(item => item.commentId !== commentId)
      } else {
        return [...prev, { commentId, postId }]
      }
    })
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-blue-500" />
            Comment Management
          </h1>
          <p className="text-muted-foreground">
            Moderate and manage all comments across your platform
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reported</p>
                <p className="text-2xl font-bold text-red-600">{stats.reported}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments, authors, or posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedComments.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline">
                  {selectedComments.length} selected
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="reported" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Reported ({stats.reported})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : filteredComments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No comments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No comments match the current filter'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <Card key={comment._id} className={`${!comment.isApproved && !comment.isReported ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20' : ''} ${comment.isReported ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedComments.some(item => item.commentId === comment._id)}
                          onChange={() => toggleCommentSelection(comment._id, comment.postId)}
                          className="mt-1"
                        />

                        {/* Author Avatar */}
                        <div className="flex-shrink-0">
                          {comment.author?.profilePictureUrl ? (
                            <Image
                              src={comment.author.profilePictureUrl}
                              alt={comment.authorName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{comment.authorName || 'Anonymous'}</span>
                            {comment.author ? (
                              <Badge variant="outline" className="text-xs">User</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Guest</Badge>
                            )}
                            {!comment.isApproved && !comment.isReported && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            )}
                            {comment.isApproved && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Approved
                              </Badge>
                            )}
                            {comment.isReported && (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                Reported
                              </Badge>
                            )}
                          </div>

                          <p className="text-foreground mb-2 line-clamp-3">
                            {comment.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              On: <Link href={`/blog/${comment.postSlug}`} className="text-primary hover:underline">
                                {comment.postTitle}
                              </Link>
                            </span>
                            <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                            {comment.likes?.length > 0 && (
                              <span>{comment.likes.length} likes</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <Link href={`/blog/${comment.postSlug}#comment-${comment._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        {!comment.isApproved && !comment.isReported && (
                          <Button
                            size="sm"
                            onClick={() => handleCommentAction(comment._id, comment.postId, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteComment(comment._id, comment.postId)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
