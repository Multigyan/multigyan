import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import Category from '@/models/Category'

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

    try {
        await connectDB()

        // Get all published posts
        const posts = await Post.find({ status: 'published' })
            .select('slug updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .lean()

        // Get all categories
        const categories = await Category.find()
            .select('slug updatedAt')
            .lean()

        // Static pages with priorities
        const staticPages = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/blog`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseUrl}/store`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseUrl}/categories`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/about`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            },
            {
                url: `${baseUrl}/contact`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            {
                url: `${baseUrl}/authors`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
            },
            {
                url: `${baseUrl}/help`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
        ]

        // Blog posts - prioritize based on freshness and views
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const postUrls = posts.map((post) => {
            const postDate = post.updatedAt || post.createdAt
            const daysSinceUpdate = (now - new Date(postDate)) / (24 * 60 * 60 * 1000)

            // Priority based on content freshness
            let priority = 0.7 // Default
            let changeFrequency = 'monthly'

            if (postDate >= sevenDaysAgo) {
                // Very fresh content (last 7 days)
                priority = 0.95
                changeFrequency = 'daily'
            } else if (postDate >= thirtyDaysAgo) {
                // Recent content (last 30 days)
                priority = 0.85
                changeFrequency = 'weekly'
            } else if (daysSinceUpdate <= 90) {
                // Moderately recent (last 90 days)
                priority = 0.75
                changeFrequency = 'weekly'
            }

            return {
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: postDate,
                changeFrequency,
                priority,
            }
        })

        // Categories
        const categoryUrls = categories.map(cat => ({
            url: `${baseUrl}/category/${cat.slug}`,
            lastModified: cat.updatedAt || new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        }))

        // Combine all URLs
        return [...staticPages, ...postUrls, ...categoryUrls]

    } catch (error) {
        console.error('Error generating sitemap:', error)

        // Return at least static pages if database fails
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/blog`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
        ]
    }
}
