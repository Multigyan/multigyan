import { NextResponse } from 'next/server'

/**
 * API Route: Download image from URL (bypasses CORS)
 * POST /api/download-image
 * 
 * This route downloads images server-side to bypass browser CORS restrictions
 * Useful for Google Drive URLs and other sources that block direct browser access
 */

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl
    try {
      validUrl = new URL(url)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log('Downloading image from:', url)

    // Fetch the image from the URL (server-side, no CORS restrictions)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to download image: ${response.statusText}` },
        { status: response.status }
      )
    }

    // Get the image data as buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Validate it's an image
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to an image file' },
        { status: 400 }
      )
    }

    console.log('Image downloaded successfully:', {
      size: buffer.length,
      type: contentType
    })

    // Return the image as base64
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    return NextResponse.json({
      success: true,
      dataUrl,
      size: buffer.length,
      contentType
    })

  } catch (error) {
    console.error('Error downloading image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download image' },
      { status: 500 }
    )
  }
}
