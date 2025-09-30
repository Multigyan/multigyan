import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET() {
  try {
    await connectDB()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const siteName = 'Multigyan'
    const siteDescription = 'Multi-author blogging platform for knowledge sharing and content creation'
    
    // Get the latest 20 published posts
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email')
      .populate('category', 'name')
      .select('title slug excerpt content publishedAt author category tags')
      .sort({ publishedAt: -1 })
      .limit(20)
    
    const lastBuildDate = posts.length > 0 
      ? posts[0].publishedAt.toUTCString()
      : new Date().toUTCString()
    
    // Generate RSS XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/api/feed/rss" rel="self" type="application/rss+xml" />
    <generator>Multigyan RSS Generator</generator>
    <webMaster>admin@multigyan.com (Multigyan Team)</webMaster>
    <managingEditor>admin@multigyan.com (Multigyan Team)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} ${siteName}</copyright>
    <category>Technology</category>
    <category>Education</category>
    <category>Knowledge</category>
    <ttl>60</ttl>
    
${posts.map(post => {
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const plainTextContent = post.content.replace(/<[^>]*>/g, '').substring(0, 500)
  const excerpt = post.excerpt || plainTextContent + '...'
  
  return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <author>${post.author.email} (${post.author.name})</author>
      <category><![CDATA[${post.category.name}]]></category>
${post.tags ? post.tags.map(tag => `      <category><![CDATA[${tag}]]></category>`).join('\n') : ''}
    </item>`
}).join('\n')}
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
    console.error('Error generating RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}
