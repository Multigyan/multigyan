"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  User, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

export default function CommentsList({ postId, allowComments = true }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [moderating, setModerating] = useState(null)

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()
      
      if (response.ok) {
        // Show all comments for admins, only approved for others
        const filteredComments = session?.user?.role === 'admin' 
          ? data.comments 
          : data.comments.filter(comment => comment.isApproved)
        setComments(filteredComments)
      } else {
        toast.error('Failed to load comments')
      }
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleModerateComment = async (commentId, action) => {
    if (!session?.user?.role === 'admin') return
    
    setModerating(commentId)
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })
      
      if (response.ok) {
        toast.success(`Comment ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        fetchComments() // Refresh comments
      } else {
        toast.error('Failed to moderate comment')
      }
    } catch (error) {
      toast.error('Failed to moderate comment')
    } finally {
      setModerating(null)
    }
  }

  const handleReportComment = async (commentId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/report`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        toast.success('Comment reported successfully')
        fetchComments() // Refresh to update report count
      } else {
        toast.error('Failed to report comment')
      }
    } catch (error) {
      toast.error('Failed to report comment')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-shimmer h-24 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (!allowComments) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Comments are disabled for this post.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment._id} className={`${
              comment.isReported && session?.user?.role === 'admin' 
                ? 'border-destructive/50 bg-destructive/5' 
                : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    {comment.user?.profilePictureUrl ? (
                      <img 
                        src={comment.user.profilePictureUrl} 
                        alt={comment.user?.name || comment.guestName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {comment.user?.name || comment.guestName}
                      </span>
                      
                      {!comment.user && (
                        <Badge variant="outline" className="text-xs">
                          Guest
                        </Badge>
                      )}
                      
                      {session?.user?.role === 'admin' && (
                        <>
                          {!comment.isApproved && (
                            <Badge variant="secondary" className="text-xs">
                              Pending Approval
                            </Badge>
                          )}
                          
                          {comment.isReported && (
                            <Badge variant="destructive" className="text-xs">
                              Reported ({comment.reportCount})
                            </Badge>
                          )}
                        </>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {comment.text}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {/* Admin moderation controls */}
                      {session?.user?.role === 'admin' && !comment.isApproved && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateComment(comment._id, 'approve')}
                            disabled={moderating === comment._id}
                            className="h-7 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateComment(comment._id, 'reject')}
                            disabled={moderating === comment._id}
                            className="h-7 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {/* Report button for non-admin users */}
                      {session?.user && session.user.role !== 'admin' && comment.isApproved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReportComment(comment._id)}
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}