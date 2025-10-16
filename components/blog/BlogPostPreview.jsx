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
 * ✅ MATCHES EXACT CSS FROM BlogPostClient.jsx
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
            This is how your blog post will appear to readers (exact CSS match)
          </p>
        </DialogHeader>

        {/* Preview Content - MATCHES BlogPostClient.jsx EXACTLY */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="lg:w-2/3">
              {/* Category Badge */}
              {postData?.categoryName && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {postData.categoryName}
                  </Badge>
                </div>
              )}

              {/* Title */}
              <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
                  {postData?.title || 'Untitled Post'}
                </h1>

                {/* Excerpt */}
                {postData?.excerpt && (
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    {postData.excerpt}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              </header>

              {/* Featured Image */}
              {postData?.featuredImageUrl && (
                <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={postData.featuredImageUrl}
                    alt={postData.featuredImageAlt || 'Featured image'}
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                    priority
                    onError={(e) => {
                      console.error('Error loading featured image:', postData.featuredImageUrl)
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Blog Content - EXACT CSS FROM BlogPostClient.jsx */}
              <div className="blog-content mb-8 sm:mb-12">
                <style jsx global>{`
                  .blog-content {
                    font-size: 0.938rem;
                    line-height: 1.7;
                    color: var(--foreground);
                  }

                  @media (min-width: 640px) {
                    .blog-content {
                      font-size: 1.063rem;
                      line-height: 1.8;
                    }
                  }

                  .blog-content h1 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    line-height: 1.3;
                    color: var(--foreground);
                  }

                  @media (min-width: 640px) {
                    .blog-content h1 {
                      font-size: 2.5rem;
                      margin-top: 2.5rem;
                      margin-bottom: 1.5rem;
                      line-height: 1.2;
                    }
                  }

                  .blog-content h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-top: 1.75rem;
                    margin-bottom: 1rem;
                    line-height: 1.3;
                    color: var(--foreground);
                    border-bottom: 2px solid var(--border);
                    padding-bottom: 0.5rem;
                  }

                  @media (min-width: 640px) {
                    .blog-content h2 {
                      font-size: 2rem;
                      margin-top: 2rem;
                      margin-bottom: 1.25rem;
                    }
                  }

                  .blog-content h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.4;
                    color: var(--foreground);
                  }

                  @media (min-width: 640px) {
                    .blog-content h3 {
                      font-size: 1.5rem;
                      margin-top: 1.75rem;
                      margin-bottom: 1rem;
                    }
                  }

                  .blog-content h4 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.625rem;
                    line-height: 1.5;
                    color: var(--foreground);
                  }

                  @media (min-width: 640px) {
                    .blog-content h4 {
                      font-size: 1.25rem;
                      margin-top: 1.5rem;
                      margin-bottom: 0.75rem;
                    }
                  }

                  .blog-content h5 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.5;
                    color: var(--foreground);
                  }

                  .blog-content h6 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.5;
                    color: var(--foreground);
                  }

                  .blog-content p {
                    margin-bottom: 1.25rem;
                    line-height: 1.7;
                  }

                  @media (min-width: 640px) {
                    .blog-content p {
                      margin-bottom: 1.5rem;
                      line-height: 1.8;
                    }
                  }

                  .blog-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                  }

                  @media (min-width: 640px) {
                    .blog-content img {
                      margin: 2rem 0;
                    }
                  }

                  .blog-content a {
                    color: var(--primary);
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    transition: all 0.2s;
                    word-break: break-word;
                  }

                  @media (min-width: 640px) {
                    .blog-content a {
                      text-underline-offset: 4px;
                    }
                  }

                  .blog-content a:hover {
                    text-decoration-thickness: 2px;
                  }

                  .blog-content strong, .blog-content b {
                    font-weight: 700;
                    color: var(--foreground);
                  }

                  .blog-content em, .blog-content i {
                    font-style: italic;
                  }

                  .blog-content u {
                    text-decoration: underline;
                  }

                  .blog-content s, .blog-content strike {
                    text-decoration: line-through;
                  }

                  .blog-content ul,
                  .blog-content ol {
                    margin: 1.25rem 0;
                    padding-left: 1.5rem;
                  }

                  @media (min-width: 640px) {
                    .blog-content ul,
                    .blog-content ol {
                      margin: 1.5rem 0;
                      padding-left: 2rem;
                    }
                  }

                  .blog-content ul {
                    list-style-type: disc;
                  }

                  .blog-content ol {
                    list-style-type: decimal;
                  }

                  .blog-content li {
                    margin-bottom: 0.625rem;
                    line-height: 1.7;
                  }

                  @media (min-width: 640px) {
                    .blog-content li {
                      margin-bottom: 0.75rem;
                      line-height: 1.8;
                    }
                  }

                  .blog-content li::marker {
                    color: var(--primary);
                    font-weight: 600;
                  }

                  .blog-content table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 1.5rem 0;
                    overflow-x: auto;
                    display: block;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                    font-size: 0.813rem;
                  }

                  @media (min-width: 640px) {
                    .blog-content table {
                      margin: 2rem 0;
                      display: table;
                      font-size: 0.938rem;
                    }
                  }

                  .blog-content blockquote {
                    border-left: 4px solid var(--primary);
                    padding: 1rem;
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: var(--muted-foreground);
                    background: var(--muted);
                    border-radius: 0.5rem;
                  }

                  @media (min-width: 640px) {
                    .blog-content blockquote {
                      padding: 1.5rem;
                      padding-left: 1.5rem;
                      margin: 2rem 0;
                    }
                  }

                  .blog-content code {
                    background: var(--muted);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-family: 'Courier New', monospace;
                    font-size: 0.875em;
                    color: var(--primary);
                    border: 1px solid var(--border);
                    word-break: break-word;
                  }

                  .blog-content pre {
                    background: var(--muted);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                    border: 1px solid var(--border);
                  }

                  @media (min-width: 640px) {
                    .blog-content pre {
                      padding: 1.5rem;
                      margin: 2rem 0;
                    }
                  }

                  .blog-content pre code {
                    background: none;
                    padding: 0;
                    border: none;
                    color: var(--foreground);
                  }

                  .blog-content hr {
                    margin: 2rem 0;
                    border: none;
                    border-top: 2px solid var(--border);
                  }

                  @media (min-width: 640px) {
                    .blog-content hr {
                      margin: 3rem 0;
                    }
                  }

                  /* YouTube embeds */
                  .blog-content iframe {
                    max-width: 100%;
                    border-radius: 0.5rem;
                    margin: 1.5rem 0;
                  }

                  @media (min-width: 640px) {
                    .blog-content iframe {
                      margin: 2rem 0;
                    }
                  }
                `}</style>
                <div 
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: postData?.content || '<p>No content yet. Start writing!</p>' 
                  }}
                  suppressHydrationWarning
                />
              </div>

              {/* Tags */}
              {postData?.tags && postData.tags.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex flex-wrap gap-2">
                      {postData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
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
                  <span className="font-semibold text-foreground">✅ Preview Match:</span> This preview uses the exact same CSS as the published blog post, so what you see here is exactly what readers will see.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
