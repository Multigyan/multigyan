/**
 * Bing-Specific SEO Utilities
 * Enhanced structured data for better Bing search visibility
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

/**
 * Generate WebSite Schema with Sitelinks Search Box
 * This enables the search box to appear in Bing search results
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Multigyan',
        description: 'Discover insightful articles, DIY tutorials, and recipes. Join our community of knowledge sharers.',
        publisher: {
            '@id': `${SITE_URL}/#organization`
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/blog?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        },
        inLanguage: ['en-IN', 'hi-IN']
    }
}

/**
 * Generate Organization Schema
 * Provides comprehensive business information to search engines
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Multigyan',
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/Multigyan_Logo_bg.png`,
            width: 512,
            height: 512
        },
        description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform.',
        sameAs: [
            'https://twitter.com/multigyan',
            'https://www.facebook.com/multigyan',
            'https://www.linkedin.com/company/multigyan'
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            url: `${SITE_URL}/contact`,
            availableLanguage: ['English', 'Hindi']
        }
    }
}

/**
 * Generate Enhanced Article Schema for Blog Posts
 * Optimized for Bing's article understanding
 */
export function generateEnhancedArticleSchema(post) {
    const siteUrl = SITE_URL
    const postUrl = `${siteUrl}/blog/${post.slug}`

    // Extract plain text from HTML content for articleBody
    const stripHtml = (html) => {
        if (!html) return ''
        return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000) // Bing recommends max 5000 chars
    }

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': postUrl,
        headline: post.title,
        description: post.excerpt || post.seoDescription,
        image: post.featuredImageUrl ? {
            '@type': 'ImageObject',
            url: post.featuredImageUrl,
            width: 1200,
            height: 630,
            caption: post.featuredImageAlt || post.title
        } : undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: {
            '@type': 'Person',
            name: post.author?.name || 'Multigyan Team',
            url: post.author?.username ? `${siteUrl}/author/${post.author.username}` : siteUrl,
            image: post.author?.profilePictureUrl
        },
        publisher: {
            '@type': 'Organization',
            name: 'Multigyan',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/Multigyan_Logo_bg.png`,
                width: 512,
                height: 512
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl
        },
        articleBody: stripHtml(post.content),
        wordCount: post.content ? stripHtml(post.content).split(/\s+/).length : 0,
        articleSection: post.category?.name,
        keywords: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
        inLanguage: post.lang || 'en-IN',
        isAccessibleForFree: true,
        commentCount: post.comments?.length || 0,
        interactionStatistic: [
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/ReadAction',
                userInteractionCount: post.views || 0
            },
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: post.likeCount || post.likes?.length || 0
            },
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/CommentAction',
                userInteractionCount: post.commentCount || post.comments?.length || 0
            }
        ]
    }

    // Remove undefined fields
    return JSON.parse(JSON.stringify(schema))
}

/**
 * Generate FAQPage Schema
 * For pages with FAQ sections
 */
export function generateFAQSchema(faqs) {
    if (!faqs || faqs.length === 0) return null

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    }
}

/**
 * Generate HowTo Schema
 * For tutorial and DIY content
 */
export function generateHowToSchema(post) {
    if (!post.steps || post.steps.length === 0) return null

    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: post.title,
        description: post.excerpt,
        image: post.featuredImageUrl ? {
            '@type': 'ImageObject',
            url: post.featuredImageUrl
        } : undefined,
        totalTime: post.totalTime || undefined,
        estimatedCost: post.estimatedCost ? {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: post.estimatedCost
        } : undefined,
        tool: post.tools?.map(tool => ({
            '@type': 'HowToTool',
            name: tool
        })) || undefined,
        supply: post.supplies?.map(supply => ({
            '@type': 'HowToSupply',
            name: supply
        })) || undefined,
        step: post.steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name || `Step ${index + 1}`,
            text: step.text,
            image: step.image || undefined,
            url: step.url || undefined
        }))
    }
}

/**
 * Generate Recipe Schema
 * For recipe content
 */
export function generateRecipeSchema(recipe) {
    if (!recipe) return null

    return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: recipe.excerpt,
        image: recipe.featuredImageUrl ? {
            '@type': 'ImageObject',
            url: recipe.featuredImageUrl
        } : undefined,
        author: {
            '@type': 'Person',
            name: recipe.author?.name || 'Multigyan Team'
        },
        datePublished: recipe.publishedAt,
        prepTime: recipe.prepTime || undefined,
        cookTime: recipe.cookTime || undefined,
        totalTime: recipe.totalTime || undefined,
        recipeYield: recipe.servings || undefined,
        recipeCategory: recipe.category?.name,
        recipeCuisine: recipe.cuisine || undefined,
        keywords: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : recipe.tags,
        nutrition: recipe.nutrition ? {
            '@type': 'NutritionInformation',
            calories: recipe.nutrition.calories || undefined,
            proteinContent: recipe.nutrition.protein || undefined,
            fatContent: recipe.nutrition.fat || undefined,
            carbohydrateContent: recipe.nutrition.carbs || undefined
        } : undefined,
        recipeIngredient: recipe.ingredients || [],
        recipeInstructions: recipe.instructions?.map((instruction, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            text: instruction
        })) || [],
        aggregateRating: recipe.rating ? {
            '@type': 'AggregateRating',
            ratingValue: recipe.rating.average || 0,
            reviewCount: recipe.rating.count || 0
        } : undefined
    }
}

/**
 * Generate Product Schema
 * For store products
 */
export function generateProductSchema(product) {
    if (!product) return null

    const siteUrl = SITE_URL
    const productUrl = `${siteUrl}/store/${product.slug}`

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': productUrl,
        name: product.name,
        description: product.description,
        image: product.images?.map(img => img.url) || [],
        brand: product.brand ? {
            '@type': 'Brand',
            name: product.brand.name
        } : undefined,
        sku: product.sku || undefined,
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: product.priceValidUntil || undefined,
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Multigyan'
            }
        },
        aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.average || 0,
            reviewCount: product.rating.count || 0
        } : undefined
    }
}

/**
 * Generate CollectionPage Schema
 * For category and listing pages
 */
export function generateCollectionPageSchema(category, posts) {
    const siteUrl = SITE_URL
    const categoryUrl = `${siteUrl}/category/${category.slug}`

    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': categoryUrl,
        url: categoryUrl,
        name: `${category.name} Articles`,
        description: category.description || `Browse all articles in ${category.name} category`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: siteUrl
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Categories',
                    item: `${siteUrl}/categories`
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: category.name,
                    item: categoryUrl
                }
            ]
        },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: posts?.length || 0,
            itemListElement: posts?.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${siteUrl}/blog/${post.slug}`
            })) || []
        }
    }
}

/**
 * Generate VideoObject Schema
 * For blog posts with embedded videos
 */
export function generateVideoSchema(post, videoData) {
    if (!videoData || !videoData.url) return null

    const siteUrl = SITE_URL
    const postUrl = `${siteUrl}/blog/${post.slug}`

    return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: videoData.title || post.title,
        description: videoData.description || post.excerpt,
        thumbnailUrl: videoData.thumbnail || post.featuredImageUrl,
        uploadDate: post.publishedAt,
        duration: videoData.duration || undefined,
        contentUrl: videoData.url,
        embedUrl: videoData.embedUrl || videoData.url,
        publisher: {
            '@type': 'Organization',
            name: 'Multigyan',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/Multigyan_Logo_bg.png`
            }
        }
    }
}

/**
 * Generate WebPage Schema
 * Enhanced page-level schema for better understanding
 */
export function generateWebPageSchema(post) {
    const siteUrl = SITE_URL
    const postUrl = `${siteUrl}/blog/${post.slug}`

    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': postUrl,
        url: postUrl,
        name: post.title,
        description: post.excerpt || post.seoDescription,
        inLanguage: post.lang || 'en-IN',
        isPartOf: {
            '@id': `${siteUrl}/#website`
        },
        primaryImageOfPage: post.featuredImageUrl ? {
            '@type': 'ImageObject',
            url: post.featuredImageUrl,
            width: 1200,
            height: 630
        } : undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        breadcrumb: {
            '@id': `${postUrl}#breadcrumb`
        },
        potentialAction: {
            '@type': 'ReadAction',
            target: [postUrl]
        }
    }
}

/**
 * Extract FAQ items from blog content
 * Looks for common FAQ patterns in HTML content
 */
export function extractFAQFromContent(content) {
    if (!content) return []

    const faqs = []

    // Pattern 1: <h3>Question</h3><p>Answer</p>
    const h3Pattern = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi
    let match

    while ((match = h3Pattern.exec(content)) !== null) {
        const question = match[1].replace(/<[^>]*>/g, '').trim()
        const answer = match[2].replace(/<[^>]*>/g, '').trim()

        // Only add if question contains question marks or starts with typical question words
        if (question.includes('?') || /^(how|what|why|when|where|who|which|can|does|is|are)/i.test(question)) {
            faqs.push({ question, answer })
        }
    }

    return faqs.slice(0, 10) // Limit to 10 FAQs max
}

/**
 * Extract HowTo steps from blog content  
 * Looks for numbered lists or step patterns
 */
export function extractHowToFromContent(content, post) {
    if (!content) return null

    // Look for ordered lists
    const olPattern = /<ol[^>]*>(.*?)<\/ol>/is
    const match = olPattern.exec(content)

    if (!match) return null

    const listContent = match[1]
    const liPattern = /<li[^>]*>(.*?)<\/li>/gi
    const steps = []
    let liMatch

    while ((liMatch = liPattern.exec(listContent)) !== null) {
        const stepText = liMatch[1].replace(/<[^>]*>/g, '').trim()
        if (stepText) {
            steps.push({
                text: stepText,
                name: stepText.length > 50 ? stepText.substring(0, 50) + '...' : stepText
            })
        }
    }

    if (steps.length < 2) return null // Need at least 2 steps

    return {
        title: post.title,
        excerpt: post.excerpt,
        featuredImageUrl: post.featuredImageUrl,
        steps
    }
}
