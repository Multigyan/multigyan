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
import TableOfContents from "@/components/blog/TableOfContents"

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
          {/* Main Container with TOC */}
          <div className="max-w-7xl mx-auto">
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
              <span className="text-foreground truncate">{post.title}</span>
            </nav>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content - 8 columns */}
              <div className="lg:col-span-8">
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

            {/* Featured Image - Original Aspect Ratio */}
            {post.featuredImageUrl && (
              <div className="mb-8 rounded-lg overflow-hidden bg-muted">
                <img
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-auto"
                  loading="eager"
                  style={{ maxHeight: '600px', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Enhanced Content with Better Styling */}
            <div className="blog-content mb-12">
              <style jsx global>{`
                /* Blog Content Styles */
                .blog-content {
                  font-size: 1.125rem;
                  line-height: 1.8;
                  color: var(--foreground);
                }

                /* Headings */
                .blog-content h1 {
                  font-size: 2.5rem;
                  font-weight: 700;
                  margin-top: 2.5rem;
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                  color: var(--foreground);
                }

                .blog-content h2 {
                  font-size: 2rem;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1.25rem;
                  line-height: 1.3;
                  color: var(--foreground);
                  border-bottom: 2px solid var(--border);
                  padding-bottom: 0.5rem;
                }

                .blog-content h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-top: 1.75rem;
                  margin-bottom: 1rem;
                  line-height: 1.4;
                  color: var(--foreground);
                }

                .blog-content h4 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  line-height: 1.5;
                  color: var(--foreground);
                }

                /* Paragraphs */
                .blog-content p {
                  margin-bottom: 1.5rem;
                  line-height: 1.8;
                }

                /* Images in content */
                .blog-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  margin: 2rem 0;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }

                /* Links */
                .blog-content a {
                  color: var(--primary);
                  text-decoration: underline;
                  text-underline-offset: 4px;
                  transition: all 0.2s;
                }

                .blog-content a:hover {
                  color: var(--primary);
                  text-decoration-thickness: 2px;
                }

                /* Lists */
                .blog-content ul,
                .blog-content ol {
                  margin: 1.5rem 0;
                  padding-left: 2rem;
                }

                .blog-content ul {
                  list-style-type: disc;
                }

                .blog-content ol {
                  list-style-type: decimal;
                }

                .blog-content li {
                  margin-bottom: 0.75rem;
                  line-height: 1.8;
                }

                .blog-content li::marker {
                  color: var(--primary);
                  font-weight: 600;
                }

                /* Nested lists */
                .blog-content ul ul,
                .blog-content ol ol,
                .blog-content ul ol,
                .blog-content ol ul {
                  margin: 0.5rem 0;
                }

                /* Tables - Enhanced Design */
                .blog-content table {
                  width: 100%;
                  border-collapse: separate;
                  border-spacing: 0;
                  margin: 2rem 0;
                  overflow: hidden;
                  border-radius: 0.5rem;
                  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                  font-size: 0.95rem;
                }

                .blog-content thead {
                  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
                  color: white;
                }

                .blog-content thead th {
                  padding: 1rem 1.25rem;
                  text-align: left;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  font-size: 0.875rem;
                  border-bottom: 2px solid hsl(var(--primary));
                }

                .blog-content tbody tr {
                  background-color: var(--card);
                  transition: all 0.2s;
                  border-bottom: 1px solid var(--border);
                }

                .blog-content tbody tr:nth-child(even) {
                  background-color: var(--muted);
                }

                .blog-content tbody tr:hover {
                  background-color: hsl(var(--primary) / 0.05);
                  transform: translateX(4px);
                  box-shadow: -4px 0 0 hsl(var(--primary));
                }

                .blog-content tbody td {
                  padding: 1rem 1.25rem;
                  border-bottom: 1px solid var(--border);
                }

                .blog-content tbody tr:last-child td {
                  border-bottom: none;
                }

                /* Blockquotes */
                .blog-content blockquote {
                  border-left: 4px solid var(--primary);
                  padding-left: 1.5rem;
                  margin: 2rem 0;
                  font-style: italic;
                  color: var(--muted-foreground);
                  background: var(--muted);
                  padding: 1.5rem;
                  padding-left: 1.5rem;
                  border-radius: 0.5rem;
                }

                .blog-content blockquote p {
                  margin: 0;
                }

                /* Code blocks */
                .blog-content code {
                  background: var(--muted);
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.25rem;
                  font-family: 'Courier New', monospace;
                  font-size: 0.9em;
                  color: var(--primary);
                  border: 1px solid var(--border);
                }

                .blog-content pre {
                  background: var(--muted);
                  padding: 1.5rem;
                  border-radius: 0.5rem;
                  overflow-x: auto;
                  margin: 2rem 0;
                  border: 1px solid var(--border);
                }

                .blog-content pre code {
                  background: none;
                  padding: 0;
                  border: none;
                  color: var(--foreground);
                }

                /* Strong and emphasis */
                .blog-content strong {
                  font-weight: 700;
                  color: var(--foreground);
                }

                .blog-content em {
                  font-style: italic;
                }

                /* Horizontal rule */
                .blog-content hr {
                  margin: 3rem 0;
                  border: none;
                  border-top: 2px solid var(--border);
                }

                /* Figure and figcaption */
                .blog-content figure {
                  margin: 2rem 0;
                }

                .blog-content figcaption {
                  text-align: center;
                  font-size: 0.9rem;
                  color: var(--muted-foreground);
                  margin-top: 0.75rem;
                  font-style: italic;
                }

                /* Responsive tables */
                @media (max-width: 768px) {
                  .blog-content table {
                    font-size: 0.875rem;
                  }
                  
                  .blog-content thead th,
                  .blog-content tbody td {
                    padding: 0.75rem;
                  }
                }
              `}</style>
              <div 
                className="text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
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
                  title="Share on Twitter"
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('linkedin')}
                  title="Share on LinkedIn"
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                  className="hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('copy')}
                  title="Copy link"
                  className="hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comment Section */}
            <section className="mb-12">
              <CommentSection 
                postId={post._id} 
                allowComments={post.allowComments}
                showStats={true}
              />
            </section>

            <Separator className="my-8" />

            {/* Author Bio */}
            <Card className="mb-12 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {post.author?.profilePictureUrl ? (
                      <Image
                        src={post.author.profilePictureUrl}
                        alt={post.author.name}
                        width={80}
                        height={80}
                        className="rounded-full ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/author/${post.author?.username}`} className="hover:text-primary transition-colors">
                        {post.author?.name}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {post.author?.bio || 'No bio available.'}
                    </p>
                    {post.author?.twitterHandle && (
                      <Link 
                        href={`https://twitter.com/${post.author.twitterHandle}`}
                        target="_blank"
                        className="text-sm text-primary hover:underline"
                      >
                        @{post.author.twitterHandle}
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* More Posts by Author */}
            {relatedPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-2">
                  More from {post.author?.name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explore other articles by this author
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`} className="block">
                      <Card className="blog-card hover:shadow-lg transition-all cursor-pointer group h-full">
                        <div className="relative h-40 overflow-hidden">
                          {relatedPost.featuredImageUrl ? (
                            <Image
                              src={relatedPost.featuredImageUrl}
                              alt={relatedPost.featuredImageAlt || relatedPost.title}
                              fill
                              className="object-cover rounded-t-lg transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center rounded-t-lg">
                              <BookOpen className="h-8 w-8 text-primary/60 transition-transform group-hover:scale-110" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                        </div>
                        <CardContent className="p-4">
                          <Badge size="sm" className="mb-2" style={{ backgroundColor: relatedPost.category?.color }}>
                            {relatedPost.category?.name}
                          </Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <span>{formatDate(relatedPost.publishedAt)}</span>
                            <span>•</span>
                            <span>{relatedPost.readingTime} min</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back to Blog */}
            <div className="text-center mt-12">
              <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>

          {/* TOC Sidebar - 4 columns */}
          <aside className="lg:col-span-4">
            <TableOfContents content={post.content} readingTime={post.readingTime} />
          </aside>
        </div>
      </div>
    </div>
  </article>
</div>
  )
}
