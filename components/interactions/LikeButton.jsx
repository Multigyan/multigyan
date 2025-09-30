"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * Reusable Like Component for Posts and Comments
 * 
 * @param {Object} props
 * @param {string} props.type - 'post' or 'comment'
 * @param {string} props.targetId - ID of the post or comment
 * @param {string} props.postId - Required for comments, ID of the parent post
 * @param {Array} props.initialLikes - Array of user IDs who liked
 * @param {boolean} props.initialIsLiked - Whether current user has liked
 * @param {Function} props.onLikeChange - Callback when like status changes
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.variant - 'button' | 'icon' | 'minimal'
 * @param {boolean} props.showCount - Whether to show like count
 * @param {boolean} props.disabled - Whether the component is disabled
 * @param {string} props.className - Additional CSS classes
 */

export default function LikeButton({
  type = 'post', // 'post' or 'comment'
  targetId,
  postId, // Required for comments
  initialLikes = [],
  initialIsLiked = false,
  onLikeChange,
  size = 'md',
  variant = 'button',
  showCount = true,
  disabled = false,
  className,
  animated = true,
  requireAuth = true
}) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikes.length || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Update when props change
  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikeCount(initialLikes.length || 0)
  }, [initialIsLiked, initialLikes])

  // Check if user has liked based on session
  useEffect(() => {
    if (session?.user?.id && initialLikes) {
      setIsLiked(initialLikes.includes(session.user.id))
    }
  }, [session?.user?.id, initialLikes])

  const handleLike = async () => {
    if (requireAuth && !session) {
      toast.error(`Please sign in to like ${type}s`)
      return
    }

    if (disabled || isLoading) return

    // Optimistic update
    const newIsLiked = !isLiked
    const newCount = newIsLiked ? likeCount + 1 : likeCount - 1
    
    setIsLiked(newIsLiked)
    setLikeCount(newCount)
    setIsLoading(true)

    // Trigger animation
    if (animated && newIsLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }

    try {
      let response
      
      if (type === 'post') {
        // Handle post likes
        response = await fetch(`/api/posts/${targetId}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: newIsLiked ? 'like' : 'unlike' })
        })
      } else if (type === 'comment') {
        // Handle comment likes
        if (!postId) {
          throw new Error('postId is required for comment likes')
        }
        
        response = await fetch('/api/comments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            commentId: targetId,
            action: 'like'
          })
        })
      }

      if (response && response.ok) {
        const data = await response.json()
        
        // Update with server response if available
        if (data.likeCount !== undefined) {
          setLikeCount(data.likeCount)
        }
        if (data.isLiked !== undefined) {
          setIsLiked(data.isLiked)
        }

        // Call callback if provided
        if (onLikeChange) {
          onLikeChange({
            isLiked: newIsLiked,
            likeCount: data.likeCount || newCount,
            targetId,
            type
          })
        }

        // Show success toast
        toast.success(
          newIsLiked 
            ? `${type.charAt(0).toUpperCase() + type.slice(1)} liked!` 
            : `Like removed`
        )
      } else {
        // Revert optimistic update on error
        setIsLiked(!newIsLiked)
        setLikeCount(newIsLiked ? likeCount - 1 : likeCount + 1)
        
        const error = response ? await response.json() : {}
        toast.error(error.error || `Failed to ${newIsLiked ? 'like' : 'unlike'} ${type}`)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newIsLiked)
      setLikeCount(newIsLiked ? likeCount - 1 : likeCount + 1)
      
      console.error(`Error ${newIsLiked ? 'liking' : 'unliking'} ${type}:`, error)
      toast.error(`Failed to ${newIsLiked ? 'like' : 'unlike'} ${type}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-3 w-3',
      button: 'text-xs px-2 py-1',
      text: 'text-xs'
    },
    md: {
      icon: 'h-4 w-4',
      button: 'text-sm px-3 py-2',
      text: 'text-sm'
    },
    lg: {
      icon: 'h-5 w-5',
      button: 'text-base px-4 py-2',
      text: 'text-base'
    }
  }

  // Variant configurations
  const getVariantClasses = () => {
    switch (variant) {
      case 'icon':
        return cn(
          'p-2 rounded-full hover:bg-muted transition-colors',
          isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
        )
      case 'minimal':
        return cn(
          'p-1 hover:bg-muted/50 rounded transition-colors',
          isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
        )
      case 'button':
      default:
        return cn(
          'gap-2',
          isLiked 
            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400' 
            : 'hover:bg-muted'
        )
    }
  }

  const heartClasses = cn(
    sizeConfig[size].icon,
    isLiked && 'fill-current',
    isAnimating && animated && 'animate-bounce',
    isLoading && 'opacity-50'
  )

  const buttonClasses = cn(
    getVariantClasses(),
    variant === 'button' && sizeConfig[size].button,
    disabled && 'opacity-50 cursor-not-allowed',
    'transition-all duration-200',
    className
  )

  const content = (
    <>
      {isLoading && variant !== 'minimal' ? (
        <Loader2 className={cn(sizeConfig[size].icon, 'animate-spin')} />
      ) : (
        <Heart className={heartClasses} />
      )}
      {showCount && (
        <span className={cn(sizeConfig[size].text, 'font-medium')}>
          {likeCount}
          {variant === 'button' && (
            <span className="ml-1 hidden sm:inline">
              {likeCount === 1 ? 'Like' : 'Likes'}
            </span>
          )}
        </span>
      )}
    </>
  )

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLike}
        disabled={disabled || isLoading}
        className={buttonClasses}
        title={isLiked ? `Unlike this ${type}` : `Like this ${type}`}
        aria-label={isLiked ? `Unlike this ${type}` : `Like this ${type}`}
      >
        {content}
      </button>
    )
  }

  return (
    <Button
      variant={variant === 'icon' ? 'ghost' : (isLiked ? 'default' : 'outline')}
      size={size}
      onClick={handleLike}
      disabled={disabled || isLoading}
      className={buttonClasses}
      title={isLiked ? `Unlike this ${type}` : `Like this ${type}`}
      aria-label={isLiked ? `Unlike this ${type}` : `Like this ${type}`}
    >
      {content}
    </Button>
  )
}

// Export additional utility functions for like management
export const useLikeUtils = () => {
  const { data: session } = useSession()

  const checkIsLiked = (likes = [], userId = session?.user?.id) => {
    return userId ? likes.includes(userId) : false
  }

  const optimisticLikeUpdate = (currentLikes = [], userId = session?.user?.id, action = 'toggle') => {
    if (!userId) return { likes: currentLikes, isLiked: false }

    const isCurrentlyLiked = currentLikes.includes(userId)
    let newLikes = [...currentLikes]

    if (action === 'toggle') {
      if (isCurrentlyLiked) {
        newLikes = newLikes.filter(id => id !== userId)
      } else {
        newLikes.push(userId)
      }
    } else if (action === 'like' && !isCurrentlyLiked) {
      newLikes.push(userId)
    } else if (action === 'unlike' && isCurrentlyLiked) {
      newLikes = newLikes.filter(id => id !== userId)
    }

    return {
      likes: newLikes,
      isLiked: newLikes.includes(userId),
      count: newLikes.length
    }
  }

  return {
    checkIsLiked,
    optimisticLikeUpdate,
    userId: session?.user?.id
  }
}

// Quick-use components for common scenarios
export const PostLikeButton = (props) => (
  <LikeButton 
    type="post" 
    variant="button"
    size="md"
    showCount={true}
    {...props} 
  />
)

export const CommentLikeButton = (props) => (
  <LikeButton 
    type="comment" 
    variant="minimal"
    size="sm"
    showCount={true}
    {...props} 
  />
)

export const QuickLikeIcon = (props) => (
  <LikeButton 
    variant="icon"
    size="md"
    showCount={false}
    animated={true}
    {...props} 
  />
)