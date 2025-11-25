import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import Category from '@/models/Category' // ✅ FIX: Import Category to register schema
import ProfileClient from './ProfileClient'

async function getUserByUsername(username) {
  try {
    await connectDB()

    const user = await User.findOne({
      username: username.toLowerCase(),
      isActive: true
    }).select('-password')

    return user ? JSON.parse(JSON.stringify(user)) : null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

async function getUserPosts(userId) {
  try {
    await connectDB()

    const posts = await Post.find({
      author: userId,
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate('category', 'name slug')
      .select('title slug excerpt featuredImageUrl publishedAt readingTime views likes category')
      .lean()

    return JSON.parse(JSON.stringify(posts))
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

async function getUserStats(userId) {
  try {
    await connectDB()

    // ✅ FIX: Calculate stats in real-time from actual posts
    const [user, publishedPosts] = await Promise.all([
      User.findById(userId).select('followers following'),
      Post.find({ author: userId, status: 'published' }).select('views likes')
    ])

    if (!user) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        followersCount: 0,
        followingCount: 0
      }
    }

    // Calculate totals from actual posts
    const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0)
    const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)

    return {
      totalPosts: publishedPosts.length,
      totalViews: totalViews,
      totalLikes: totalLikes,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      followersCount: 0,
      followingCount: 0
    }
  }
}

// ========================================
// Generate metadata for SEO
// ========================================
export async function generateMetadata({ params }) {
  // ✅ FIX: Await params before using it (Next.js 15+ requirement)
  const resolvedParams = await params
  const { username } = resolvedParams

  const user = await getUserByUsername(username)

  if (!user) {
    return {
      title: 'User Not Found - Multigyan',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const profileUrl = `${siteUrl}/profile/${user.username}`
  const imageUrl = user.profilePictureUrl || `${siteUrl}/images/default-profile.jpg`

  return {
    title: `${user.name} (@${user.username}) - Multigyan`,
    description: user.bio || `View ${user.name}'s profile on Multigyan. ${user.stats?.totalPosts || 0} posts published.`,
    openGraph: {
      title: `${user.name} (@${user.username})`,
      description: user.bio || `View ${user.name}'s profile on Multigyan`,
      url: profileUrl,
      siteName: 'Multigyan',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${user.name}'s profile picture`,
        },
      ],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name} (@${user.username})`,
      description: user.bio || `View ${user.name}'s profile on Multigyan`,
      images: [imageUrl],
      creator: user.twitterHandle || '@multigyan',
    },
    alternates: {
      canonical: profileUrl,
    },
  }
}

// ========================================
// Main Profile Page Component
// ========================================
export default async function ProfilePage({ params }) {
  // ✅ FIX: Await params before using it (Next.js 15+ requirement)
  const resolvedParams = await params
  const { username } = resolvedParams

  const user = await getUserByUsername(username)

  if (!user) {
    notFound()
  }

  const [posts, stats] = await Promise.all([
    getUserPosts(user._id),
    getUserStats(user._id)
  ])

  return <ProfileClient initialUser={user} initialPosts={posts} initialStats={stats} />
}

// =========================================
// ISR CONFIGURATION
// =========================================
// ✅ OPTIMIZED: Changed from force-dynamic to ISR
// Profile pages don't need real-time updates
export const revalidate = 3600 // Revalidate every 1 hour
