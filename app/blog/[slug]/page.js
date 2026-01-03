import { notFound, redirect } from "next/navigation"
import BlogPostClient from "./BlogPostClient"
import connectDB from "@/lib/mongodb"
import Post from "@/models/Post"
import Category from "@/models/Category" // ✅ FIX: Import Category model for populate()
import User from "@/models/User" // ✅ FIX: Import User model for populate()
import { generateSEOMetadata } from "@/lib/seo"
// ✅ Import bilingual SEO utilities
import {
  generateBreadcrumbSchema
} from "@/lib/seo-enhanced"
// ✅ Import Bing-specific enhanced schemas and extractors
import {
  generateEnhancedArticleSchema,
  generateNewsArticleSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateWebPageSchema,
  extractFAQFromContent,
  extractHowToFromContent
} from "@/lib/seo-bing"
import EnhancedSchema from "@/components/seo/EnhancedSchema"
import ViewTracker from "@/components/blog/ViewTracker"

// ========================================
// DYNAMIC RENDERING CONFIGURATION
// ========================================
// ✅ PHASE 1: ISR Optimization - Revalidate every 6 hours instead of 1 hour
// This reduces function invocations by ~70% and saves $3-4/month on Vercel Pro
// Content updates may take up to 6 hours to appear (use on-demand revalidation for immediate updates)
export const revalidate = 21600 // Revalidate every 6 hours

// ========================================
// GENERATE STATIC PARAMS FOR BUILD TIME
// ========================================
// Pre-generate static pages for top 100 most viewed posts during build
// Other posts will be generated on-demand with ISR
export async function generateStaticParams() {
  try {
    await connectDB()

    // Get top 100 most viewed published posts
    const posts = await Post.find({ status: 'published' })
      .sort({ views: -1 }) // Sort by views descending
      .limit(100) // Only pre-render top 100
      .select('slug')
      .lean()

    console.log(`[Static Generation] Pre-rendering ${posts.length} most viewed posts`)

    // Return array of slugs for static generation
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Return empty array if error occurs (pages will be generated on-demand)
    return []
  }
}

// ========================================
// HELPER FUNCTION: Convert to Date safely
// ========================================
// This function handles dates that might be strings or Date objects
function toISOStringSafe(dateValue) {
  if (!dateValue) return null

  // If it's already a Date object, use it directly
  if (dateValue instanceof Date) {
    return dateValue.toISOString()
  }

  // If it's a string or number, convert to Date first
  try {
    const date = new Date(dateValue)
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue)
      return null
    }
    return date.toISOString()
  } catch (error) {
    console.error('Error converting date:', error)
    return null
  }
}

// ========================================
// Generate metadata for SEO
// ========================================
export async function generateMetadata({ params }) {
  try {
    // ✅ FIX 1: Await params before using it (Next.js 15+ requirement)
    const resolvedParams = await params

    await connectDB()

    // ✅ FIX 2: Use resolvedParams.slug instead of params.slug
    const post = await Post.findOne({
      slug: resolvedParams.slug,
      status: 'published'
    })
      .populate('author', 'name profilePictureUrl')
      .populate('category', 'name')
      .lean()

    if (!post) {
      return {
        title: 'Post Not Found | Multigyan',
        description: 'The requested blog post could not be found.'
      }
    }

    // ✅ NEW: Find translation for hreflang
    const translation = post.translationOf
      ? await Post.findById(post.translationOf).select('slug lang').lean()
      : await Post.findOne({ translationOf: post._id }).select('slug lang').lean()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/blog/${post.slug}`

    const metadata = generateSEOMetadata({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords || post.tags,
      author: post.author,
      // ✅ FIX 3: Use safe date conversion helper
      publishedTime: toISOStringSafe(post.publishedAt),
      modifiedTime: toISOStringSafe(post.updatedAt),
      canonicalUrl: postUrl,
      imageUrl: post.featuredImageUrl,
      imageAlt: post.featuredImageAlt,
      type: 'article',
      category: post.category?.name,
      tags: post.tags
    })

    // ✅ NEW: Add language alternates for hreflang
    if (translation) {
      metadata.alternates = {
        ...metadata.alternates,
        languages: {
          'en-IN': post.lang === 'en' ? postUrl : `${siteUrl}/blog/${translation.slug}`,
          'hi-IN': post.lang === 'hi' ? postUrl : `${siteUrl}/blog/${translation.slug}`,
          'x-default': post.lang === 'en' ? postUrl : `${siteUrl}/blog/${translation.slug}`
        }
      }
    }

    return metadata
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Error | Multigyan',
      description: 'An error occurred while loading the post.'
    }
  }
}

// ========================================
// Main Blog Post Page Component
// ========================================
export default async function BlogPostPage({ params }) {
  try {
    // ✅ FIX 1: Await params before using it (Next.js 15+ requirement)
    const resolvedParams = await params

    await connectDB()

    // ✅ FIX 2: Use resolvedParams.slug instead of params.slug
    const post = await Post.findOne({
      slug: resolvedParams.slug,
      status: 'published'
    })
      .populate('author', 'name email username profilePictureUrl bio twitterHandle')
      .populate('category', 'name slug color')
      .populate('comments.author', 'name profilePictureUrl role')
      .populate('reviewedBy', 'name')
      .lean()

    if (!post) {
      notFound()
    }

    // 🐛 NEW: Redirect recipes to /recipe/[slug]
    if (post.contentType === 'recipe') {
      redirect(`/recipe/${post.slug}`)
    }

    // ✅ REMOVED: Server-side view tracking doesn't work for cached pages
    // View tracking is now handled client-side via ViewTracker component

    // ✅ OPTIMIZATION: Fetch related posts server-side (eliminates client-side API call)
    let relatedPosts = []
    try {
      if (post.author?._id) {
        relatedPosts = await Post.find({
          status: 'published',
          author: post.author._id,
          _id: { $ne: post._id }
        })
          .limit(3)
          .select('title slug featuredImageUrl featuredImageAlt category publishedAt readingTime')
          .populate('category', 'name color slug')
          // ✅ PHASE 1 FIX: Changed from static views-based to recency-first
          // This ensures users see FRESH content from same author, not always the same old 3 posts
          .sort({
            publishedAt: -1,  // Primary: Most recent first
            views: -1         // Secondary: Break ties with popular posts
          })
          .lean()
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
      // Continue without related posts if error occurs
    }

    // ✅ NEW: Find translation for language switcher
    const translation = post.translationOf
      ? await Post.findById(post.translationOf).select('slug lang').lean()
      : await Post.findOne({ translationOf: post._id }).select('slug lang').lean()

    // Generate structured data - Using Enhanced Bing Schema
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/blog/${post.slug}`

    // ✅ PHASE 1: Detect if this is a news article
    const isNewsArticle = post.tags?.some(tag =>
      tag.toLowerCase().includes('news') ||
      tag.toLowerCase().includes('daily news')
    ) || post.category?.slug === 'news'

    // ✅ Generate appropriate schema based on content type
    const enhancedArticleSchema = isNewsArticle
      ? generateNewsArticleSchema(post)
      : generateEnhancedArticleSchema(post)

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'Blog', url: `${siteUrl}/blog` },
      { name: post.category?.name || 'Uncategorized', url: `${siteUrl}/category/${post.category?.slug || 'uncategorized'}` },
      { name: post.title, url: postUrl }
    ])

    // ✅ NEW: Extract and generate FAQ schema from content
    const faqItems = extractFAQFromContent(post.content)
    const faqSchema = faqItems.length > 0 ? generateFAQSchema(faqItems) : null

    // ✅ NEW: Extract and generate HowTo schema for tutorial content
    const howToData = extractHowToFromContent(post.content, post)
    const howToSchema = howToData ? generateHowToSchema(howToData) : null

    // ✅ NEW: Generate WebPage schema for better page understanding
    const webPageSchema = generateWebPageSchema(post)

    // Collect all schemas (filter out null values)
    const schemas = [
      enhancedArticleSchema,
      breadcrumbSchema,
      webPageSchema,
      faqSchema,
      howToSchema
    ].filter(Boolean)

    // Serialize the post for client component (NO SPREAD OPERATOR!)
    const serializedPost = {
      // Basic fields
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      slug: post.slug,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,

      // Serialized author
      author: post.author ? {
        _id: post.author._id.toString(),
        name: post.author.name,
        email: post.author.email,
        username: post.author.username,
        profilePictureUrl: post.author.profilePictureUrl,
        bio: post.author.bio,
        twitterHandle: post.author.twitterHandle
      } : null,

      // Serialized category
      category: post.category ? {
        _id: post.category._id.toString(),
        name: post.category.name,
        slug: post.category.slug,
        color: post.category.color
      } : null,

      // Arrays
      tags: post.tags || [],
      likes: post.likes?.map(like => like.toString()) || [],

      // Dates
      publishedAt: toISOStringSafe(post.publishedAt),
      updatedAt: toISOStringSafe(post.updatedAt),
      createdAt: toISOStringSafe(post.createdAt),
      // ✅ OPTIMIZED: Serialize comments without spread operator
      comments: post.comments?.map(comment => ({
        _id: comment._id.toString(),
        content: comment.content,
        isApproved: comment.isApproved,
        isReported: comment.isReported,
        reportCount: comment.reportCount || 0,
        isEdited: comment.isEdited || false,
        author: comment.author ? {
          _id: comment.author._id.toString(),
          name: comment.author.name,
          profilePictureUrl: comment.author.profilePictureUrl,
          role: comment.author.role
        } : null,
        guestName: comment.guestName || null,
        guestEmail: comment.guestEmail || null,
        parentComment: comment.parentComment ? comment.parentComment.toString() : null,
        replies: [],
        createdAt: toISOStringSafe(comment.createdAt),
        updatedAt: toISOStringSafe(comment.updatedAt),
        editedAt: comment.editedAt ? toISOStringSafe(comment.editedAt) : null,
        likes: comment.likes?.map(like => like.toString()) || []
      })) || [],
      // Serialized reviewedBy
      reviewedBy: post.reviewedBy ? {
        _id: post.reviewedBy._id.toString(),
        name: post.reviewedBy.name
      } : null,

      // Metadata
      status: post.status,
      views: post.views || 0,
      readingTime: post.readingTime || 0,
      isFeatured: post.isFeatured || false,
      allowComments: post.allowComments !== false, // Default to true

      // SEO fields
      seoTitle: post.seoTitle || post.title,
      seoDescription: post.seoDescription || post.excerpt,
      seoKeywords: post.seoKeywords || post.tags || [],

      // ✅ NEW: Add language and translation data
      lang: post.lang || 'en',
      translationOf: post.translationOf ? post.translationOf.toString() : null, // ✨ ADD THIS!
      translation: translation ? {
        slug: translation.slug,
        lang: translation.lang
      } : null,

      // DO NOT include revision, hasRevision, or other MongoDB internal fields!
    }

    // ✅ OPTIMIZATION: Serialize related posts
    const serializedRelatedPosts = relatedPosts.map(rp => ({
      _id: rp._id.toString(),
      title: rp.title,
      slug: rp.slug,
      featuredImageUrl: rp.featuredImageUrl,
      featuredImageAlt: rp.featuredImageAlt,
      publishedAt: rp.publishedAt ? new Date(rp.publishedAt).toISOString() : null,
      readingTime: rp.readingTime,
      category: rp.category ? {
        _id: rp.category._id.toString(),
        name: rp.category.name,
        slug: rp.category.slug,
        color: rp.category.color
      } : null
    }))

    return (
      <>
        {/* ✅ Render all collected schemas for comprehensive rich results */}
        <EnhancedSchema schemas={schemas} />
        {/* ✅ Client-side view tracking for all users */}
        <ViewTracker postId={post._id.toString()} />
        <BlogPostClient post={serializedPost} relatedPosts={serializedRelatedPosts} />
      </>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    notFound()
  }
}
