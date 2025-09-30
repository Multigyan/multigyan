"use client"

import Head from 'next/head'

export default function MetaTags({
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
  readingTime,
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
  const robotsContent = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`

  // Generate structured data for articles
  const generateArticleStructuredData = () => {
    if (type !== 'article' || !author) return null

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Person",
        "name": author.name,
        ...(author.profilePictureUrl && { "image": author.profilePictureUrl })
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`
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

    return JSON.stringify(structuredData)
  }

  // Generate website structured data
  const generateWebsiteStructuredData = () => {
    if (type !== 'website') return null

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "description": metaDescription,
      "url": process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }

    return JSON.stringify(structuredData)
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywordsString} />
      <meta name="robots" content={robotsContent} />
      <meta name="language" content="en" />
      <meta name="author" content={author?.name || siteName} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:alt" content={imageAlt || title} />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
      
      {/* Article-specific Open Graph */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author.name} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {category && <meta property="article:section" content={category} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={author?.twitterHandle || twitterHandle} />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={metaDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />
      
      {/* Structured Data */}
      {generateArticleStructuredData() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateArticleStructuredData()
          }}
        />
      )}
      
      {generateWebsiteStructuredData() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateWebsiteStructuredData()
          }}
        />
      )}
      
      {/* RSS Feed */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteName} RSS Feed`}
        href="/api/feed/rss"
      />
      
      {/* Atom Feed */}
      <link
        rel="alternate"
        type="application/atom+xml"
        title={`${siteName} Atom Feed`}
        href="/api/feed/atom"
      />
    </Head>
  )
}