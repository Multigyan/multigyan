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
      .select('title slug excerpt content publishedAt updatedAt author category tags')
      .sort({ publishedAt: -1 })
      .limit(20)
    
    const lastUpdated = posts.length > 0 
      ? posts[0].updatedAt.toISOString()
      : new Date().toISOString()
    
    // Generate Atom XML
    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${siteName}</title>
  <link href="${siteUrl}" />
  <link href="${siteUrl}/api/feed/atom" rel="self" type="application/atom+xml" />
  <id>${siteUrl}/</id>
  <updated>${lastUpdated}</updated>
  <subtitle>${siteDescription}</subtitle>
  <generator uri="${siteUrl}" version="1.0">Multigyan Atom Generator</generator>
  <rights>Copyright ${new Date().getFullYear()} ${siteName}</rights>
  
${posts.map(post => {
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const plainTextContent = post.content.replace(/<[^>]*>/g, '').substring(0, 500)
  const excerpt = post.excerpt || plainTextContent + '...'
  
  return `  <entry>
    <title type="html"><![CDATA[${post.title}]]></title>
    <link href="${postUrl}" />
    <id>${postUrl}</id>
    <published>${post.publishedAt.toISOString()}</published>
    <updated>${post.updatedAt.toISOString()}</updated>
    <author>
      <name>${post.author.name}</name>
      <email>${post.author.email}</email>
    </author>
    <category term="${post.category.name}" />
${post.tags ? post.tags.map(tag => `    <category term="${tag}" />`).join('\n') : ''}
    <summary type="html"><![CDATA[${excerpt}]]></summary>
    <content type="html"><![CDATA[${post.content}]]></content>
  </entry>`
}).join('\n')}
</feed>`
    
    return new NextResponse(atomXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return NextResponse.json(
      { error: 'Failed to generate Atom feed' },
      { status: 500 }
    )
  }
}
