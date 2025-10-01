import { NextResponse } from 'next/server'

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const robotsTxt = `# Multigyan - Robots.txt
# Updated: ${new Date().toISOString()}

# Allow all search engines to crawl the site
User-agent: *
Allow: /

# Sitemaps - Multiple sitemaps for better organization
Sitemap: ${siteUrl}/sitemap_index.xml
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/blog-sitemap.xml

# Allow public content
Allow: /blog/
Allow: /blog/*
Allow: /category/
Allow: /category/*
Allow: /author/
Allow: /author/*
Allow: /authors/
Allow: /categories/
Allow: /about
Allow: /contact
Allow: /help
Allow: /privacy-policy
Allow: /terms-of-service

# Allow RSS and Atom feeds
Allow: /api/feed/rss
Allow: /api/feed/atom
Allow: /rss.xml

# Disallow authentication pages
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

# Disallow dashboard and admin areas
Disallow: /dashboard/
Disallow: /dashboard/*
Disallow: /admin/
Disallow: /admin/*

# Disallow API endpoints (except feeds)
Disallow: /api/
Allow: /api/feed/

# Disallow search results to prevent duplicate content
Disallow: /search
Disallow: /search?*

# Disallow internal files
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*_buildManifest.js$
Disallow: /*_middlewareManifest.js$
Disallow: /*_ssgManifest.js$
Disallow: /*.js$

# Specific bot configurations
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: Slurp
Allow: /
Crawl-delay: 1

# Block AI scrapers (optional - uncomment if you want to block them)
# User-agent: GPTBot
# Disallow: /
# 
# User-agent: ChatGPT-User
# Disallow: /
# 
# User-agent: CCBot
# Disallow: /
# 
# User-agent: anthropic-ai
# Disallow: /
# 
# User-agent: Claude-Web
# Disallow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Crawl-delay for all bots (in seconds)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400'
    }
  })
}
