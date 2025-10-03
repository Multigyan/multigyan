import { notFound } from "next/navigation"
import BlogPostClient from "./BlogPostClient"
import connectDB from "@/lib/mongodb"
import Post from "@/models/Post"
import Category from "@/models/Category" // ✅ FIX: Import Category model for populate()
import User from "@/models/User" // ✅ FIX: Import User model for populate()
import { generateSEOMetadata, generateStructuredData } from "@/lib/seo"
import StructuredData from "@/components/seo/StructuredData"

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
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/blog/${post.slug}`
    
    return generateSEOMetadata({
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
    
    // Increment view count (we'll do this async to not block rendering)
    Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec()
    
    // Generate structured data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/blog/${post.slug}`
    
    const articleStructuredData = generateStructuredData({
      type: 'article',
      title: post.title,
      description: post.excerpt,
      author: post.author,
      // ✅ FIX 3: Use safe date conversion helper
      publishedTime: toISOStringSafe(post.publishedAt),
      modifiedTime: toISOStringSafe(post.updatedAt),
      canonicalUrl: postUrl,
      imageUrl: post.featuredImageUrl,
      imageAlt: post.featuredImageAlt,
      category: post.category?.name,
      tags: post.tags,
      readingTime: post.readingTime
    })
    
    // Serialize the post for client component
    const serializedPost = {
      ...post,
      _id: post._id.toString(),
      // ✅ FIX: Handle null author (some posts might not have author after migration)
      author: post.author ? {
        ...post.author,
        _id: post.author._id.toString()
      } : null,
      category: post.category ?{
        ...post.category,
        _id: post.category._id.toString()
      } : null,
      // ✅ FIX: Serialize the post's likes array
      likes: post.likes?.map(like => like.toString()) || [],
      // ✅ FIX 3: Use safe date conversion helper for all dates
      publishedAt: toISOStringSafe(post.publishedAt),
      updatedAt: toISOStringSafe(post.updatedAt),
      createdAt: toISOStringSafe(post.createdAt),
      // ✅ FIX: Properly serialize comments with populated author data
      comments: post.comments?.map(comment => ({
        ...comment,
        _id: comment._id.toString(),
        // Keep the populated author object with all fields
        author: comment.author ? {
          _id: comment.author._id.toString(),
          name: comment.author.name,
          profilePictureUrl: comment.author.profilePictureUrl,
          role: comment.author.role
        } : null,
        // Handle guest comments
        guestName: comment.guestName || null,
        guestEmail: comment.guestEmail || null,
        parentComment: comment.parentComment ? comment.parentComment.toString() : null,
        createdAt: toISOStringSafe(comment.createdAt),
        updatedAt: toISOStringSafe(comment.updatedAt),
        editedAt: comment.editedAt ? toISOStringSafe(comment.editedAt) : null,
        // Serialize likes array
        likes: comment.likes?.map(like => like.toString()) || [],
        // Keep other comment fields
        content: comment.content,
        isApproved: comment.isApproved,
        isReported: comment.isReported,
        reportCount: comment.reportCount || 0,
        isEdited: comment.isEdited || false,
        replies: [] // Replies will be structured by CommentSection component
      })) || [],
      // ✅ FIX: Properly serialize reviewedBy
      reviewedBy: post.reviewedBy ? {
        _id: post.reviewedBy._id.toString(),
        name: post.reviewedBy.name
      } : null
    }
    
    return (
      <>
        <StructuredData data={articleStructuredData} />
        <BlogPostClient post={serializedPost} />
      </>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    notFound()
  }
}
