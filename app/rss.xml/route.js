import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.com'
const SITE_NAME = 'Multigyan'
const SITE_DESCRIPTION = 'Discover insightful articles from talented authors on technology, programming, design, and more.'

export async function GET() {
  try {
    await connectDB()

    // Fetch latest 20 published posts for RSS feed
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email')
      .populate('category', 'name')
      .select('title slug excerpt content publishedAt updatedAt featuredImageUrl author category')
      .sort({ publishedAt: -1 })
      .limit(20)

    // Generate RSS XML
    const rssItems = posts.map(post => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`
      const publishDate = new Date(post.publishedAt).toUTCString()
      
      // Clean content for RSS (remove HTML tags for description)
      const description = post.excerpt || post.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .substring(0, 300) + '...'

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${publishDate}</pubDate>
      <author>${post.author?.email || 'noreply@multigyan.com'} (${post.author?.name || 'Multigyan Author'})</author>
      <category>${post.category?.name || 'Uncategorized'}</category>
      ${post.featuredImageUrl ? `<enclosure url="${post.featuredImageUrl}" type="image/jpeg" />` : ''}
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>`
    }).join('')

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description><![CDATA[${SITE_DESCRIPTION}]]></description>
    <language>en</language>
    <managingEditor>hello@multigyan.com (Multigyan Team)</managingEditor>
    <webMaster>tech@multigyan.com (Multigyan Tech)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${posts.length > 0 ? new Date(posts[0].publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/images/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      }
    })

  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}