import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Post from '@/models/Post'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { categoryIds, newName, newDescription, newColor } = await request.json()

    // Validation
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 categories are required for merging' },
        { status: 400 }
      )
    }

    if (!newName || newName.trim().length === 0) {
      return NextResponse.json(
        { error: 'New category name is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verify all categories exist
    const categoriesToMerge = await Category.find({
      _id: { $in: categoryIds }
    })

    if (categoriesToMerge.length !== categoryIds.length) {
      return NextResponse.json(
        { error: 'One or more categories not found' },
        { status: 404 }
      )
    }

    // Create new category
    const newCategory = new Category({
      name: newName.trim(),
      description: newDescription?.trim() || '',
      color: newColor || '#3b82f6',
      postCount: 0
    })

    await newCategory.save()

    // Move all posts from old categories to new category
    const result = await Post.updateMany(
      { category: { $in: categoryIds } },
      { $set: { category: newCategory._id } }
    )

    // Update post count for new category
    const totalPosts = await Post.countDocuments({ 
      category: newCategory._id,
      status: 'published'
    })
    
    newCategory.postCount = totalPosts
    await newCategory.save()

    // Delete old categories
    await Category.deleteMany({ _id: { $in: categoryIds } })

    return NextResponse.json({
      message: `Successfully merged ${categoryIds.length} categories`,
      newCategory,
      movedPosts: result.modifiedCount
    })

  } catch (error) {
    console.error('Error merging categories:', error)

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
