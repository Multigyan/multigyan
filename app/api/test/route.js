import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Category, Post, DEFAULT_CATEGORIES } from '@/models'

export async function GET() {
  try {
    // Test database connection
    await connectDB()
    
    // Get collection stats
    const userCount = await User.countDocuments()
    const categoryCount = await Category.countDocuments()
    const postCount = await Post.countDocuments()

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        categories: categoryCount,
        posts: postCount
      },
      collections: {
        users: {
          total: userCount,
          authors: await User.countDocuments({ role: 'author' }),
          admins: await User.countDocuments({ role: 'admin' })
        },
        categories: {
          total: categoryCount,
          active: await Category.countDocuments({ isActive: true })
        },
        posts: {
          total: postCount,
          published: await Post.countDocuments({ status: 'published' }),
          draft: await Post.countDocuments({ status: 'draft' }),
          pending: await Post.countDocuments({ status: 'pending_review' }),
          rejected: await Post.countDocuments({ status: 'rejected' })
        }
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Seed initial data
    await connectDB()

    let results = {
      categories: { created: 0, skipped: 0 },
      users: { created: 0, skipped: 0 }
    }

    // Seed categories
    for (const categoryData of DEFAULT_CATEGORIES) {
      const existingCategory = await Category.findOne({ name: categoryData.name })
      if (!existingCategory) {
        await Category.create(categoryData)
        results.categories.created++
      } else {
        results.categories.skipped++
      }
    }

    // Create default admin user if not exists
    const adminExists = await User.findOne({ role: 'admin' })
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@multigyan.in',
        password: 'admin123',
        role: 'admin',
        bio: 'System administrator and content moderator',
        isVerified: true
      })
      results.users.created++
    } else {
      results.users.skipped++
    }

    // Create default author user if not exists
    const authorExists = await User.findOne({ email: 'author@multigyan.in' })
    if (!authorExists) {
      await User.create({
        name: 'Demo Author',
        email: 'author@multigyan.in',
        password: 'author123',
        role: 'author',
        bio: 'Passionate writer and technology enthusiast',
        isVerified: true
      })
      results.users.created++
    } else {
      results.users.skipped++
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database seeded successfully',
      results
    })

  } catch (error) {
    console.error('Database seed error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database seeding failed',
      error: error.message
    }, { status: 500 })
  }
}