"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Users, Clock, Shield } from 'lucide-react'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import { toast } from 'sonner'

export default function CommentSection({ postId, allowComments = true, showStats = true }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    reported: 0,
    topLevel: 0,
    replies: 0,
    totalLikes: 0
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showUnapproved, setShowUnapproved] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId, showUnapproved])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?postId=${postId}&includeUnapproved=${showUnapproved}`)
      const data = await response.json()
      
      if (response.ok) {
        setComments(data.comments || [])
        setStats(data.stats || stats)
      } else {
        toast.error(data.error || 'Failed to load comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAdded = (newComment, needsApproval) => {
    if (needsApproval && !isAdmin) {
      toast.success('Comment submitted for approval')
      // Don't add to list if it needs approval and user is not admin
      fetchComments() // Refresh to update stats
    } else {
      // Add comment to the list immediately
      setComments(prev => [newComment, ...prev])
      toast.success('Comment added successfully')
    }
    setShowForm(false)
  }

  const handleCommentUpdated = () => {
    fetchComments() // Refresh comments after any update
  }

  if (!allowComments) {
    return (
      <Card className="mt-8">
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Comments are disabled for this post.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Comment Stats */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments & Discussion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.approved}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.replies}</div>
                <div className="text-sm text-muted-foreground">Replies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalLikes}</div>
                <div className="text-sm text-muted-foreground">Likes</div>
              </div>
              {isAdmin && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              )}
            </div>

            {/* Admin Controls */}
            {isAdmin && stats.pending > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {stats.pending} comment{stats.pending !== 1 ? 's' : ''} awaiting approval
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnapproved(!showUnapproved)}
                  >
                    {showUnapproved ? 'Hide' : 'Show'} Pending
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Comment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Join the Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {session ? 'Add a comment' : 'Add a comment (as guest or login)'}
            </Button>
          ) : (
            <div className="space-y-4">
              <CommentForm
                postId={postId}
                onCommentAdded={handleCommentAdded}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
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
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No comments yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your thoughts on this post!
              </p>
              <Button onClick={() => setShowForm(true)}>
                Start the discussion
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={postId}
                onUpdate={handleCommentUpdated}
                showUnapproved={showUnapproved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More (for future implementation) */}
      {comments.length > 0 && comments.length >= 10 && (
        <div className="text-center">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  )
}
