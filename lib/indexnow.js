/**
 * IndexNow API Integration for Bing
 * 
 * This utility submits URLs to IndexNow API to notify search engines
 * (Bing, Yahoo, Yandex, Naver, Seznam) about new/updated content.
 * 
 * @see https://www.indexnow.org/documentation
 */

const INDEXNOW_API_KEY = '66ec4f211ec9478489247dad39fbc8de'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

/**
 * Submit a single URL to IndexNow
 * @param {string} url - The full URL to submit
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitUrlToIndexNow(url) {
    try {
        const response = await fetch(INDEXNOW_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                host: new URL(SITE_URL).hostname,
                key: INDEXNOW_API_KEY,
                keyLocation: `${SITE_URL}/${INDEXNOW_API_KEY}.txt`,
                urlList: [url]
            })
        })

        // IndexNow returns 200 for success, 202 for accepted
        if (response.ok) {
            console.log(`✅ IndexNow: Successfully submitted ${url}`)
            return {
                success: true,
                message: `URL submitted successfully (Status: ${response.status})`
            }
        } else {
            const errorText = await response.text()
            console.error(`❌ IndexNow: Failed to submit ${url}`, errorText)
            return {
                success: false,
                message: `Failed with status ${response.status}: ${errorText}`
            }
        }
    } catch (error) {
        console.error('❌ IndexNow: Error submitting URL', error)
        return {
            success: false,
            message: `Error: ${error.message}`
        }
    }
}

/**
 * Submit multiple URLs to IndexNow (batch submission)
 * @param {string[]} urls - Array of full URLs to submit
 * @returns {Promise<{success: boolean, message: string, submitted: number}>}
 */
export async function submitUrlsToIndexNow(urls) {
    // IndexNow supports up to 10,000 URLs per request
    // We'll batch in chunks of 100 for reliability
    const BATCH_SIZE = 100

    if (!urls || urls.length === 0) {
        return {
            success: false,
            message: 'No URLs provided',
            submitted: 0
        }
    }

    try {
        let totalSubmitted = 0

        // Process in batches
        for (let i = 0; i < urls.length; i += BATCH_SIZE) {
            const batch = urls.slice(i, i + BATCH_SIZE)

            const response = await fetch(INDEXNOW_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({
                    host: new URL(SITE_URL).hostname,
                    key: INDEXNOW_API_KEY,
                    keyLocation: `${SITE_URL}/${INDEXNOW_API_KEY}.txt`,
                    urlList: batch
                })
            })

            if (response.ok) {
                totalSubmitted += batch.length
                console.log(`✅ IndexNow: Submitted batch ${i / BATCH_SIZE + 1} (${batch.length} URLs)`)
            } else {
                const errorText = await response.text()
                console.error(`❌ IndexNow: Batch ${i / BATCH_SIZE + 1} failed`, errorText)
            }

            // Add a small delay between batches to avoid rate limiting
            if (i + BATCH_SIZE < urls.length) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        return {
            success: totalSubmitted > 0,
            message: `Successfully submitted ${totalSubmitted} of ${urls.length} URLs`,
            submitted: totalSubmitted
        }
    } catch (error) {
        console.error('❌ IndexNow: Error submitting URLs', error)
        return {
            success: false,
            message: `Error: ${error.message}`,
            submitted: 0
        }
    }
}

/**
 * Submit a blog post to IndexNow
 * @param {string} slug - The post slug
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitPostToIndexNow(slug) {
    const url = `${SITE_URL}/blog/${slug}`
    return submitUrlToIndexNow(url)
}

/**
 * Submit a category page to IndexNow
 * @param {string} slug - The category slug
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitCategoryToIndexNow(slug) {
    const url = `${SITE_URL}/category/${slug}`
    return submitUrlToIndexNow(url)
}

/**
 * Submit static pages to IndexNow
 * @returns {Promise<{success: boolean, message: string, submitted: number}>}
 */
export async function submitStaticPagesToIndexNow() {
    const staticPages = [
        `${SITE_URL}`,
        `${SITE_URL}/blog`,
        `${SITE_URL}/store`,
        `${SITE_URL}/categories`,
        `${SITE_URL}/about`,
        `${SITE_URL}/contact`,
        `${SITE_URL}/authors`,
        `${SITE_URL}/help`,
    ]

    return submitUrlsToIndexNow(staticPages)
}

/**
 * Submit all published posts to IndexNow (for initial bulk submission)
 * This should be called once to submit all existing content
 * @param {Array} posts - Array of post objects with slug property
 * @returns {Promise<{success: boolean, message: string, submitted: number}>}
 */
export async function submitAllPostsToIndexNow(posts) {
    const urls = posts.map(post => `${SITE_URL}/blog/${post.slug}`)
    return submitUrlsToIndexNow(urls)
}
