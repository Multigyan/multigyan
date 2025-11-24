import { NextResponse } from 'next/server'

/**
 * Media API Route
 * 
 * Fetch media from Cloudinary media library folder
 * Uses Cloudinary Admin API to list resources
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const maxResults = searchParams.get('max_results') || '30'
        const nextCursor = searchParams.get('next_cursor')

        // Build Cloudinary Admin API URL
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`

        const params = new URLSearchParams({
            type: 'upload',
            prefix: 'multigyan/media-library',
            max_results: maxResults,
            tags: 'true',
            context: 'true'
        })

        if (nextCursor) {
            params.append('next_cursor', nextCursor)
        }

        // Make request to Cloudinary
        const response = await fetch(`${url}?${params}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')}`
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch from Cloudinary')
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Media API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch media', message: error.message },
            { status: 500 }
        )
    }
}

// Optional: DELETE endpoint to remove media
export async function DELETE(request) {
    try {
        const { public_id } = await request.json()

        if (!public_id) {
            return NextResponse.json(
                { error: 'public_id is required' },
                { status: 400 }
            )
        }

        // Delete from Cloudinary
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload`

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                public_ids: [public_id]
            })
        })

        if (!response.ok) {
            throw new Error('Failed to delete from Cloudinary')
        }

        const data = await response.json()

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Media delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete media', message: error.message },
            { status: 500 }
        )
    }
}
