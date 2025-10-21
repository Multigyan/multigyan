import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'
const SITE_NAME = 'Multigyan'
const SITE_DESCRIPTION = 'Discover insightful articles from talented authors on technology, programming, design, and more.'

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
    await connectDB()

    // Fetch latest 20 published posts for RSS feed
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email username')
      .populate('category', 'name slug')
      .select('title slug excerpt content publishedAt updatedAt featuredImageUrl author category tags')
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean()

    // Check if we have posts
    if (!posts || posts.length === 0) {
      const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description><![CDATA[${SITE_DESCRIPTION}]]></description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>`
      
      return new NextResponse(emptyRss, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
        }
      })
    }

    // Generate RSS items
    const rssItems = posts.map(post => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`
      const title = escapeXml(post.title || 'Untitled')
      const authorName = post.author?.name || 'Multigyan Author'
      const authorEmail = post.author?.email || 'hello@multigyan.in'
      const categoryName = post.category?.name || 'General'
      const publishDate = post.publishedAt 
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString()
      
      // Create description from excerpt or content
      let description = post.excerpt || stripHtml(post.content).substring(0, 300)
      if (description.length >= 300) {
        description += '...'
      }
      description = escapeXml(description)
      
      // Clean content - convert relative URLs to absolute URLs
      let cleanContent = makeUrlsAbsolute(post.content || '', SITE_URL)

      // Build enclosure for featured image if exists
      let enclosureTag = ''
      if (post.featuredImageUrl) {
        const imageUrl = post.featuredImageUrl.startsWith('http')
          ? post.featuredImageUrl
          : `${SITE_URL}${post.featuredImageUrl}`
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
      <pubDate>${publishDate}</pubDate>
      <author>${authorEmail} (${escapeXml(authorName)})</author>
      <category><![CDATA[${escapeXml(categoryName)}]]></category>${tagCategories}${enclosureTag}
    </item>`
    }).join('')

    const lastBuildDate = posts[0]?.publishedAt
      ? new Date(posts[0].publishedAt).toUTCString()
      : new Date().toUTCString()

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description><![CDATA[${SITE_DESCRIPTION}]]></description>
    <language>en</language>
    <managingEditor>hello@multigyan.in (Multigyan Team)</managingEditor>
    <webMaster>tech@multigyan.in (Multigyan Tech)</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${lastBuildDate}</pubDate>
    <ttl>1440</ttl>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/Multigyan_Logo_bg.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}/</link>
      <width>144</width>
      <height>144</height>
    </image>${rssItems}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      }
    })

  } catch (error) {
    console.error('❌ Error generating RSS feed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    
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
