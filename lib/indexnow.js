/**
 * IndexNow Utility
 * Automatically notify search engines when content is published or updated
 * 
 * Supported Search Engines:
 * - Bing
 * - Yandex
 * - Seznam.cz
 * - Naver
 */

import crypto from 'crypto'

// Generate or use existing IndexNow API key
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || crypto.randomBytes(32).toString('hex')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'

/**
 * Submit URL to IndexNow
 * @param {string|string[]} urls - Single URL or array of URLs to submit
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
 */
export async function submitToIndexNow(urls) {
    try {
        // Ensure urls is an array
        const urlList = Array.isArray(urls) ? urls : [urls]

        // Validate URLs
        const validUrls = urlList.filter(url => {
            try {
                new URL(url)
                return true
            } catch {
                return false
            }
        })

        if (validUrls.length === 0) {
            return {
                success: false,
                message: 'No valid URLs provided'
            }
        }

        // IndexNow endpoint (Bing is the primary endpoint, shares with others)
        const indexNowEndpoint = 'https://api.indexnow.org/indexnow'

        // Prepare the request body
        const requestBody = {
            host: new URL(SITE_URL).hostname,
            key: INDEXNOW_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
            urlList: validUrls
        }

        // Submit to IndexNow
        const response = await fetch(indexNowEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(requestBody)
        })

        // Check response
        if (response.ok) {
            console.log('✅ IndexNow: Successfully submitted URLs:', validUrls)
            return {
                success: true,
                message: `Successfully submitted ${validUrls.length} URL(s) to IndexNow`,
                details: {
                    urls: validUrls,
                    statusCode: response.status
                }
            }
        } else {
            const errorText = await response.text()
            console.error('❌ IndexNow: Submission failed:', response.status, errorText)
            return {
                success: false,
                message: `IndexNow submission failed with status ${response.status}`,
                details: {
                    statusCode: response.status,
                    error: errorText
                }
            }
        }
    } catch (error) {
        console.error('❌ IndexNow: Error submitting URLs:', error)
        return {
            success: false,
            message: 'Error submitting to IndexNow',
            details: {
                error: error.message
            }
        }
    }
}

/**
 * Submit a blog post to IndexNow
 * @param {string} slug - Post slug
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitPostToIndexNow(slug) {
    const postUrl = `${SITE_URL}/blog/${slug}`
    return submitToIndexNow(postUrl)
}

/**
 * Submit multiple blog posts to IndexNow
 * @param {string[]} slugs - Array of post slugs
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitPostsToIndexNow(slugs) {
    const postUrls = slugs.map(slug => `${SITE_URL}/blog/${slug}`)
    return submitToIndexNow(postUrls)
}

/**
 * Get the IndexNow API key
 * @returns {string}
 */
export function getIndexNowKey() {
    return INDEXNOW_KEY
}

/**
 * Get the IndexNow key location URL
 * @returns {string}
 */
export function getIndexNowKeyLocation() {
    return `${SITE_URL}/${INDEXNOW_KEY}.txt`
}

// Export the key for use in the route handler
export { INDEXNOW_KEY }
