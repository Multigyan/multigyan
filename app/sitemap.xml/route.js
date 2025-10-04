import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import User from '@/models/User'
import Post from '@/models/Post'

export async function GET() {
  try {
    await connectDB()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const currentDate = new Date().toISOString()
    
    // Get all published posts to find active authors
    const posts = await Post.find({ status: 'published' })
      .select('author')
      .lean()
    
    // Get all categories
    const categories = await Category.find({})
      .select('slug updatedAt')
      .lean()
    
    // Get all authors with published posts (using username)
    const authorIds = [...new Set(posts.map(post => post.author.toString()))]
    const authors = await User.find({
      _id: { $in: authorIds }
    })
      .select('username updatedAt')
      .lean()
    
    // Static pages with priority and change frequency
    const staticPages = [
      {
        url: siteUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: `${siteUrl}/blog`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        url: `${siteUrl}/authors`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        url: `${siteUrl}/categories`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        url: `${siteUrl}/about`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        url: `${siteUrl}/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        url: `${siteUrl}/help`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        url: `${siteUrl}/privacy-policy`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.5'
      },
      {
        url: `${siteUrl}/terms-of-service`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.5'
      }
    ]
    
    // Category pages
    const categoryPages = categories.map(category => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastmod: category.updatedAt ? new Date(category.updatedAt).toISOString() : currentDate,
      changefreq: 'weekly',
      priority: '0.6'
    }))
    
    // Author pages - Now using USERNAME instead of ID!
    const authorPages = authors
      .filter(author => author.username) // Only include authors with username
      .map(author => ({
        url: `${siteUrl}/author/${author.username}`,
        lastmod: author.updatedAt ? new Date(author.updatedAt).toISOString() : currentDate,
        changefreq: 'monthly',
        priority: '0.6'
      }))
    
    // Combine all pages (NO BLOG POSTS - they're in blog-sitemap.xml)
    const allPages = [...staticPages, ...categoryPages, ...authorPages]
    
    // Generate XML sitemap with proper formatting
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main Sitemap: Static Pages, Categories, and Authors -->
  <!-- Author pages use USERNAME for better SEO -->
  <!-- For Blog Posts, see: ${siteUrl}/blog-sitemap.xml -->
  <!-- For Sitemap Index, see: ${siteUrl}/sitemap_index.xml -->
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}
