import { NextResponse } from 'next/server'

// GET - Legacy confirmation endpoint (redirects to homepage)
// This endpoint is kept for backward compatibility but is no longer used
// since we removed double opt-in
export async function GET(request) {
  // Simply redirect to homepage with a message
  return NextResponse.redirect(
    new URL('/?message=subscribed', process.env.NEXT_PUBLIC_SITE_URL)
  )
}
