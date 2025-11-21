import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Use Bing's generated IndexNow API key
// This key should match the one in your .env.local file
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || 'ee437560fbb74237a0d9806a081fc980'

/**
 * IndexNow API Key Endpoint
 * This file serves the IndexNow API key for verification
 * The key must be accessible at: https://www.multigyan.in/{key}.txt
 */
export async function GET() {
    return new NextResponse(INDEXNOW_KEY, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    })
}
