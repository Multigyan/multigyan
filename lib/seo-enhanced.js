// Enhanced SEO utilities with bilingual support and schema markup

/**
 * Generate hreflang tags for bilingual content
 * @param {Object} params - { currentLang, slug, translationSlug }
 * @returns {Array} Array of hreflang link objects
 */
export function generateHreflangTags({ currentLang = 'en', slug, translationSlug }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  const tags = []

  // Always include both languages if available
  if (currentLang === 'en') {
    tags.push({
      rel: 'alternate',
      hreflang: 'en-IN',
      href: `${baseUrl}/en/${slug}`
    })

    if (translationSlug) {
      tags.push({
        rel: 'alternate',
        hreflang: 'hi-IN',
        href: `${baseUrl}/hi/${translationSlug}`
      })
    }

    // x-default always points to English
    tags.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}/en/${slug}`
    })
  } else if (currentLang === 'hi') {
    tags.push({
      rel: 'alternate',
      hreflang: 'hi-IN',
      href: `${baseUrl}/hi/${slug}`
    })

    if (translationSlug) {
      tags.push({
        rel: 'alternate',
        hreflang: 'en-IN',
        href: `${baseUrl}/en/${translationSlug}`
      })
    }

    // x-default always points to English
    tags.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}/en/${translationSlug || slug}`
    })
  }

  return tags
}

/**
 * Generate Article Schema (schema.org)
 * @param {Object} post - Post object
 * @returns {Object} Article schema JSON-LD
 */
export function generateArticleSchema(post) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'
  const language = post.lang || 'en'
  const langPrefix = language === 'hi' ? '/hi' : '/en'

  // ✅ FIX: Always provide author URL with multiple fallbacks
  const authorUrl = post.author?.username
    ? `${baseUrl}/author/${post.author.username}`
    : post.author?._id
      ? `${baseUrl}/profile/${post.author._id.toString ? post.author._id.toString() : post.author._id}`
      : post.author?.name
        ? `${baseUrl}/author/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`
        : `${baseUrl}/authors`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.seoDescription,
    image: {
      '@type': 'ImageObject',
      url: post.featuredImageUrl || `${baseUrl}/Multigyan_Logo_bg.png`,
      alt: post.featuredImageAlt || post.title
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Multigyan',
      url: authorUrl,  // ✅ Always include URL
      image: post.author?.profilePictureUrl || `${baseUrl}/Multigyan_Logo_bg.png`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Multigyan',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/Multigyan_Logo_bg.png`,
        width: 512,
        height: 512
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`
    },
    inLanguage: language === 'hi' ? 'hi-IN' : 'en-IN',
    articleSection: post.category?.name,
    keywords: post.seoKeywords?.join(', ') || post.tags?.join(', '),
    wordCount: post.content ? post.content.split(/\s+/).length : 0,
    timeRequired: `PT${post.readingTime || 1}M` // ISO 8601 duration format
  }
}

/**
 * Generate BreadcrumbList Schema
 * @param {Array} breadcrumbs - Array of {name, url}
 * @returns {Object} BreadcrumbList schema JSON-LD
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

/**
 * Generate Person Schema (Author)
 * @param {Object} author - Author/User object
 * @returns {Object} Person schema JSON-LD
 */
export function generateAuthorSchema(author) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${baseUrl}/author/${author.username}`,
    image: author.profilePictureUrl || `${baseUrl}/Multigyan_Logo_bg.png`,
    description: author.bio || `Author at Multigyan`,
    sameAs: [
      author.socialLinks?.twitter,
      author.socialLinks?.linkedin,
      author.socialLinks?.github,
      author.socialLinks?.website
    ].filter(Boolean),
    jobTitle: 'Content Writer',
    worksFor: {
      '@type': 'Organization',
      name: 'Multigyan'
    }
  }
}

/**
 * Generate Organization Schema
 * @returns {Object} Organization schema JSON-LD
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Multigyan',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/Multigyan_Logo_bg.png`,
      width: 512,
      height: 512
    },
    description: 'A multi-author blogging platform for knowledge sharing across technology, business, lifestyle, and more.',
    foundingDate: '2025',
    sameAs: [
      'https://twitter.com/multigyan',
      'https://facebook.com/multigyan',
      'https://linkedin.com/company/multigyan'
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@multigyan.in'
    }
  }
}

/**
 * Generate WebSite Schema with SearchAction
 * @returns {Object} WebSite schema JSON-LD
 */
export function generateWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Multigyan',
    url: baseUrl,
    description: 'Multi-author blogging platform for knowledge sharing',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: ['en-IN', 'hi-IN']
  }
}

/**
 * Generate Blog Schema
 * @param {Array} posts - Array of recent posts
 * @returns {Object} Blog schema JSON-LD
 */
export function generateBlogSchema(posts = []) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Multigyan Blog',
    description: 'Articles and insights from expert writers',
    url: `${baseUrl}/blog`,
    inLanguage: ['en-IN', 'hi-IN'],
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt || post.createdAt,
      author: {
        '@type': 'Person',
        name: post.author?.name
      }
    }))
  }
}

/**
 * Generate SEO metadata for Next.js
 * @param {Object} params - SEO parameters
 * @returns {Object} Next.js metadata object
 */
export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  ogType = 'website',
  article = null,
  author = null,
  language = 'en',
  translationUrl = null
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'
  const fullCanonicalUrl = canonicalUrl?.startsWith('http')
    ? canonicalUrl
    : `${baseUrl}${canonicalUrl}`

  const metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: fullCanonicalUrl
    },
    openGraph: {
      title,
      description,
      url: fullCanonicalUrl,
      siteName: 'Multigyan',
      locale: language === 'hi' ? 'hi_IN' : 'en_IN',
      type: ogType,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      creator: author?.twitter || '@multigyan'
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }

  // Add article-specific metadata
  if (article) {
    metadata.openGraph.publishedTime = article.publishedAt
    metadata.openGraph.modifiedTime = article.updatedAt
    metadata.openGraph.authors = author ? [author.name] : undefined
    metadata.openGraph.section = article.category
    metadata.openGraph.tags = article.tags
  }

  // Add language alternates if translation exists
  if (translationUrl) {
    metadata.alternates = {
      ...metadata.alternates,
      languages: {
        'en-IN': language === 'en' ? fullCanonicalUrl : translationUrl,
        'hi-IN': language === 'hi' ? fullCanonicalUrl : translationUrl,
        'x-default': language === 'en' ? fullCanonicalUrl : translationUrl
      }
    }
  }

  return metadata
}

/**
 * Format date for schema markup
 * @param {Date|string} date
 * @returns {string} ISO 8601 date string
 */
export function formatSchemaDate(date) {
  return new Date(date).toISOString()
}

/**
 * Get language name
 * @param {string} langCode - 'en' or 'hi'
 * @returns {string} Language name
 */
export function getLanguageName(langCode) {
  const languages = {
    'en': 'English',
    'hi': 'हिन्दी'
  }
  return languages[langCode] || 'English'
}

/**
 * Get opposite language code
 * @param {string} langCode - 'en' or 'hi'
 * @returns {string} Opposite language code
 */
export function getOppositeLanguage(langCode) {
  return langCode === 'en' ? 'hi' : 'en'
}

/**
 * Generate Recipe Schema (schema.org)
 * @param {Object} post - Recipe post object
 * @returns {Object} Recipe schema JSON-LD
 */
export function generateRecipeSchema(post) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  // Calculate total time
  const prepTime = post.recipePrepTime || 0
  const cookTime = post.recipeCookTime || 0
  const totalTime = prepTime + cookTime

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: post.title,
    description: post.excerpt || post.seoDescription,
    image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Multigyan',
      url: post.author?.username
        ? `${baseUrl}/author/${post.author.username}`
        : `${baseUrl}/authors`
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    prepTime: prepTime ? `PT${prepTime}M` : undefined, // ISO 8601 duration
    cookTime: cookTime ? `PT${cookTime}M` : undefined,
    totalTime: totalTime ? `PT${totalTime}M` : undefined,
    recipeYield: post.recipeServings ? `${post.recipeServings} servings` : undefined,
    recipeCategory: post.category?.name || 'Recipe',
    recipeCuisine: post.recipeCuisine || undefined,
    keywords: post.seoKeywords?.join(', ') || post.tags?.join(', '),
    recipeIngredient: post.recipeIngredients || [],
    recipeInstructions: post.content
      ? extractInstructionsFromContent(post.content)
      : undefined,
    nutrition: post.nutrition ? {
      '@type': 'NutritionInformation',
      calories: post.nutrition.calories ? `${post.nutrition.calories} calories` : undefined,
      proteinContent: post.nutrition.protein ? `${post.nutrition.protein}g` : undefined,
      fatContent: post.nutrition.fat ? `${post.nutrition.fat}g` : undefined,
      carbohydrateContent: post.nutrition.carbs ? `${post.nutrition.carbs}g` : undefined
    } : undefined,
    aggregateRating: post.averageRating && post.ratings?.length ? {
      '@type': 'AggregateRating',
      ratingValue: post.averageRating,
      ratingCount: post.ratings.length,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    suitableForDiet: post.recipeDiet?.map(diet => `https://schema.org/${diet}Diet`) || undefined,
    video: post.videoUrl ? {
      '@type': 'VideoObject',
      name: `${post.title} - Video`,
      description: post.excerpt,
      thumbnailUrl: post.featuredImageUrl,
      contentUrl: post.videoUrl,
      uploadDate: post.publishedAt || post.createdAt
    } : undefined
  }
}

/**
 * Generate HowTo Schema for DIY tutorials (schema.org)
 * @param {Object} post - DIY post object
 * @returns {Object} HowTo schema JSON-LD
 */
export function generateHowToSchema(post) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.excerpt || post.seoDescription,
    image: post.featuredImageUrl ? {
      '@type': 'ImageObject',
      url: post.featuredImageUrl,
      alt: post.featuredImageAlt || post.title
    } : undefined,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Multigyan',
      url: post.author?.username
        ? `${baseUrl}/author/${post.author.username}`
        : `${baseUrl}/authors`
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    totalTime: post.diyEstimatedTime ? `PT${post.diyEstimatedTime}M` : undefined,
    estimatedCost: post.estimatedCost ? {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: post.estimatedCost
    } : undefined,
    supply: post.diyMaterials?.map(material => ({
      '@type': 'HowToSupply',
      name: typeof material === 'string' ? material : material.name
    })) || [],
    tool: post.diyTools?.map(tool => ({
      '@type': 'HowToTool',
      name: typeof tool === 'string' ? tool : tool.name
    })) || [],
    step: post.content
      ? extractStepsFromContent(post.content)
      : [],
    skillLevel: post.diyDifficulty || undefined,
    video: post.videoUrl ? {
      '@type': 'VideoObject',
      name: `${post.title} - Tutorial`,
      description: post.excerpt,
      thumbnailUrl: post.featuredImageUrl,
      contentUrl: post.videoUrl,
      uploadDate: post.publishedAt || post.createdAt
    } : undefined
  }
}

/**
 * Extract recipe instructions from HTML content
 * @param {string} content - HTML content
 * @returns {Array} Array of HowToStep objects
 */
function extractInstructionsFromContent(content) {
  // Simple extraction - looks for ordered lists or numbered items
  // You can enhance this based on your content structure
  const steps = []

  // Try to extract from ordered lists
  const olMatch = content.match(/<ol[^>]*>(.*?)<\/ol>/gs)
  if (olMatch) {
    const liMatches = olMatch[0].match(/<li[^>]*>(.*?)<\/li>/gs)
    if (liMatches) {
      liMatches.forEach((li, index) => {
        const text = li.replace(/<[^>]*>/g, '').trim()
        if (text) {
          steps.push({
            '@type': 'HowToStep',
            position: index + 1,
            text: text
          })
        }
      })
    }
  }

  return steps.length > 0 ? steps : undefined
}

/**
 * Extract DIY steps from HTML content
 * @param {string} content - HTML content
 * @returns {Array} Array of HowToStep objects
 */
function extractStepsFromContent(content) {
  // Similar to recipe instructions but for DIY
  const steps = []

  // Try to extract from ordered lists or headings
  const olMatch = content.match(/<ol[^>]*>(.*?)<\/ol>/gs)
  if (olMatch) {
    const liMatches = olMatch[0].match(/<li[^>]*>(.*?)<\/li>/gs)
    if (liMatches) {
      liMatches.forEach((li, index) => {
        const text = li.replace(/<[^>]*>/g, '').trim()
        if (text) {
          steps.push({
            '@type': 'HowToStep',
            name: `Step ${index + 1}`,
            text: text,
            position: index + 1
          })
        }
      })
    }
  }

  return steps.length > 0 ? steps : undefined
}
