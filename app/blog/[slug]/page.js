import { notFound } from "next/navigation"
import BlogPostClient from "./BlogPostClient"
import connectDB from "@/lib/mongodb"
import Post from "@/models/Post"
import { generateSEOMetadata, generateStructuredData } from "@/lib/seo"
import StructuredData from "@/components/seo/StructuredData"

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  try {
    await connectDB()
    
    const post = await Post.findOne({ 
      slug: params.slug, 
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
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
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

export default async function BlogPostPage({ params }) {
  try {
    await connectDB()
    
    const post = await Post.findOne({ 
      slug: params.slug, 
      status: 'published' 
    })
      .populate('author', 'name email profilePictureUrl bio twitterHandle')
      .populate('category', 'name slug color')
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
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
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
      author: {
        ...post.author,
        _id: post.author._id.toString()
      },
      category: {
        ...post.category,
        _id: post.category._id.toString()
      },
      publishedAt: post.publishedAt?.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
      createdAt: post.createdAt?.toISOString(),
      comments: post.comments?.map(comment => ({
        ...comment,
        _id: comment._id.toString(),
        user: comment.user ? comment.user.toString() : null,
        createdAt: comment.createdAt?.toISOString(),
        updatedAt: comment.updatedAt?.toISOString()
      })) || []
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
