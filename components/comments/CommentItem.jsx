"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Reply, 
  MoreHorizontal, 
  User, 
  Check, 
  X, 
  Edit, 
  Trash2,
  Flag,
  Clock,
  Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import CommentForm from './CommentForm'
import { toast } from 'sonner'
import { CommentLikeButton } from '@/components/interactions/LikeButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function CommentItem({ 
  comment, 
  postId, 
  onUpdate, 
  showUnapproved = false,
  isReply = false 
}) {
  const { data: session } = useSession()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const isAdmin = session?.user?.role === 'admin'
  const isAuthor = session?.user?.id === comment.author?._id
  const canEdit = isAuthor || isAdmin
  const canDelete = isAdmin
  const canApprove = isAdmin && !comment.isApproved

  // Handle like change callback
  const handleLikeChange = (likeData) => {
    // Refresh the comments when like status changes
    onUpdate()
  }

  // Handle approve comment
  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId: comment._id,
          action: 'approve'
        })
      })

      if (response.ok) {
        onUpdate()
        toast.success('Comment approved')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to approve comment')
      }
    } catch (error) {
      toast.error('Failed to approve comment')
    } finally {
      setIsApproving(false)
    }
  }

  // Handle delete comment
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments?postId=${postId}&commentId=${comment._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
        toast.success('Comment deleted')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  // Handle report comment
  const handleReport = async () => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId: comment._id,
          action: 'report'
        })
      })

      if (response.ok) {
        onUpdate()
        toast.success('Comment reported')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to report comment')
      }
    } catch (error) {
      toast.error('Failed to report comment')
    }
  }

  const handleReplyAdded = () => {
    setShowReplyForm(false)
    onUpdate()
  }

  const authorName = comment.author?.name || comment.guestName || 'Anonymous'
  const authorImage = comment.author?.profilePictureUrl
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  return (
    <div className={`${isReply ? 'ml-8' : ''}`}>
      <Card className={`${!comment.isApproved && showUnapproved ? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}`}>
        <CardContent className="p-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Author Avatar */}
              <div className="relative">
                {authorImage ? (
                  <Image
                    src={authorImage}
                    alt={authorName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                {comment.author?.role === 'admin' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{authorName}</span>
                  {comment.author?.role === 'admin' && (
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  )}
                  {!comment.author && (
                    <Badge variant="outline" className="text-xs">Guest</Badge>
                  )}
                  {!comment.isApproved && showUnapproved && (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  )}
                  {comment.isEdited && (
                    <Badge variant="outline" className="text-xs">Edited</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo}</span>
                  {comment.isEdited && comment.editedAt && (
                    <span>• edited {formatDistanceToNow(new Date(comment.editedAt), { addSuffix: true })}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canApprove && (
                  <>
                    <DropdownMenuItem onClick={handleApprove} disabled={isApproving}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve Comment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canEdit && (
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Comment
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Comment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {!isAuthor && session && (
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report Comment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Comment Content */}
          <div className="mb-4">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <CommentLikeButton
              targetId={comment._id}
              postId={postId}
              initialLikes={comment.likes || []}
              initialIsLiked={session?.user?.id && comment.likes?.includes(session.user.id)}
              onLikeChange={handleLikeChange}
              disabled={!comment.isApproved && !isAdmin}
            />


            {/* Reply Button */}
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}

            {/* Show/Hide Replies */}
            {!isReply && comment.replies?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 pt-4 border-t">
              <CommentForm
                postId={postId}
                parentComment={comment._id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${authorName}...`}
                compact={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replies */}
      {!isReply && showReplies && comment.replies?.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              onUpdate={onUpdate}
              showUnapproved={showUnapproved}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
