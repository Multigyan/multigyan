/**
 * Blog Configuration Constants
 * Centralized configuration for blog-related settings
 */

export const BLOG_CONFIG = {
    // Pagination
    POSTS_PER_PAGE: 12,
    FEATURED_POSTS_COUNT: 3,

    // Sidebar
    SIDEBAR_CATEGORIES_COUNT: 8,

    // Revalidation (in seconds)
    POSTS_REVALIDATE: 300, // 5 minutes
    CATEGORIES_REVALIDATE: 300, // 5 minutes
    FEATURED_REVALIDATE: 300, // 5 minutes

    // Search
    SEARCH_DEBOUNCE_MS: 300,
    MIN_SEARCH_LENGTH: 2,

    // Images
    FEATURED_IMAGE_PRIORITY: true,

    // Excerpt
    EXCERPT_MAX_LENGTH: 160,
    EXCERPT_WORD_BOUNDARY: true,
}

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    POSTS: '/api/posts',
    CATEGORIES: '/api/categories',
    NEWSLETTER: '/api/newsletter/subscribe',
}

/**
 * Route Paths
 */
export const ROUTES = {
    HOME: '/',
    BLOG: '/blog',
    CATEGORIES: '/categories',
    AUTHORS: '/authors',
    CONTACT: '/contact',
    NEWSLETTER: '/newsletter',
}

/**
 * SEO Constants
 */
export const SEO = {
    SITE_NAME: 'Multigyan',
    SITE_URL: 'https://www.multigyan.in',
    SITE_DESCRIPTION: 'A secure, high-performance, and SEO-optimized multi-author blogging platform.',
    DEFAULT_OG_IMAGE: '/Multigyan_Logo_bg.png',
    TWITTER_HANDLE: '@Multigyan_in',
}

/**
 * Social Media Links
 */
export const SOCIAL_LINKS = {
    TWITTER: 'https://twitter.com/Multigyan_in',
    TELEGRAM: 'https://t.me/multigyanexpert',
    LINKEDIN: 'https://www.linkedin.com/company/multigyan/',
    INSTAGRAM: 'https://instagram.com/multigyan.info',
    YOUTUBE: 'https://youtube.com/@multigyan_in',
    WHATSAPP: 'https://whatsapp.com/channel/0029VbBBdkrDOQIQFDv6Rc1v',
}

/**
 * Contact Information
 */
export const CONTACT = {
    EMAIL: 'contact@multigyan.in',
    SUPPORT_EMAIL: 'support@multigyan.in',
}
