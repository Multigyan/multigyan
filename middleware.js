import { NextResponse } from 'next/server'

// Map of old Hindi slugs to new English slugs
const slugRedirects = {
  'पोपुलर-प्रोग्रामिंग-भाषाओं-का-व्यावहारिक-उपयोग-एक-संपूर्ण-गाइड-2025':
    'popular-programming-languages-practical-guide-2025',
  // Add more redirects here as needed
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if the URL is a blog post URL
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '')

    // Check if this slug needs to be redirected
    if (slugRedirects[slug]) {
      const newUrl = new URL(`/blog/${slugRedirects[slug]}`, request.url)
      return NextResponse.redirect(newUrl, 301) // Permanent redirect
    }
  }

  const response = NextResponse.next()

  // ⚡ PHASE 3: Add cache headers for static assets
  if (pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // ⚡ PHASE 3: Add cache headers for images
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  }

  return response
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/image).*)', // Run on all routes except API and Next.js image optimization
  ],
}
