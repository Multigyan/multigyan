export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

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
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/(dashboard)/', '/admin/'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/(dashboard)/', '/admin/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
