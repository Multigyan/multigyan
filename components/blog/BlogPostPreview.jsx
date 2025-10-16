"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, Tag, Clock, Eye, X } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'

/**
 * BlogPostPreview Component
 * 
 * Shows a real-time preview of how the blog post will look when published
 * Includes:
 * - Featured image
 * - Title and metadata
 * - Content with formatting
 * - Tags
 * - Author info
 */

export default function BlogPostPreview({ 
  isOpen, 
  onClose, 
  postData,
  author
}) {
  // Calculate reading time (rough estimate: 200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return 0
    try {
      const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
      const wordCount = text.split(/\s+/).length
      return Math.ceil(wordCount / 200)
    } catch (error) {
      console.error('Error calculating reading time:', error)
      return 0
    }
  }

  const readingTime = calculateReadingTime(postData?.content)
  
  // Safe date formatting
  const formatDate = () => {
    try {
      return format(new Date(), 'MMM dd, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return new Date().toLocaleDateString()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vh] max-h-[90vh] overflow-y-auto p-0 lg:max-w-7xl">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <DialogTitle>Preview Post</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This is how your blog post will appear to readers
          </p>
        </DialogHeader>

        {/* Preview Content */}
        <div className="px-6 pb-6">
          {/* Featured Image */}
          {postData?.featuredImageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 border border-border bg-muted">
              <Image
                src={postData.featuredImageUrl}
                alt={postData.featuredImageAlt || 'Featured image'}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  console.error('Error loading featured image:', postData.featuredImageUrl)
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Category Badge */}
          {postData?.categoryName && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">
                {postData.categoryName}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground leading-tight">
            {postData?.title || 'Untitled Post'}
          </h1>

          {/* Excerpt */}
          {postData?.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">
              {postData.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            {/* Author */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{author?.name || 'Your Name'}</span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate()}</span>
            </div>

            {/* Reading Time */}
            {readingTime > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </>
            )}
          </div>

          <Separator className="my-6" />

          {/* Content */}
          <div 
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-bold
              prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-img:rounded-lg prose-img:border prose-img:border-border
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4
              prose-ul:text-foreground prose-ol:text-foreground
              prose-li:text-foreground"
            dangerouslySetInnerHTML={{ 
              __html: postData?.content || '<p>No content yet. Start writing!</p>' 
            }}
            suppressHydrationWarning
          />

          {/* Tags */}
          {postData?.tags && postData.tags.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex flex-wrap gap-2">
                  {postData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Author Card */}
          <Separator className="my-8" />
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            {author?.image && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={author.image}
                  alt={author.name || 'Author'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                Written by {author?.name || 'You'}
              </p>
              {author?.bio && (
                <p className="text-sm text-muted-foreground mt-1">
                  {author.bio}
                </p>
              )}
            </div>
          </div>

          {/* Preview Notice */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> This is a preview. 
              The actual published post may look slightly different depending on your theme and settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
