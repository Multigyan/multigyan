import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import logger from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Get user data
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's posts
    const posts = await Post.find({ author: session.user.id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })

    // Get user's comments
    const comments = await Comment.find({ author: session.user.id })
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })

    // Prepare export data
    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
        twitterHandle: user.twitterHandle,
        linkedinUrl: user.linkedinUrl,
        website: user.website,
        settings: user.settings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      posts: posts.map(post => ({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImageUrl: post.featuredImageUrl,
        category: post.category?.name,
        tags: post.tags,
        status: post.status,
        views: post.views,
        likes: post.likes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt
      })),
      comments: comments.map(comment => ({
        content: comment.content,
        post: comment.post?.title,
        status: comment.status,
        createdAt: comment.createdAt
      })),
      stats: {
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
        totalComments: comments.length,
        totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
        totalLikes: posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
      },
      exportedAt: new Date().toISOString(),
      platform: 'Multigyan'
    }

    // Create JSON blob
    const jsonData = JSON.stringify(exportData, null, 2)
    
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Disposition', `attachment; filename="multigyan-data-${new Date().toISOString().split('T')[0]}.json"`)
    
    return new Response(jsonData, { headers })

  } catch (error) {
    logger.error('Data export error:', { error })
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
