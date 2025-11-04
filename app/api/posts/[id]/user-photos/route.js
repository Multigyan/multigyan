import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Post from '@/models/Post'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * GET /api/posts/[id]/user-photos
 * Get all user photos for a post
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    
    await connectDB()

    const post = await Post.findById(resolvedParams.id)
      .populate('userPhotos.user', 'name profilePictureUrl')
      .select('userPhotos')
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Sort photos by most liked first, then newest
    const sortedPhotos = post.userPhotos
      .map(photo => ({
        _id: photo._id,
        user: photo.user,
        imageUrl: photo.imageUrl,
        caption: photo.caption,
        likes: photo.likes,
        createdAt: photo.createdAt
      }))
      .sort((a, b) => {
        // First sort by likes
        if (b.likes.length !== a.likes.length) {
          return b.likes.length - a.likes.length
        }
        // Then by date
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

    return NextResponse.json({
      success: true,
      photos: sortedPhotos
    })

  } catch (error) {
    console.error('Error fetching user photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts/[id]/user-photos
 * Upload a user photo
 */
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to upload photos' },
        { status: 401 }
      )
    }

    const { imageData, caption } = await request.json()

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const post = await Post.findById(resolvedParams.id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post is published
    if (post.status !== 'published') {
      return NextResponse.json(
        { error: 'Can only upload photos to published posts' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: 'multigyan/user-photos',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })

    // Add photo to post
    await post.addUserPhoto(
      session.user.id,
      uploadResponse.secure_url,
      caption || ''
    )

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      imageUrl: uploadResponse.secure_url
    })

  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/posts/[id]/user-photos
 * Like/unlike a user photo
 */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      )
    }

    const { photoId } = await request.json()

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const post = await Post.findById(resolvedParams.id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    await post.likeUserPhoto(photoId, session.user.id)

    // Get updated likes array
    const photo = post.userPhotos.id(photoId)
    
    return NextResponse.json({
      success: true,
      likes: photo.likes
    })

  } catch (error) {
    console.error('Error liking photo:', error)
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}
