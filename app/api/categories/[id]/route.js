import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Post from '@/models/Post'
import { invalidatePostCaches } from '@/lib/cache' // ✅ ADD CACHE INVALIDATION

// GET single category
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params

    await connectDB()

    const category = await Category.findById(resolvedParams.id)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update category (Admin only)
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { name, description, color, isActive, type } = await request.json()

    // Validation
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Category name is required' },
          { status: 400 }
        )
      }

      if (name.length > 50) {
        return NextResponse.json(
          { error: 'Category name cannot be more than 50 characters' },
          { status: 400 }
        )
      }
    }

    if (description !== undefined && description.length > 200) {
      return NextResponse.json(
        { error: 'Description cannot be more than 200 characters' },
        { status: 400 }
      )
    }

    if (color !== undefined && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return NextResponse.json(
        { error: 'Please provide a valid hex color' },
        { status: 400 }
      )
    }

    if (type !== undefined && !['blog', 'store', 'both'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be blog, store, or both' },
        { status: 400 }
      )
    }

    await connectDB()

    const category = await Category.findById(resolvedParams.id)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: resolvedParams.id }
      })

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Update fields
    if (name !== undefined) category.name = name.trim()
    if (description !== undefined) category.description = description.trim()
    if (color !== undefined) category.color = color
    if (isActive !== undefined) category.isActive = isActive
    if (type !== undefined) category.type = type

    await category.save()

    // ✅ CLEAR CACHE - Category details changed, affects post listings!
    invalidatePostCaches()

    return NextResponse.json({
      message: 'Category updated successfully',
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        postCount: category.postCount,
        isActive: category.isActive
      }
    })

  } catch (error) {
    console.error('Error updating category:', error)

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

// DELETE category (Admin only)
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const category = await Category.findById(resolvedParams.id)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // ✅ NEW: Check if there are posts with this category
    const postCount = await Post.countDocuments({ category: resolvedParams.id })

    // ✅ NEW: Remove category from all posts (set to null)
    if (postCount > 0) {
      // Find or create "Uncategorized" category
      let uncategorized = await Category.findOne({
        slug: 'uncategorized'
      })

      if (!uncategorized) {
        uncategorized = await Category.create({
          name: 'Uncategorized',
          description: 'Posts without a specific category',
          color: '#6B7280'
        })
      }

      // Move all posts to "Uncategorized"
      await Post.updateMany(
        { category: resolvedParams.id },
        { $set: { category: uncategorized._id } }
      )

      // Update post counts
      const publishedCount = await Post.countDocuments({
        category: uncategorized._id,
        status: 'published'
      })
      uncategorized.postCount = publishedCount
      await uncategorized.save()
    }

    // Delete the category
    await Category.findByIdAndDelete(resolvedParams.id)

    // ✅ CLEAR CACHE - Category deleted, posts moved to uncategorized!
    invalidatePostCaches()

    return NextResponse.json({
      message: postCount > 0
        ? `Category deleted successfully. ${postCount} post(s) moved to Uncategorized.`
        : 'Category deleted successfully',
      movedPosts: postCount
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
