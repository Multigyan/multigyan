/**
 * Social Media Service
 * 
 * Handles posting to multiple social media platforms
 * Twitter/X, Facebook, LinkedIn, Instagram
 */

class SocialMediaService {
    constructor() {
        this.credentials = {
            twitter: {
                apiKey: process.env.TWITTER_API_KEY,
                apiSecret: process.env.TWITTER_API_SECRET,
                accessToken: process.env.TWITTER_ACCESS_TOKEN,
                accessSecret: process.env.TWITTER_ACCESS_SECRET
            },
            facebook: {
                appId: process.env.FACEBOOK_APP_ID,
                appSecret: process.env.FACEBOOK_APP_SECRET,
                pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
                pageId: process.env.FACEBOOK_PAGE_ID
            },
            linkedin: {
                clientId: process.env.LINKEDIN_CLIENT_ID,
                clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
                accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
                organizationId: process.env.LINKEDIN_ORGANIZATION_ID
            },
            instagram: {
                // Instagram uses Facebook Graph API
                accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
                accountId: process.env.INSTAGRAM_ACCOUNT_ID
            }
        }
    }

    /**
     * Post to Twitter/X
     */
    async postToTwitter(post) {
        try {
            const { title, excerpt, slug, socialMedia } = post
            const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`

            // Construct tweet (280 char limit)
            const hashtags = socialMedia?.hashtags?.slice(0, 3).join(' ') || ''
            const tweetText = `${title}\n\n${excerpt.substring(0, 150)}...\n\n${hashtags}\n\n${url}`

            // Twitter API v2 request
            const response = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credentials.twitter.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: tweetText.substring(0, 280)
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(`Twitter API error: ${error.detail || error.title}`)
            }

            const data = await response.json()

            return {
                success: true,
                postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
                postId: data.data.id,
                platform: 'twitter'
            }
        } catch (error) {
            console.error('Twitter post error:', error)
            return {
                success: false,
                error: error.message,
                platform: 'twitter'
            }
        }
    }

    /**
     * Post to Facebook Page
     */
    async postToFacebook(post) {
        try {
            const { title, excerpt, slug, featuredImageUrl, socialMedia } = post
            const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`

            const message = `${title}\n\n${excerpt}\n\n${socialMedia?.hashtags?.join(' ') || ''}`

            // Facebook Graph API
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${this.credentials.facebook.pageId}/feed`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message,
                        link: url,
                        access_token: this.credentials.facebook.pageAccessToken
                    })
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(`Facebook API error: ${error.error?.message}`)
            }

            const data = await response.json()

            return {
                success: true,
                postUrl: `https://facebook.com/${data.id}`,
                postId: data.id,
                platform: 'facebook'
            }
        } catch (error) {
            console.error('Facebook post error:', error)
            return {
                success: false,
                error: error.message,
                platform: 'facebook'
            }
        }
    }

    /**
     * Post to LinkedIn
     */
    async postToLinkedIn(post) {
        try {
            const { title, excerpt, slug, featuredImageUrl, socialMedia } = post
            const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`

            const text = `${title}\n\n${excerpt}\n\n${socialMedia?.hashtags?.join(' ') || ''}`

            // LinkedIn API v2
            const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credentials.linkedin.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                body: JSON.stringify({
                    author: `urn:li:organization:${this.credentials.linkedin.organizationId}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: {
                                text
                            },
                            shareMediaCategory: 'ARTICLE',
                            media: [{
                                status: 'READY',
                                originalUrl: url,
                                title: {
                                    text: title
                                },
                                description: {
                                    text: excerpt
                                }
                            }]
                        }
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(`LinkedIn API error: ${error.message}`)
            }

            const data = await response.json()

            return {
                success: true,
                postUrl: `https://www.linkedin.com/feed/update/${data.id}`,
                postId: data.id,
                platform: 'linkedin'
            }
        } catch (error) {
            console.error('LinkedIn post error:', error)
            return {
                success: false,
                error: error.message,
                platform: 'linkedin'
            }
        }
    }

    /**
     * Post to Instagram (via Facebook Graph API)
     */
    async postToInstagram(post) {
        try {
            const { title, excerpt, slug, featuredImageUrl, socialMedia } = post
            const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`

            if (!featuredImageUrl) {
                throw new Error('Instagram requires a featured image')
            }

            const caption = `${title}\n\n${excerpt.substring(0, 200)}...\n\n${socialMedia?.hashtags?.slice(0, 30).join(' ') || ''}\n\nRead more: ${url}`

            // Step 1: Create media container
            const containerResponse = await fetch(
                `https://graph.facebook.com/v18.0/${this.credentials.instagram.accountId}/media`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image_url: featuredImageUrl,
                        caption: caption.substring(0, 2200), // Instagram limit
                        access_token: this.credentials.instagram.accessToken
                    })
                }
            )

            if (!containerResponse.ok) {
                const error = await containerResponse.json()
                throw new Error(`Instagram container error: ${error.error?.message}`)
            }

            const containerData = await containerResponse.json()

            // Step 2: Publish media
            const publishResponse = await fetch(
                `https://graph.facebook.com/v18.0/${this.credentials.instagram.accountId}/media_publish`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        creation_id: containerData.id,
                        access_token: this.credentials.instagram.accessToken
                    })
                }
            )

            if (!publishResponse.ok) {
                const error = await publishResponse.json()
                throw new Error(`Instagram publish error: ${error.error?.message}`)
            }

            const publishData = await publishResponse.json()

            return {
                success: true,
                postUrl: `https://www.instagram.com/p/${publishData.id}`,
                postId: publishData.id,
                platform: 'instagram'
            }
        } catch (error) {
            console.error('Instagram post error:', error)
            return {
                success: false,
                error: error.message,
                platform: 'instagram'
            }
        }
    }

    /**
     * Post to all enabled platforms
     */
    async postToAll(post) {
        const results = []
        const enabledPlatforms = post.socialMedia?.autoPost?.platforms || []

        for (const platformConfig of enabledPlatforms) {
            const { name } = platformConfig

            let result
            switch (name) {
                case 'twitter':
                    result = await this.postToTwitter(post)
                    break
                case 'facebook':
                    result = await this.postToFacebook(post)
                    break
                case 'linkedin':
                    result = await this.postToLinkedIn(post)
                    break
                case 'instagram':
                    result = await this.postToInstagram(post)
                    break
                default:
                    continue
            }

            results.push(result)
        }

        return results
    }
}

export default new SocialMediaService()
