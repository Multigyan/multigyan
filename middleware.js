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

  return NextResponse.next()
}

// ✅ OPTIMIZED: Exclude static assets to reduce function invocations
// Vercel automatically handles cache headers for _next/static and images
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     * - *.png, *.jpg, *.jpeg, *.gif, *.webp, *.svg, *.ico (images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
}
