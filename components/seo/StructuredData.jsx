/**
 * StructuredData Component
 * Renders JSON-LD structured data for SEO
 * Supports multiple schema types: Organization, BreadcrumbList, BlogPosting, ItemList, etc.
 */
export default function StructuredData({ data }) {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Helper function to generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Multigyan',
    url: 'https://www.multigyan.in',
    logo: 'https://www.multigyan.in/Multigyan_Logo_bg.png',
    description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform.',
    sameAs: [
      'https://twitter.com/Multigyan_in',
      'https://t.me/multigyanexpert',
      'https://www.linkedin.com/company/multigyan/',
      'https://instagram.com/multigyan.info',
      'https://youtube.com/@multigyan_in',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: 'https://www.multigyan.in/contact',
    }
  }
}

/**
 * Helper function to generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `https://www.multigyan.in${item.url}` : undefined,
    }))
  }
}

/**
 * Helper function to generate BlogPosting schema
 */
export function generateBlogPostingSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name,
      url: post.author?.username ? `https://www.multigyan.in/author/${post.author.username}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Multigyan',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.multigyan.in/Multigyan_Logo_bg.png',
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.multigyan.in${post.url || `/blog/${post.slug}`}`,
    }
  }
}

/**
 * Helper function to generate ItemList schema for blog listing
 */
export function generateItemListSchema(posts, page = 1) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * 12 + index + 1,
      url: `https://www.multigyan.in${post.url || `/blog/${post.slug}`}`,
      name: post.title,
    }))
  }
}

/**
 * Helper function to generate WebSite schema with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Multigyan',
    url: 'https://www.multigyan.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.multigyan.in/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }
}
