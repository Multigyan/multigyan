import { NextResponse } from 'next/server'

export function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

    const manifest = {
        name: 'Multigyan - Multi-Author Blogging Platform',
        short_name: 'Multigyan',
        description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform for sharing knowledge and insights.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f2937',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en-US',
        dir: 'ltr',
        categories: ['education', 'news', 'productivity'],

        icons: [
            {
                src: '/Multigyan_Logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/Multigyan_Logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/Multigyan_Logo_bg.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/Multigyan_Logo.ico',
                sizes: '16x16 32x32 48x48',
                type: 'image/x-icon'
            }
        ],

        screenshots: [
            {
                src: `${siteUrl}/og-image.png`,
                sizes: '1200x630',
                type: 'image/png',
                form_factor: 'wide'
            }
        ],

        shortcuts: [
            {
                name: 'Browse Blog',
                short_name: 'Blog',
                description: 'Read latest blog posts',
                url: '/blog',
                icons: [
                    {
                        src: '/Multigyan_Logo.png',
                        sizes: '96x96'
                    }
                ]
            },
            {
                name: 'Write Post',
                short_name: 'Write',
                description: 'Create a new blog post',
                url: '/dashboard/posts/new',
                icons: [
                    {
                        src: '/Multigyan_Logo.png',
                        sizes: '96x96'
                    }
                ]
            },
            {
                name: 'Categories',
                short_name: 'Categories',
                description: 'Browse by category',
                url: '/categories',
                icons: [
                    {
                        src: '/Multigyan_Logo.png',
                        sizes: '96x96'
                    }
                ]
            }
        ],

        related_applications: [],
        prefer_related_applications: false,

        share_target: {
            action: '/dashboard/posts/new',
            method: 'GET',
            enctype: 'application/x-www-form-urlencoded',
            params: {
                title: 'title',
                text: 'text',
                url: 'url'
            }
        }
    }

    return NextResponse.json(manifest, {
        headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
        }
    })
}
