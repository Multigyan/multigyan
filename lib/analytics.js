// Analytics tracking utilities

export const trackEvent = (eventName, properties = {}) => {
    if (typeof window === 'undefined') return

    try {
        // Google Analytics 4
        if (window.gtag) {
            window.gtag('event', eventName, properties)
        }

        // Console log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Analytics Event:', eventName, properties)
        }
    } catch (error) {
        console.error('Analytics error:', error)
    }
}

// Specific tracking functions
export const analytics = {
    // Page views
    pageView: (url) => {
        trackEvent('page_view', {
            page_path: url,
            page_title: document.title,
        })
    },

    // Featured post click
    featuredPostClick: (postId, postTitle) => {
        trackEvent('featured_post_click', {
            post_id: postId,
            post_title: postTitle,
            location: 'homepage',
        })
    },

    // Article card click
    articleClick: (postId, postTitle, location = 'grid') => {
        trackEvent('article_click', {
            post_id: postId,
            post_title: postTitle,
            location,
        })
    },

    // Category click
    categoryClick: (categoryId, categoryName, location = 'homepage') => {
        trackEvent('category_click', {
            category_id: categoryId,
            category_name: categoryName,
            location,
        })
    },

    // Newsletter signup
    newsletterSignup: (email, preferences = []) => {
        trackEvent('newsletter_signup', {
            email_domain: email.split('@')[1],
            preferences: preferences.join(','),
        })
    },

    // Search
    search: (query, resultsCount) => {
        trackEvent('search', {
            search_term: query,
            results_count: resultsCount,
        })
    },

    // Share
    share: (platform, url, title) => {
        trackEvent('share', {
            platform,
            url,
            title,
        })
    },

    // CTA click
    ctaClick: (ctaName, ctaLocation) => {
        trackEvent('cta_click', {
            cta_name: ctaName,
            cta_location: ctaLocation,
        })
    },

    // Sort/Filter
    sortChange: (sortType, location = 'blog') => {
        trackEvent('sort_change', {
            sort_type: sortType,
            location,
        })
    },

    // Pagination
    paginationClick: (page, location = 'blog') => {
        trackEvent('pagination_click', {
            page,
            location,
        })
    },
}

export default analytics
