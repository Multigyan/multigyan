import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Helper function to convert relative URLs to absolute
function makeUrlsAbsolute(content, siteUrl) {
  if (!content) return ''
  
  let processedContent = content
  
  // Replace relative image URLs
  processedContent = processedContent.replace(
    /src=["']\/([^"']+)["']/g, 
    `src="${siteUrl}/$1"`
  )
  
  // Replace relative link URLs
  processedContent = processedContent.replace(
    /href=["']\/([^"']+)["']/g, 
    `href="${siteUrl}/$1"`
  )
  
  return processedContent
}

// Helper function to strip HTML and create plain text
function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export async function GET() {
  try {
    // Connect to database
    await connectDB()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'
    const siteName = 'Multigyan'
    const siteDescription = 'Discover insightful articles from talented authors on technology, programming, design, and more.'
    
    // Get the latest 20 published posts
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email username')
      .populate('category', 'name slug')
      .select('title slug excerpt content publishedAt updatedAt author category tags featuredImageUrl')
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean() // Use lean for better performance
    
    // Check if we have posts
    if (!posts || posts.length === 0) {
      // Return empty but valid RSS feed
      const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}/</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/feed/rss" rel="self" type="application/rss+xml" />
  </channel>
</rss>`
      
      return new NextResponse(emptyRss, {
        status: 200,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      })
    }
    
    const lastBuildDate = posts[0]?.publishedAt 
      ? new Date(posts[0].publishedAt).toUTCString()
      : new Date().toUTCString()
    
    // Generate RSS items
    const rssItems = posts.map(post => {
      // Safely get post data with fallbacks
      const postUrl = `${siteUrl}/blog/${post.slug}`
      const title = escapeXml(post.title || 'Untitled')
      const authorName = post.author?.name || 'Multigyan Author'
      const authorEmail = post.author?.email || 'hello@multigyan.in'
      const categoryName = post.category?.name || 'General'
      
      // Create description from excerpt or content
      let description = post.excerpt || stripHtml(post.content).substring(0, 300)
      if (description.length >= 300) {
        description += '...'
      }
      description = escapeXml(description)
      
      // Process content - make URLs absolute
      let cleanContent = makeUrlsAbsolute(post.content || '', siteUrl)
      
      // Format publish date
      const pubDate = post.publishedAt 
        ? new Date(post.publishedAt).toUTCString() 
        : new Date().toUTCString()
      
      // Build featured image enclosure if exists
      let enclosureTag = ''
      if (post.featuredImageUrl) {
        const imageUrl = post.featuredImageUrl.startsWith('http') 
          ? post.featuredImageUrl 
          : `${siteUrl}${post.featuredImageUrl}`
        enclosureTag = `
      <enclosure url="${imageUrl}" type="image/jpeg" length="0" />`
      }
      
      // Build tags as categories
      let tagCategories = ''
      if (post.tags && Array.isArray(post.tags)) {
        tagCategories = post.tags
          .map(tag => `
      <category><![CDATA[${escapeXml(tag)}]]></category>`)
          .join('')
      }
      
      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${cleanContent}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>${authorEmail} (${escapeXml(authorName)})</author>
      <category><![CDATA[${escapeXml(categoryName)}]]></category>${tagCategories}${enclosureTag}
    </item>`
    }).join('')
    
    // Generate complete RSS XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}/</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${lastBuildDate}</pubDate>
    <atom:link href="${siteUrl}/api/feed/rss" rel="self" type="application/rss+xml" />
    <generator>Multigyan RSS Generator</generator>
    <managingEditor>hello@multigyan.in (Multigyan Team)</managingEditor>
    <webMaster>tech@multigyan.in (Multigyan Tech)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} ${siteName}</copyright>
    <ttl>60</ttl>${rssItems}
  </channel>
</rss>`
    
    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })
    
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    
    // Return a proper error response
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>Failed to generate RSS feed</description>
  </channel>
</rss>`,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8'
        }
      }
    )
  }
}
