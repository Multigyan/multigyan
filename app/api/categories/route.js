import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

// GET all categories
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const query = includeInactive ? {} : { isActive: true }
    
    const categories = await Category.find(query)
      .select('name slug description color postCount isActive createdAt')
      .sort({ name: 1 })

    return NextResponse.json({
      categories,
      total: categories.length
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new category (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { name, description, color } = await request.json()

    // Validation
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

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: 'Description cannot be more than 200 characters' },
        { status: 400 }
      )
    }

    if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return NextResponse.json(
        { error: 'Please provide a valid hex color' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    // Create new category
    const newCategory = new Category({
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#3B82F6'
    })

    await newCategory.save()

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category: {
          id: newCategory._id,
          name: newCategory.name,
          slug: newCategory.slug,
          description: newCategory.description,
          color: newCategory.color,
          postCount: newCategory.postCount
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating category:', error)

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}