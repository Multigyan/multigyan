import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'

/**
 * Image Sitemap Route
 * Generates an XML sitemap for all images on the site
 * This helps Bing discover and index images for better SEO
 */
export async function GET() {
    try {
        await connectDB()

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

        // Get all published posts with featured images
        const posts = await Post.find({
            status: 'published',
            featuredImageUrl: { $exists: true, $ne: null }
        })
            .select('slug title featuredImageUrl featuredImageAlt updatedAt')
            .sort({ updatedAt: -1 })
            .lean()

        // Generate image sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${posts.map(post => `    <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <image:image>
            <image:loc>${post.featuredImageUrl}</image:loc>
            <image:title>${escapeXml(post.title)}</image:title>
            <image:caption>${escapeXml(post.featuredImageAlt || post.title)}</image:caption>
        </image:image>
        <lastmod>${post.updatedAt.toISOString()}</lastmod>
    </url>`).join('\n')}
</urlset>`

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        console.error('Error generating image sitemap:', error)
        return new Response('Error generating image sitemap', { status: 500 })
    }
}

/**
 * Escape special XML characters
 */
function escapeXml(str) {
    if (!str) return ''
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}
