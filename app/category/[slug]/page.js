import { notFound } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Post from '@/models/Post'
import { generateSEOMetadata } from '@/lib/seo'
import CategoryClient from './CategoryClient'

// =========================================
// ISR CONFIGURATION
// =========================================
export const revalidate = 3600 // Revalidate every 1 hour

// =========================================
// GENERATE STATIC PARAMS FOR BUILD TIME
// =========================================
export async function generateStaticParams() {
  try {
    await connectDB()

    // Pre-generate top 20 categories by post count
    const categories = await Category.find({ isActive: true })
      .sort({ postCount: -1 })
      .limit(20)
      .select('slug')
      .lean()

    console.log(`[Static Generation] Pre-rendering ${categories.length} category pages`)

    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    return []
  }
}

// =========================================
// SERVER-SIDE DATA FETCHING
// =========================================
async function getCategory(slug) {
  try {
    await connectDB()

    const category = await Category.findOne({
      slug,
      isActive: true
    }).lean()

    if (!category) return null

    // Get real post count
    const postCount = await Post.countDocuments({
      category: category._id,
      status: 'published'
    })

    return {
      ...category,
      _id: category._id.toString(),
      postCount
    }
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getCategoryPosts(categoryId, page = 1, limit = 12) {
  try {
    await connectDB()

    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      Post.find({
        category: categoryId,
        status: 'published'
      })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name profilePictureUrl')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImageUrl featuredImageAlt publishedAt readingTime views author category')
        .lean(),

      Post.countDocuments({
        category: categoryId,
        status: 'published'
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      posts: posts.map(post => ({
        ...post,
        _id: post._id.toString(),
        author: post.author ? {
          ...post.author,
          _id: post.author._id.toString()
        } : null,
        category: post.category ? {
          ...post.category,
          _id: post.category._id.toString()
        } : null,
        publishedAt: post.publishedAt?.toISOString() || null
      })),
      pagination: {
        current: page,
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error('Error fetching category posts:', error)
    return {
      posts: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  }
}

async function getAllCategories() {
  try {
    await connectDB()

    const categories = await Category.find({ isActive: true })
      .select('name slug color postCount')
      .sort({ name: 1 })
      .lean()

    // Get real post counts
    const postCounts = await Post.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ])

    return categories.map(category => {
      const countData = postCounts.find(pc =>
        pc._id && pc._id.toString() === category._id.toString()
      )
      return {
        ...category,
        _id: category._id.toString(),
        postCount: countData ? countData.count : 0
      }
    })
  } catch (error) {
    console.error('Error fetching all categories:', error)
    return []
  }
}

// =========================================
// GENERATE METADATA FOR SEO
// =========================================
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params
    const category = await getCategory(resolvedParams.slug)

    if (!category) {
      return {
        title: 'Category Not Found | Multigyan',
        description: 'The requested category could not be found.'
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const categoryUrl = `${siteUrl}/category/${category.slug}`

    const metadata = generateSEOMetadata({
      title: `${category.name} Articles - Multigyan`,
      description: category.description || `Explore ${category.postCount} articles about ${category.name} on Multigyan. Stay updated with the latest insights, tutorials, and guides.`,
      keywords: [category.name, `${category.name} articles`, `${category.name} blog`, 'Multigyan'],
      canonicalUrl: categoryUrl,
      imageUrl: `${siteUrl}/images/categories/${category.slug}.jpg`, // You can add category images later
      type: 'website'
    })

    // Add OpenGraph for better social sharing
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'website',
      title: `${category.name} Articles`,
      description: category.description || `Explore ${category.postCount} articles about ${category.name}`,
      url: categoryUrl,
      siteName: 'Multigyan'
    }

    return metadata
  } catch (error) {
    console.error('Error generating metadata for category:', error)
    return {
      title: 'Error | Multigyan',
      description: 'An error occurred while loading the category.'
    }
  }
}

// =========================================
// MAIN CATEGORY PAGE COMPONENT (SERVER)
// =========================================
export default async function CategoryPage({ params }) {
  try {
    const resolvedParams = await params

    // Fetch all data server-side
    const [category, allCategories] = await Promise.all([
      getCategory(resolvedParams.slug),
      getAllCategories()
    ])

    if (!category) {
      notFound()
    }

    // Fetch initial posts (page 1)
    const { posts, pagination } = await getCategoryPosts(category._id, 1, 12)

    // Pass data to client component for interactivity
    return (
      <CategoryClient
        category={category}
        initialPosts={posts}
        initialPagination={pagination}
        allCategories={allCategories}
      />
    )
  } catch (error) {
    console.error('Error loading category page:', error)
    notFound()
  }
}