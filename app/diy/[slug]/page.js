import { notFound } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import User from '@/models/User'
import { generateSEOMetadata } from '@/lib/seo'
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateHowToSchema
} from '@/lib/seo-enhanced'
import EnhancedSchema from '@/components/seo/EnhancedSchema'
import DIYPostClient from './DIYPostClient'

// =========================================
// DYNAMIC RENDERING CONFIGURATION
// =========================================
// ✅ OPTIMIZED: Changed from 60s to 1 hour (3600s)
// This reduces function invocations by ~98% with zero UX impact
// DIY tutorials don't need real-time updates
export const revalidate = 3600 // Revalidate every 1 hour (was 60 seconds)

// =========================================
// GENERATE STATIC PARAMS FOR BUILD TIME
// =========================================
export async function generateStaticParams() {
  try {
    await connectDB()

    // Get all published DIY posts
    const posts = await Post.find({
      status: 'published',
      $or: [
        { tags: { $in: ['diy', 'DIY', 'Do It Yourself'] } },
      ]
    })
      .select('slug')
      .lean()

    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for DIY:', error)
    return []
  }
}

// =========================================
// HELPER FUNCTION: Convert to Date safely
// =========================================
function toISOStringSafe(dateValue) {
  if (!dateValue) return null

  if (dateValue instanceof Date) {
    return dateValue.toISOString()
  }

  try {
    const date = new Date(dateValue)
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

// =========================================
// GENERATE METADATA FOR SEO
// =========================================
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params

    await connectDB()

    const post = await Post.findOne({
      slug: resolvedParams.slug,
      status: 'published'
    })
      .populate('author', 'name profilePictureUrl')
      .populate('category', 'name')
      .lean()

    if (!post) {
      return {
        title: 'DIY Tutorial Not Found | Multigyan',
        description: 'The requested DIY tutorial could not be found.'
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/diy/${post.slug}`

    const metadata = generateSEOMetadata({
      title: `${post.seoTitle || post.title} - DIY Tutorial`,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords || post.tags,
      author: post.author,
      publishedTime: toISOStringSafe(post.publishedAt),
      modifiedTime: toISOStringSafe(post.updatedAt),
      canonicalUrl: postUrl,
      imageUrl: post.featuredImageUrl,
      imageAlt: post.featuredImageAlt,
      type: 'article',
      category: 'DIY',
      tags: post.tags
    })

    return metadata
  } catch (error) {
    console.error('Error generating metadata for DIY post:', error)
    return {
      title: 'Error | Multigyan',
      description: 'An error occurred while loading the DIY tutorial.'
    }
  }
}

// =========================================
// MAIN DIY POST PAGE COMPONENT
// =========================================
export default async function DIYPostPage({ params }) {
  try {
    const resolvedParams = await params

    await connectDB()

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

    // Increment view count
    Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec()

    // Generate structured data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const postUrl = `${siteUrl}/diy/${post.slug}`

    // ✅ Generate HowTo schema for rich results in Google
    const howToSchema = generateHowToSchema(post)
    const enhancedArticleSchema = generateArticleSchema(post)
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'DIY', url: `${siteUrl}/diy` },
      { name: post.title, url: postUrl }
    ])

    // Serialize the post (same as blog post)
    const serializedPost = {
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      slug: post.slug,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,

      author: post.author ? {
        _id: post.author._id.toString(),
        name: post.author.name,
        email: post.author.email,
        username: post.author.username,
        profilePictureUrl: post.author.profilePictureUrl,
        bio: post.author.bio,
        twitterHandle: post.author.twitterHandle
      } : null,

      category: post.category ? {
        _id: post.category._id.toString(),
        name: post.category.name,
        slug: post.category.slug,
        color: post.category.color
      } : null,

      tags: post.tags || [],
      likes: post.likes?.map(like => like.toString()) || [],

      publishedAt: toISOStringSafe(post.publishedAt),
      updatedAt: toISOStringSafe(post.updatedAt),
      createdAt: toISOStringSafe(post.createdAt),

      comments: post.comments?.map(comment => ({
        ...comment,
        _id: comment._id.toString(),
        author: comment.author ? {
          _id: comment.author._id.toString(),
          name: comment.author.name,
          profilePictureUrl: comment.author.profilePictureUrl,
          role: comment.author.role
        } : null,
        guestName: comment.guestName || null,
        guestEmail: comment.guestEmail || null,
        parentComment: comment.parentComment ? comment.parentComment.toString() : null,
        createdAt: toISOStringSafe(comment.createdAt),
        updatedAt: toISOStringSafe(comment.updatedAt),
        editedAt: comment.editedAt ? toISOStringSafe(comment.editedAt) : null,
        likes: comment.likes?.map(like => like.toString()) || [],
        content: comment.content,
        isApproved: comment.isApproved,
        isReported: comment.isReported,
        reportCount: comment.reportCount || 0,
        isEdited: comment.isEdited || false,
        replies: []
      })) || [],

      reviewedBy: post.reviewedBy ? {
        _id: post.reviewedBy._id.toString(),
        name: post.reviewedBy.name
      } : null,

      status: post.status,
      views: post.views || 0,
      readingTime: post.readingTime || 0,
      isFeatured: post.isFeatured || false,
      allowComments: post.allowComments !== false,

      seoTitle: post.seoTitle || post.title,
      seoDescription: post.seoDescription || post.excerpt,
      seoKeywords: post.seoKeywords || post.tags || [],

      lang: post.lang || 'en',
      translation: null, // DIY posts might not have translations initially

      // ✨ DIY-specific fields (Phase 2)
      diyDifficulty: post.diyDifficulty || null,
      diyMaterials: post.diyMaterials || [],
      diyTools: post.diyTools || [],
      diyEstimatedTime: post.diyEstimatedTime || null,
      affiliateLinks: post.affiliateLinks || [],
    }

    return (
      <>
        {/* ✅ Include HowTo schema for rich search results */}
        <EnhancedSchema schemas={[howToSchema, enhancedArticleSchema, breadcrumbSchema]} />
        <DIYPostClient post={serializedPost} />
      </>
    )
  } catch (error) {
    console.error('Error loading DIY post:', error)
    notFound()
  }
}
