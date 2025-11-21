import { NextResponse } from 'next/server'
import { submitToIndexNow } from '@/lib/indexnow'

/**
 * IndexNow Manual Submission Endpoint
 * POST /api/indexnow
 * 
 * Body: { url: string } or { urls: string[] }
 */
export async function POST(request) {
    try {
        const body = await request.json()
        const { url, urls } = body

        if (!url && !urls) {
            return NextResponse.json(
                { error: 'Missing url or urls parameter' },
                { status: 400 }
            )
        }

        const urlsToSubmit = urls || [url]
        const result = await submitToIndexNow(urlsToSubmit)

        if (result.success) {
            return NextResponse.json(result, { status: 200 })
        } else {
            return NextResponse.json(result, { status: 500 })
        }
    } catch (error) {
        console.error('IndexNow API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to submit to IndexNow',
                details: error.message
            },
            { status: 500 }
        )
    }
}

/**
 * GET endpoint to check IndexNow configuration
 */
export async function GET() {
    const { getIndexNowKey, getIndexNowKeyLocation } = await import('@/lib/indexnow')

    return NextResponse.json({
        configured: true,
        keyLocation: getIndexNowKeyLocation(),
        message: 'IndexNow is configured and ready to use'
    })
}
