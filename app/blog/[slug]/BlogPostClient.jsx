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
import CodeBlockCopyButton from "@/components/blog/CodeBlockCopyButton"
import AdSense from "@/components/AdSense"
import LanguageSwitcher from "@/components/blog/LanguageSwitcher"
// ✅ NEW: Import modular TOC components
import { useTOC } from "@/hooks/useTOC"
import TOCMobileCollapsible from "@/components/blog/TOCMobileCollapsible"
import TOCMobileFloating from "@/components/blog/TOCMobileFloating"
import TOCDesktopSidebar from "@/components/blog/TOCDesktopSidebar"
// ✅ Import KaTeX CSS for formula rendering
import 'katex/dist/katex.min.css'

export default function BlogPostClient({ post }) {
  const { data: session } = useSession()
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // ✨ State to track live comment stats
  const [commentStats, setCommentStats] = useState({
    approved: post.comments?.filter(c => c.isApproved).length || 0,
    totalLikes: 0
  })

  // ⚡ NEW: Use TOC hook for all TOC functionality
  const { headings, activeId, readingProgress, scrollToHeading, scrollToTop } = useTOC(post.content)

  useEffect(() => {
    if (post) {
      fetchRelatedPosts()
      setLoading(false)
    }
  }, [post])

  const fetchRelatedPosts = async () => {
    if (post.author?._id) {
      try {
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

  // ✨ Callback to update comment stats when they change
  const handleCommentStatsUpdate = (newStats) => {
    setCommentStats({
      approved: newStats.approved || 0,
      totalLikes: newStats.totalLikes || 0
    })
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const title = post.title

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
          toast.success('Link copied!')
          return
        } catch (error) {
          toast.error('Failed to copy')
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  // ✅ SMART AD INSERTION: Insert ad after complete elements (tables, images, headings)
  const insertSmartAd = (content) => {
    // Don't insert if content is too short
    if (content.length < 1000) {
      console.log('⚠️ Content too short for middle ad:', content.length)
      return content
    }

    // Find safe insertion points (after closing tags of block elements)
    const safePoints = [
      { tag: '</table>', weight: 10 },  // Prefer after tables
      { tag: '</figure>', weight: 9 },  // After images
      { tag: '</h2>', weight: 8 },      // After h2 headings
      { tag: '</h3>', weight: 7 },      // After h3 headings
      { tag: '</blockquote>', weight: 6 }, // After blockquotes
      { tag: '</pre>', weight: 5 },     // After code blocks
      { tag: '</ul>', weight: 4 },      // After lists
      { tag: '</ol>', weight: 4 },
      { tag: '</p>', weight: 2 },       // Fallback to paragraphs
    ]

    // Find all safe insertion points with their positions
    const insertionCandidates = []
    safePoints.forEach(({ tag, weight }) => {
      let index = content.indexOf(tag)
      while (index !== -1) {
        insertionCandidates.push({
          position: index + tag.length,
          weight,
          tag
        })
        index = content.indexOf(tag, index + 1)
      }
    })

    if (insertionCandidates.length === 0) {
      console.log('⚠️ No safe insertion points found for middle ad')
      return content
    }

    // Find the insertion point closest to 40% of content
    const targetPosition = content.length * 0.4
    const bestCandidate = insertionCandidates.reduce((best, current) => {
      const currentDistance = Math.abs(current.position - targetPosition)
      const bestDistance = Math.abs(best.position - targetPosition)

      // Prefer closer position, but give bonus to higher weight elements
      const currentScore = currentDistance - (current.weight * 50)
      const bestScore = bestDistance - (best.weight * 50)

      return currentScore < bestScore ? current : best
    })

    console.log('✅ Middle ad will be inserted after:', bestCandidate.tag, 'at position:', bestCandidate.position)

    // Insert ad at the best position with proper AdSense structure
    const adHtml = `
      <div class="my-8 ad-middle-container" style="text-align: center; min-height: 250px;">
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-client="ca-pub-1982960683340318"
             data-ad-slot="2660754715"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
    `

    return (
      content.substring(0, bestCandidate.position) +
      adHtml +
      content.substring(bestCandidate.position)
    )
  }

  // Process content with smart ad insertion
  const processedContent = insertSmartAd(post.content)

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-6 sm:h-8 bg-muted rounded w-1/4 mb-3 sm:mb-4"></div>
            <div className="h-10 sm:h-12 bg-muted rounded w-3/4 mb-3 sm:mb-4"></div>
            <div className="h-48 sm:h-64 bg-muted rounded mb-6 sm:mb-8"></div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-3 sm:h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ✨ Add Code Block Copy Buttons */}
      <CodeBlockCopyButton />

      {/* ⚡ NEW: Mobile Floating TOC Button */}
      <TOCMobileFloating
        headings={headings}
        activeId={activeId}
        readingProgress={readingProgress}
        onItemClick={scrollToHeading}
        scrollToTop={scrollToTop}
      />

      <article className="py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-thin">
              <Link href="/" className="hover:text-foreground whitespace-nowrap">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-foreground whitespace-nowrap">Blog</Link>
              <span>/</span>
              <Link href={`/category/${post.category?.slug}`} className="hover:text-foreground whitespace-nowrap">
                {post.category?.name}
              </Link>
              <span className="hidden sm:inline">/</span>
              <span className="text-foreground truncate hidden sm:inline">{post.title}</span>
            </nav>

            {/* 
              =====================================================================
              MAIN LAYOUT WITH TOC - THIS SECTION CONTAINS ONLY THE MAIN CONTENT
              =====================================================================
            */}
            <div className="lg:flex lg:gap-8 lg:items-stretch">
              {/* Main Content Column - 2/3 width */}
              <div className="lg:w-2/3 lg:flex-shrink-0">
                {/* Category Badge & Language Switcher */}
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge style={{ backgroundColor: post.category?.color }} className="text-xs sm:text-sm">
                      {post.category?.name}
                    </Badge>
                    {post.isFeatured && (
                      <Badge variant="secondary" className="text-xs sm:text-sm">Featured</Badge>
                    )}
                  </div>

                  {/* ✅ Language Switcher (EN ⇄ HI) */}
                  <LanguageSwitcher post={post} />
                </div>

                {/* Title Section - START OF TOC ALIGNMENT */}
                <header className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 min-h-[44px]">
                      {post.author?.profilePictureUrl ? (
                        <Image
                          src={post.author.profilePictureUrl}
                          alt={post.author.name}
                          width={28}
                          height={28}
                          className="rounded-full sm:w-8 sm:h-8"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                      )}
                      <span className="font-medium">
                        <Link href={`/author/${post.author?.username}`} className="hover:text-foreground">
                          {post.author?.name}
                        </Link>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{formatDate(post.publishedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{post.readingTime} min</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{post.views} views</span>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Share Buttons */}
                <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
                  <span className="text-xs sm:text-sm text-muted-foreground mr-1 sm:mr-2">Share:</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                    title="Share on Twitter"
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 min-h-[44px] min-w-[44px]"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                    title="Share on Facebook"
                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 min-h-[44px] min-w-[44px]"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                    title="Share on LinkedIn"
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 min-h-[44px] min-w-[44px]"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('whatsapp')}
                    title="Share on WhatsApp"
                    className="hover:bg-green-50 hover:text-green-600 hover:border-green-600 min-h-[44px] min-w-[44px]"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('copy')}
                    title="Copy link"
                    className="hover:bg-gray-50 min-h-[44px] min-w-[44px]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Featured Image */}
                {post.featuredImageUrl && (
                  <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || post.title}
                      className="w-full h-auto"
                      loading="eager"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* ⚡ NEW: Mobile Collapsible TOC */}
                <TOCMobileCollapsible
                  headings={headings}
                  activeId={activeId}
                  onItemClick={scrollToHeading}
                />

                {/* ✅ TOP AD - After Featured Image, Before Content */}
                <div className="my-8">
                  <AdSense
                    adSlot="2469893467"
                    adFormat="auto"
                    adStyle={{ display: 'block', textAlign: 'center' }}
                  />
                </div>

                {/* Blog Content with Middle Ad */}
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
                      border-radius: 0.5rem;
                      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                      font-size: 0.813rem;
                      display: table;
                    }

                    @media (min-width: 640px) {
                      .blog-content table {
                        margin: 2rem 0;
                        font-size: 0.938rem;
                      }
                    }

                    /* Wrapper div for horizontal scroll on small screens */
                    @media (max-width: 768px) {
                      .blog-content table {
                        display: block;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                      }

                      .blog-content table thead,
                      .blog-content table tbody {
                        display: table;
                        width: 100%;
                      }

                      .blog-content table tr {
                        display: table-row;
                      }

                      .blog-content table th,
                      .blog-content table td {
                        display: table-cell;
                      }
                    }

                    .blog-content thead {
                      background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
                      color: white;
                    }

                    .blog-content thead th {
                      padding: 0.75rem 1rem;
                      text-align: left;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.05em;
                      font-size: 0.75rem;
                      border-bottom: 2px solid hsl(var(--primary));
                      white-space: normal;
                      word-wrap: break-word;
                    }

                    @media (min-width: 640px) {
                      .blog-content thead th {
                        padding: 1rem 1.25rem;
                        font-size: 0.875rem;
                      }
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
                    }

                    @media (min-width: 640px) {
                      .blog-content tbody tr:hover {
                        transform: translateX(4px);
                        box-shadow: -4px 0 0 hsl(var(--primary));
                      }
                    }

                    .blog-content tbody td {
                      padding: 0.75rem 1rem;
                      border-bottom: 1px solid var(--border);
                      white-space: normal;
                      word-wrap: break-word;
                      vertical-align: top;
                    }

                    @media (min-width: 640px) {
                      .blog-content tbody td {
                        padding: 1rem 1.25rem;
                      }
                    }

                    /* ✅ FIX: Allow formulas in table cells */
                    .blog-content table .katex {
                      font-size: 1em;
                      display: inline;
                      white-space: normal;
                    }

                    .blog-content table sup,
                    .blog-content table sub {
                      vertical-align: baseline;
                      position: relative;
                      font-size: 0.75em;
                    }

                    .blog-content table sup {
                      top: -0.5em;
                    }

                    .blog-content table sub {
                      bottom: -0.25em;
                    }

                    /* Custom scrollbar for tables on mobile */
                    @media (max-width: 768px) {
                      .blog-content table::-webkit-scrollbar {
                        height: 8px;
                      }

                      .blog-content table::-webkit-scrollbar-track {
                        background: var(--muted);
                        border-radius: 4px;
                      }

                      .blog-content table::-webkit-scrollbar-thumb {
                        background: var(--primary);
                        border-radius: 4px;
                      }

                      .blog-content table::-webkit-scrollbar-thumb:hover {
                        background: hsl(var(--primary) / 0.8);
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

                    .blog-content figure {
                      margin: 1.5rem 0;
                    }

                    @media (min-width: 640px) {
                      .blog-content figure {
                        margin: 2rem 0;
                      }
                    }

                    .blog-content figcaption {
                      text-align: center;
                      font-size: 0.813rem;
                      color: var(--muted-foreground);
                      margin-top: 0.5rem;
                      font-style: italic;
                    }

                    @media (min-width: 640px) {
                      .blog-content figcaption {
                        font-size: 0.9rem;
                        margin-top: 0.75rem;
                      }
                    }

                    /* ✅ KaTeX Formula Rendering Styles */
                    .blog-content .katex {
                      font-size: 1.1em;
                    }

                    .blog-content .katex-display {
                      margin: 1.5rem 0;
                      overflow-x: auto;
                      overflow-y: hidden;
                    }

                    @media (min-width: 640px) {
                      .blog-content .katex-display {
                        margin: 2rem 0;
                      }
                    }

                    .blog-content .katex-display > .katex {
                      text-align: center;
                    }

                    /* Inline formulas */
                    .blog-content .katex-inline {
                      display: inline-block;
                      vertical-align: middle;
                    }

                    /* Formula scrollbar for long equations */
                    .blog-content .katex-display::-webkit-scrollbar {
                      height: 6px;
                    }

                    .blog-content .katex-display::-webkit-scrollbar-track {
                      background: var(--muted);
                      border-radius: 3px;
                    }

                    .blog-content .katex-display::-webkit-scrollbar-thumb {
                      background: var(--primary);
                      border-radius: 3px;
                    }
                  `}</style>

                  {/* ✅ Blog Content with Smart Ad Insertion */}
                  <div
                    className="text-foreground"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                </div>

                {/* ✅ BOTTOM AD - After Content, Before Tags */}
                <div className="my-8">
                  <AdSense
                    adSlot="1347673049"
                    adFormat="auto"
                    adStyle={{ display: 'block', textAlign: 'center' }}
                  />
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div id="tags-section" className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-xs sm:text-sm min-h-[32px]"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6 sm:my-8" />

                {/* Actions - LIKE, COMMENT, SHARE - END OF TOC SECTION */}
                <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <PostLikeButton
                      targetId={post._id}
                      initialLikes={post.likes || []}
                      initialIsLiked={session?.user?.id && post.likes?.includes(session.user.id)}
                      size="md"
                      animated={true}
                    />

                    {/* ✨ Using dynamic state */}
                    <Button variant="outline" className="flex items-center gap-2 min-h-[44px]">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{commentStats.approved}</span>
                      <span className="hidden sm:inline text-sm">Comments</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm text-muted-foreground mr-1 sm:mr-2">Share:</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare('twitter')}
                      title="Share on Twitter"
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 min-h-[44px] min-w-[44px]"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare('facebook')}
                      title="Share on Facebook"
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 min-h-[44px] min-w-[44px]"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare('linkedin')}
                      title="Share on LinkedIn"
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 min-h-[44px] min-w-[44px]"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare('whatsapp')}
                      title="Share on WhatsApp"
                      className="hover:bg-green-50 hover:text-green-600 hover:border-green-600 min-h-[44px] min-w-[44px]"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare('copy')}
                      title="Copy link"
                      className="hover:bg-gray-50 min-h-[44px] min-w-[44px]"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 
                ==================================================================
                TOC SIDEBAR - DESKTOP ONLY (SCROLLS WITH CONTENT)
                ==================================================================
              */}
              <div className="hidden lg:block lg:w-1/3 lg:flex-shrink-0">
                <div className="toc-sidebar-wrapper">
                  <TOCDesktopSidebar
                    headings={headings}
                    activeId={activeId}
                    readingProgress={readingProgress}
                    readingTime={post.readingTime}
                    onItemClick={scrollToHeading}
                    scrollToTop={scrollToTop}
                  />
                </div>
              </div>
            </div>

            {/* 
              =====================================================================
              SECTIONS AFTER TOC - FULL WIDTH (Comments, Author, Related Posts)
              =====================================================================
            */}
            <div className="max-w-7xl mx-auto mt-8 sm:mt-12">
              {/* Comments Section */}
              <section className="mb-8 sm:mb-12">
                {/* ✨ Passing callback to update stats */}
                <CommentSection
                  postId={post._id}
                  allowComments={post.allowComments}
                  showStats={true}
                  onStatsUpdate={handleCommentStatsUpdate}
                />
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Author Bio */}
              <Card className="mb-8 sm:mb-12 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      {post.author?.profilePictureUrl ? (
                        <Image
                          src={post.author.profilePictureUrl}
                          alt={post.author.name}
                          width={64}
                          height={64}
                          className="rounded-full ring-2 ring-primary/20 sm:w-20 sm:h-20"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                          <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        <Link href={`/author/${post.author?.username}`} className="hover:text-primary transition-colors">
                          {post.author?.name}
                        </Link>
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-3">
                        {post.author?.bio || 'No bio available.'}
                      </p>
                      {post.author?.twitterHandle && (
                        <Link
                          href={`https://twitter.com/${post.author.twitterHandle}`}
                          target="_blank"
                          className="text-xs sm:text-sm text-primary hover:underline inline-block min-h-[44px] flex items-center justify-center sm:justify-start"
                        >
                          @{post.author.twitterHandle}
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    More from {post.author?.name}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Explore other articles by this author
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`} className="block min-h-[44px]">
                        <Card className="blog-card hover:shadow-lg transition-all cursor-pointer group h-full">
                          <div className="relative h-32 sm:h-40 overflow-hidden">
                            {relatedPost.featuredImageUrl ? (
                              <Image
                                src={relatedPost.featuredImageUrl}
                                alt={relatedPost.featuredImageAlt || relatedPost.title}
                                fill
                                className="object-cover rounded-t-lg transition-transform group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center rounded-t-lg">
                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60 transition-transform group-hover:scale-110" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          </div>
                          <CardContent className="p-3 sm:p-4">
                            <Badge size="sm" className="mb-2 text-xs" style={{ backgroundColor: relatedPost.category?.color }}>
                              {relatedPost.category?.name}
                            </Badge>
                            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {relatedPost.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                              <span className="truncate">{formatDate(relatedPost.publishedAt)}</span>
                              <span>•</span>
                              <span className="whitespace-nowrap">{relatedPost.readingTime} min</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Back Button */}
              <div className="text-center mt-8 sm:mt-12">
                <Button
                  variant="outline"
                  asChild
                  className="hover:bg-primary hover:text-primary-foreground transition-colors min-h-[44px] w-full sm:w-auto"
                >
                  <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
