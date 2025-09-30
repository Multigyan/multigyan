"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Heart, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import LikeButton from './LikeButton'

/**
 * Enhanced Like Button with Who Liked Feature
 * Shows a popover with users who liked the content
 */
export default function LikeButtonWithUsers({ 
  targetId, 
  type = 'post',
  postId, 
  initialLikes = [],
  onLikeChange,
  showUsersWhoLiked = true,
  maxDisplayUsers = 10
}) {
  const [showLikers, setShowLikers] = useState(false)
  const [likers, setLikers] = useState([])
  const [loadingLikers, setLoadingLikers] = useState(false)

  const fetchLikers = async () => {
    if (likers.length > 0) return // Already loaded
    
    setLoadingLikers(true)
    try {
      const endpoint = type === 'post' 
        ? `/api/posts/${targetId}/likers`
        : `/api/comments/${targetId}/likers?postId=${postId}`
        
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setLikers(data.likers || [])
      }
    } catch (error) {
      console.error('Error fetching likers:', error)
    } finally {
      setLoadingLikers(false)
    }
  }

  const handleShowLikers = () => {
    if (initialLikes.length === 0) return
    fetchLikers()
    setShowLikers(true)
  }

  const renderLikersList = () => {
    if (loadingLikers) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          ))}
        </div>
      )
    }

    const displayLikers = likers.slice(0, maxDisplayUsers)
    const remainingCount = Math.max(0, likers.length - maxDisplayUsers)

    return (
      <div className="space-y-2">
        {displayLikers.map((liker) => (
          <div key={liker._id} className="flex items-center gap-2">
            {liker.profilePictureUrl ? (
              <Image
                src={liker.profilePictureUrl}
                alt={liker.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            )}
            <Link 
              href={`/author/${liker._id}`}
              className="font-medium text-sm hover:text-primary"
            >
              {liker.name}
            </Link>
            {liker.role === 'admin' && (
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            and {remainingCount} more {remainingCount === 1 ? 'person' : 'people'}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Main Like Button */}
      <LikeButton
        type={type}
        targetId={targetId}
        postId={postId}
        initialLikes={initialLikes}
        onLikeChange={onLikeChange}
        variant="button"
        size="md"
      />

      {/* Who Liked Popover */}
      {showUsersWhoLiked && initialLikes.length > 0 && (
        <Popover open={showLikers} onOpenChange={setShowLikers}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowLikers}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {initialLikes.length} {initialLikes.length === 1 ? 'like' : 'likes'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Who liked this {type}
              </h4>
              {renderLikersList()}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
