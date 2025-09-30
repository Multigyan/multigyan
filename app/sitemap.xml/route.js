import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const currentDate = new Date().toISOString()
    
    // Get all published posts
    const posts = await Post.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
    
    // Get all categories
    const categories = await Category.find({})
      .select('slug updatedAt')
    
    // Get all authors with published posts
    const authors = await User.find({
      _id: { $in: posts.map(post => post.author) }
    })
      .select('_id updatedAt')
    
    // Static pages
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
      }
    ]
    
    // Blog posts
    const postPages = posts.map(post => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    }))
    
    // Category pages
    const categoryPages = categories.map(category => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastmod: category.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.6'
    }))
    
    // Author pages
    const authorPages = authors.map(author => ({
      url: `${siteUrl}/author/${author._id}`,
      lastmod: author.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: '0.5'
    }))
    
    // Combine all pages
    const allPages = [...staticPages, ...postPages, ...categoryPages, ...authorPages]
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
