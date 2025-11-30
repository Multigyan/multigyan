import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// POST /api/revalidate/store - Manual revalidation endpoint
export async function POST(request) {
    try {
        const body = await request.json()
        const { secret } = body

        // Validate secret key
        if (secret !== process.env.REVALIDATE_SECRET) {
            return NextResponse.json(
                { error: 'Invalid secret' },
                { status: 401 }
            )
        }

        // Revalidate the store page
        revalidatePath('/store')

        return NextResponse.json({
            revalidated: true,
            timestamp: Date.now(),
            message: 'Store page revalidated successfully'
        })
    } catch (error) {
        console.error('Error revalidating store page:', error)
        return NextResponse.json(
            { error: 'Failed to revalidate' },
            { status: 500 }
        )
    }
}
