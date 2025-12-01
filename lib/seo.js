// SEO utilities for generating metadata in Next.js 15 App Router

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  canonicalUrl,
  imageUrl,
  imageAlt,
  type = 'website',
  siteName = 'Multigyan',
  twitterHandle = '@multigyan',
  locale = 'en_US',
  category,
  tags = [],
  noIndex = false,
  noFollow = false
}) {
  // Generate optimized title
  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} - Multi-Author Blogging Platform`

  // Generate meta description
  const metaDescription = description ||
    `Discover insightful articles on ${siteName}. A platform for knowledge sharing by expert authors across various topics.`

  // Generate keywords string
  const keywordsString = keywords.length > 0
    ? keywords.join(', ')
    : 'blog, articles, knowledge, learning, insights'

  // Generate robots content
  const robots = {
    index: !noIndex,
    follow: !noFollow,
    googleBot: {
      index: !noIndex,
      follow: !noFollow,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }

  // Base metadata
  const metadata = {
    title: fullTitle,
    description: metaDescription,
    keywords: keywordsString,
    authors: author ? [{ name: author.name }] : [{ name: siteName }],
    creator: author?.name || siteName,
    publisher: siteName,
    robots,
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      title: title || siteName,
      description: metaDescription,
      siteName,
      locale,
      ...(canonicalUrl && { url: canonicalUrl }),
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: imageAlt || title || siteName,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: author?.twitterHandle || twitterHandle,
      title: title || siteName,
      description: metaDescription,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            alt: imageAlt || title || siteName,
          },
        ],
      }),
    },
    other: {
      'theme-color': '#1f2937',
      'msapplication-TileColor': '#1f2937',
    },
  }

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph.type = 'article'
    // ✅ NOTEBOOKLM FIX: Ensure article OpenGraph uses article description
    metadata.openGraph.article = {
      publishedTime: publishedTime,
      modifiedTime: modifiedTime,
      authors: author ? [author.name] : [],
      section: category,
      tags: tags
    }
  }

  return metadata
}

export function generateStructuredData({
  type = 'website',
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  canonicalUrl,
  imageUrl,
  imageAlt,
  category,
  tags = [],
  readingTime,
  siteName = 'Multigyan'
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (type === 'article' && author) {
    // ✅ FIX: Generate author URL with multiple fallbacks
    const authorUrl = author.username
      ? `${siteUrl}/author/${author.username}`
      : author._id
        ? `${siteUrl}/profile/${author._id.toString ? author._id.toString() : author._id}`
        : author.name
          ? `${siteUrl}/author/${author.name.toLowerCase().replace(/\s+/g, '-')}`
          : `${siteUrl}/authors`

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Person",
        "name": author.name,
        "url": authorUrl,  // ✅ Added author URL
        ...(author.profilePictureUrl && { "image": author.profilePictureUrl })
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      },
      ...(publishedTime && { "datePublished": publishedTime }),
      ...(modifiedTime && { "dateModified": modifiedTime }),
      ...(canonicalUrl && { "url": canonicalUrl }),
      ...(imageUrl && {
        "image": {
          "@type": "ImageObject",
          "url": imageUrl,
          "alt": imageAlt || title
        }
      }),
      ...(category && { "articleSection": category }),
      ...(tags.length > 0 && { "keywords": tags.join(', ') }),
      ...(readingTime && { "timeRequired": `PT${readingTime}M` })
    }
  }

  if (type === 'website') {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "description": description,
      "url": siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }
  }

  if (type === 'organization') {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteName,
      "description": description,
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      },
      "sameAs": [
        // Add your social media URLs here
        // "https://twitter.com/multigyan",
        // "https://linkedin.com/company/multigyan"
      ]
    }
  }

  return null
}

export function generateBreadcrumbStructuredData(breadcrumbs) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": `${siteUrl}${breadcrumb.href}`
    }))
  }
}