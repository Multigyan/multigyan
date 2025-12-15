export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

    // ✅ FIX: Extract hostname for Host directive (robots.txt doesn't accept full URLs)
    const hostname = new URL(baseUrl).hostname

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard/',
                    '/(dashboard)/',
                    '/admin/',
                    '/_next/',
                    '/private/',
                ],
                crawlDelay: 0,
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/(dashboard)/', '/admin/'],
                crawlDelay: 0,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/(dashboard)/', '/admin/'],
                crawlDelay: 0,
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: hostname, // ✅ Use hostname only (e.g., "www.multigyan.in")
    }
}
