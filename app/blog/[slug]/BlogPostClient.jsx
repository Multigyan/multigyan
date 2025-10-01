"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  MessageCircle,
  ArrowLeft,
  BookOpen,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Share2
} from "lucide-react"
import { formatDate } from "@/lib/helpers"
import { toast } from "sonner"
import CommentSection from "@/components/comments/CommentSection"
import { PostLikeButton } from "@/components/interactions/LikeButton"

export default function BlogPostClient({ post }) {
  const { data: session } = useSession()
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (post) {
      fetchRelatedPosts()
      setLoading(false)
    }
  }, [post])

  const fetchRelatedPosts = async () => {
    if (post.author?._id) {
      try {
        // Fetch posts by same author
        const response = await fetch(`/api/posts?status=published&author=${post.author._id}&limit=4`)
        const data = await response.json()
        
        if (response.ok) {
          const filtered = data.posts?.filter(p => p._id !== post._id) || []
          setRelatedPosts(filtered.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching related posts:', error)
      }
    }
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const title = post.title
    const text = post.excerpt

    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard!')
          return
        } catch (error) {
          toast.error('Failed to copy link')
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <article className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
              <span>/</span>
              <Link href={`/category/${post.category?.slug}`} className="hover:text-foreground">
                {post.category?.name}
              </Link>
              <span>/</span>
              <span className="text-foreground">{post.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge style={{ backgroundColor: post.category?.color }}>
                  {post.category?.name}
                </Badge>
                {post.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
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
                  <span className="font-medium">
                    <Link href={`/author/${post.author?.username}`} className="hover:text-foreground">
                      {post.author?.name}
                    </Link>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div 
                className="text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Actions */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <PostLikeButton
                  targetId={post._id}
                  initialLikes={post.likes || []}
                  initialIsLiked={session?.user?.id && post.likes?.includes(session.user.id)}
                  size="md"
                  animated={true}
                />

                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments?.filter(c => c.isApproved).length || 0} Comments
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('linkedin')}
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                  className="text-green-600 hover:text-green-700"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('copy')}
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Author Bio */}
            <Card className="mb-12">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {post.author?.profilePictureUrl ? (
                      <Image
                        src={post.author.profilePictureUrl}
                        alt={post.author.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/author/${post.author?.username}`} className="hover:text-primary">
                        {post.author?.name}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground">
                      {post.author?.bio || 'No bio available.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* More Posts by Author */}
            {relatedPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  More from {post.author?.name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explore other articles by this author
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost._id} className="blog-card">
                      <div className="relative h-40">
                        {relatedPost.featuredImageUrl ? (
                          <Image
                            src={relatedPost.featuredImageUrl}
                            alt={relatedPost.featuredImageAlt || relatedPost.title}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center rounded-t-lg">
                            <BookOpen className="h-8 w-8 text-primary/60" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <Badge size="sm" className="mb-2" style={{ backgroundColor: relatedPost.category?.color }}>
                          {relatedPost.category?.name}
                        </Badge>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          <Link href={`/blog/${relatedPost.slug}`} className="hover:text-primary">
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(relatedPost.publishedAt)}</span>
                          <span>•</span>
                          <span>{relatedPost.readingTime} min</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Enhanced Comment Section */}
            <section className="mt-16">
              <Separator className="mb-8" />
              
              <CommentSection 
                postId={post._id} 
                allowComments={post.allowComments}
                showStats={true}
              />
            </section>

            {/* Back to Blog */}
            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
