import { notFound } from 'next/navigation'
import AuthorClient from './AuthorClient'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import { generateAuthorSchema } from '@/lib/seo-enhanced'
import EnhancedSchema from '@/components/seo/EnhancedSchema'

// =========================================
// GENERATE STATIC PARAMS FOR BUILD TIME
// =========================================
// Pre-generate pages for top 50 most active authors
export async function generateStaticParams() {
  try {
    await connectDB()

    // Get top 50 authors by post count
    const authors = await User.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $addFields: {
          postCount: {
            $size: {
              $filter: {
                input: '$posts',
                as: 'post',
                cond: { $eq: ['$$post.status', 'published'] }
              }
            }
          }
        }
      },
      { $match: { postCount: { $gt: 0 } } },
      { $sort: { postCount: -1 } },
      { $limit: 50 },
      { $project: { username: 1 } }
    ])

    console.log(`[Static Generation] Pre-rendering ${authors.length} author pages`)

    return authors.map((author) => ({
      username: author.username,
    }))
  } catch (error) {
    console.error('Error generating static params for authors:', error)
    return []
  }
}

// ✅ OPTIMIZED: Direct DB query instead of loopback API call
// This eliminates the double invocation (page + API) and reduces latency
async function getAuthor(username) {
  try {
    await connectDB()

    const author = await User.findOne({ username, isActive: true })
      .select('name email username profilePictureUrl bio role twitterHandle createdAt')
      .lean()

    if (!author) return null

    // Get author stats from aggregation
    const stats = await User.aggregate([
      { $match: { _id: author._id } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$authorId', { $ifNull: ['$following', []] }]
                }
              }
            }
          ],
          as: 'followers'
        }
      },
      {
        $addFields: {
          publishedPosts: {
            $filter: {
              input: '$posts',
              as: 'post',
              cond: { $eq: ['$$post.status', 'published'] }
            }
          }
        }
      },
      {
        $project: {
          totalPosts: { $size: '$publishedPosts' },
          totalViews: { $sum: '$publishedPosts.views' },
          totalLikes: { $sum: '$publishedPosts.likes' },
          followersCount: { $size: '$followers' }
        }
      }
    ])

    return {
      ...author,
      _id: author._id.toString(),
      stats: stats[0] || { totalPosts: 0, totalViews: 0, totalLikes: 0 }
    }
  } catch (error) {
    console.error('Error fetching author for metadata:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { username } = resolvedParams

  const author = await getAuthor(username)

  if (!author) {
    return {
      title: 'Author Not Found - Multigyan',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const authorUrl = `${siteUrl}/author/${author.username}`
  const imageUrl = author.profilePictureUrl || `${siteUrl}/images/default-author.jpg`

  return {
    title: `${author.name} (@${author.username}) - Articles on Multigyan`,
    description: author.bio || `Explore articles by ${author.name} on Multigyan. ${author.stats?.totalPosts || 0} published articles with ${author.stats?.totalViews?.toLocaleString() || 0} total views.`,
    keywords: [
      author.name,
      `${author.name} articles`,
      'Multigyan author',
      author.role === 'admin' ? 'Multigyan admin' : 'Multigyan writer',
      ...(author.bio ? author.bio.split(' ').slice(0, 5) : [])
    ],
    authors: [{ name: author.name }],
    creator: author.name,
    publisher: 'Multigyan',

    openGraph: {
      type: 'profile',
      title: `${author.name} (@${author.username})`,
      description: author.bio || `Read articles by ${author.name} on Multigyan`,
      url: authorUrl,
      siteName: 'Multigyan',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${author.name}'s profile picture`,
        },
      ],
      locale: 'en_US',
      profile: {
        firstName: author.name.split(' ')[0],
        lastName: author.name.split(' ').slice(1).join(' '),
        username: author.username,
        gender: 'neutral',
      },
    },

    twitter: {
      card: 'summary_large_image',
      title: `${author.name} (@${author.username})`,
      description: author.bio || `Read articles by ${author.name} on Multigyan`,
      images: [imageUrl],
      creator: author.twitterHandle || '@multigyan',
      site: '@multigyan',
    },

    alternates: {
      canonical: authorUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Main page component (server component)
export default async function AuthorPage({ params }) {
  const resolvedParams = await params
  const { username } = resolvedParams

  // Fetch author data for schema
  const author = await getAuthor(username)

  if (!author) {
    notFound()
  }

  // Generate Person schema for rich results
  const personSchema = generateAuthorSchema(author)

  return (
    <>
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <main id="main-content">
        <EnhancedSchema schemas={[personSchema]} />
        <AuthorClient params={params} />
      </main>
    </>
  )
}

// =========================================
// ISR CONFIGURATION
// =========================================
// ✅ OPTIMIZED: Changed from force-dynamic to ISR
// Author pages don't need real-time updates
export const revalidate = 3600 // Revalidate every 1 hour
