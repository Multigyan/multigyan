import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Generate a unique API key for IndexNow
// This key should be consistent across requests
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || crypto.randomBytes(32).toString('hex')

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
