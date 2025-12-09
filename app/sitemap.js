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

        // Blog posts - higher priority for recent posts
        const postUrls = posts.map((post, index) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt || post.createdAt,
            changeFrequency: 'weekly',
            priority: index < 10 ? 0.9 : 0.8, // Higher priority for top 10 recent posts
        }))

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
