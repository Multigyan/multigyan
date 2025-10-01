import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET() {
  try {
    await connectDB()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    // Get all published posts
    const posts = await Post.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean()
    
    // Generate blog post URLs
    const postPages = posts.map((post, index) => {
      // More recent posts get higher priority
      const basePriority = 0.7
      const recentBoost = index < 10 ? 0.1 : 0
      const priority = (basePriority + recentBoost).toFixed(1)
      
      return {
        url: `${siteUrl}/blog/${post.slug}`,
        lastmod: (post.updatedAt || post.publishedAt).toISOString(),
        changefreq: 'weekly',
        priority: priority
      }
    })
    
    // Generate XML sitemap for blog posts only
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Blog Posts Sitemap -->
  <!-- Total Posts: ${posts.length} -->
  <!-- Last Updated: ${new Date().toISOString()} -->
${postPages.map(page => `  <url>
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
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating blog sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate blog sitemap' },
      { status: 500 }
    )
  }
}
