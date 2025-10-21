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
    await connectDB()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'
    const siteName = 'Multigyan'
    const siteDescription = 'Discover insightful articles from talented authors on technology, programming, design, and more.'
    
    // Get the latest 20 published posts
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email username')
      .populate('category', 'name slug')
      .select('title slug excerpt content publishedAt updatedAt author category tags')
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean()
    
    // Check if we have posts
    if (!posts || posts.length === 0) {
      const emptyAtom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteName)}</title>
  <link href="${siteUrl}/" />
  <link href="${siteUrl}/api/feed/atom" rel="self" type="application/atom+xml" />
  <id>${siteUrl}/</id>
  <updated>${new Date().toISOString()}</updated>
  <subtitle>${escapeXml(siteDescription)}</subtitle>
</feed>`
      
      return new NextResponse(emptyAtom, {
        status: 200,
        headers: {
          'Content-Type': 'application/atom+xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      })
    }
    
    const lastUpdated = posts[0]?.updatedAt 
      ? new Date(posts[0].updatedAt).toISOString()
      : new Date().toISOString()
    
    // Generate Atom entries
    const atomEntries = posts.map(post => {
      const postUrl = `${siteUrl}/blog/${post.slug}`
      const title = escapeXml(post.title || 'Untitled')
      const authorName = post.author?.name || 'Multigyan Author'
      const authorEmail = post.author?.email || 'hello@multigyan.in'
      const categoryName = post.category?.name || 'General'
      
      // Create summary from excerpt or content
      let summary = post.excerpt || stripHtml(post.content).substring(0, 300)
      if (summary.length >= 300) {
        summary += '...'
      }
      summary = escapeXml(summary)
      
      // Clean content - convert relative URLs to absolute URLs
      let cleanContent = makeUrlsAbsolute(post.content || '', siteUrl)
      
      const published = post.publishedAt 
        ? new Date(post.publishedAt).toISOString()
        : new Date().toISOString()
      const updated = post.updatedAt 
        ? new Date(post.updatedAt).toISOString()
        : published
      
      // Build category tags
      let categoryTags = `    <category term="${escapeXml(categoryName)}" />`
      if (post.tags && Array.isArray(post.tags)) {
        categoryTags += '\n' + post.tags
          .map(tag => `    <category term="${escapeXml(tag)}" />`)
          .join('\n')
      }
      
      return `  <entry>
    <title type="html"><![CDATA[${title}]]></title>
    <link href="${postUrl}" rel="alternate" />
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <author>
      <name>${escapeXml(authorName)}</name>
      <email>${authorEmail}</email>
    </author>
${categoryTags}
    <summary type="html"><![CDATA[${summary}]]></summary>
    <content type="html"><![CDATA[${cleanContent}]]></content>
  </entry>`
    }).join('\n')
    
    // Generate Atom XML
    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteName)}</title>
  <link href="${siteUrl}/" rel="alternate" />
  <link href="${siteUrl}/api/feed/atom" rel="self" type="application/atom+xml" />
  <id>${siteUrl}/</id>
  <updated>${lastUpdated}</updated>
  <subtitle>${escapeXml(siteDescription)}</subtitle>
  <generator uri="${siteUrl}" version="1.0">Multigyan Atom Generator</generator>
  <rights>Copyright ${new Date().getFullYear()} ${siteName}</rights>
${atomEntries}
</feed>`
    
    return new NextResponse(atomXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })
    
  } catch (error) {
    console.error('❌ Error generating Atom feed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Error</title>
  <subtitle>Failed to generate Atom feed</subtitle>
  <id>${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'}/</id>
  <updated>${new Date().toISOString()}</updated>
</feed>`,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/atom+xml; charset=utf-8'
        }
      }
    )
  }
}
