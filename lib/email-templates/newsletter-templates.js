/**
 * Newsletter Email Templates for Multigyan
 * Beautiful, responsive email templates with blog post integration
 */

/**
 * Generate header for all emails
 */
export function generateEmailHeader() {
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <img src="${process.env.NEXT_PUBLIC_SITE_URL}/Multigyan_Logo.png" alt="Multigyan" style="height: 50px; margin-bottom: 10px;" />
      <h1 style="color: white; margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">Multigyan Newsletter</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Explore the World of Knowledge</p>
    </div>
  `
}

/**
 * Generate footer for all emails
 */
export function generateEmailFooter(unsubscribeUrl) {
  return `
    <div style="background: #f9f9f9; padding: 30px 20px; text-align: center; margin-top: 40px;">
      <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
        © ${new Date().getFullYear()} Multigyan. All rights reserved.
      </p>
      <p style="color: #999; font-size: 12px; margin: 0 0 15px 0;">
        You're receiving this email because you subscribed to our newsletter.
      </p>
      <div style="margin: 20px 0;">
        <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Unsubscribe</a>
        <span style="color: #ddd;">|</span>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Visit Website</a>
        <span style="color: #ddd;">|</span>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy-policy" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
      </div>
      <div style="margin-top: 20px;">
        <a href="https://twitter.com/Multigyan_in" style="display: inline-block; margin: 0 5px;">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/icons/twitter.png" alt="Twitter" style="width: 24px; height: 24px;" />
        </a>
        <a href="https://instagram.com/multigyan.info" style="display: inline-block; margin: 0 5px;">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/icons/instagram.png" alt="Instagram" style="width: 24px; height: 24px;" />
        </a>
        <a href="https://youtube.com/@multigyan_in" style="display: inline-block; margin: 0 5px;">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/icons/youtube.png" alt="YouTube" style="width: 24px; height: 24px;" />
        </a>
      </div>
    </div>
  `
}

/**
 * Generate single blog post card
 */
export function generateBlogPostCard(post, layout = 'featured') {
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
  const imageUrl = post.featuredImage || '/fallback.webp'
  const excerpt = post.excerpt || post.content?.substring(0, 150) + '...' || ''
  const categoryColor = post.category?.color || '#667eea'

  if (layout === 'featured') {
    // Large featured post with image
    return `
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 30px;">
        <a href="${postUrl}" style="text-decoration: none;">
          <img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: 300px; object-fit: cover; display: block;" />
        </a>
        <div style="padding: 30px;">
          <div style="margin-bottom: 15px;">
            <span style="background: ${categoryColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${post.category?.name || 'Blog'}
            </span>
          </div>
          <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: bold; line-height: 1.4;">
            <a href="${postUrl}" style="color: #1a1a1a; text-decoration: none;">
              ${post.title}
            </a>
          </h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            ${excerpt}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #eee; padding-top: 15px;">
            <div style="display: flex; align-items: center;">
              ${post.author?.profileImage ? `
                <img src="${post.author.profileImage}" alt="${post.author.name}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;" />
              ` : ''}
              <span style="color: #666; font-size: 14px;">
                ${post.author?.name || 'Multigyan'}
              </span>
            </div>
            <a href="${postUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Read More →
            </a>
          </div>
        </div>
      </div>
    `
  } else if (layout === 'compact') {
    // Compact horizontal layout
    return `
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex;">
        <a href="${postUrl}" style="flex-shrink: 0; width: 200px; height: 150px; overflow: hidden;">
          <img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </a>
        <div style="padding: 20px; flex: 1;">
          <span style="background: ${categoryColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
            ${post.category?.name || 'Blog'}
          </span>
          <h3 style="margin: 10px 0; font-size: 18px; font-weight: bold; line-height: 1.4;">
            <a href="${postUrl}" style="color: #1a1a1a; text-decoration: none;">
              ${post.title}
            </a>
          </h3>
          <p style="color: #666; font-size: 14px; margin: 10px 0;">
            ${excerpt.substring(0, 100)}...
          </p>
          <a href="${postUrl}" style="color: #667eea; font-size: 14px; font-weight: 600; text-decoration: none;">
            Read More →
          </a>
        </div>
      </div>
    `
  } else if (layout === 'grid') {
    // Grid card layout (for 2-column)
    return `
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <a href="${postUrl}" style="display: block; height: 180px; overflow: hidden;">
          <img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </a>
        <div style="padding: 20px;">
          <span style="background: ${categoryColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
            ${post.category?.name || 'Blog'}
          </span>
          <h3 style="margin: 10px 0; font-size: 16px; font-weight: bold; line-height: 1.4;">
            <a href="${postUrl}" style="color: #1a1a1a; text-decoration: none;">
              ${post.title}
            </a>
          </h3>
          <p style="color: #666; font-size: 13px; margin: 10px 0;">
            ${excerpt.substring(0, 80)}...
          </p>
          <a href="${postUrl}" style="color: #667eea; font-size: 13px; font-weight: 600; text-decoration: none;">
            Read More →
          </a>
        </div>
      </div>
    `
  }
}

/**
 * Template 1: Featured Post + List
 * One large featured post followed by smaller posts
 */
export function generateFeaturedTemplate(campaign, posts, unsubscribeUrl) {
  const [featuredPost, ...otherPosts] = posts

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          ${generateEmailHeader()}
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            ${campaign.content ? `
              <div style="margin-bottom: 40px;">
                <p style="font-size: 16px; line-height: 1.8; color: #333;">
                  ${campaign.content}
                </p>
              </div>
            ` : ''}
            
            ${featuredPost ? `
              <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 20px 0; color: #1a1a1a;">
                ✨ Featured Article
              </h2>
              ${generateBlogPostCard(featuredPost, 'featured')}
            ` : ''}
            
            ${otherPosts.length > 0 ? `
              <h2 style="font-size: 22px; font-weight: bold; margin: 40px 0 20px 0; color: #1a1a1a;">
                📚 More from Multigyan
              </h2>
              ${otherPosts.map(post => generateBlogPostCard(post, 'compact')).join('')}
            ` : ''}
            
            <!-- CTA Section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 40px; text-align: center; margin-top: 40px;">
              <h3 style="color: white; font-size: 24px; margin: 0 0 15px 0;">
                Explore More Content
              </h3>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0 0 25px 0;">
                Visit our website to discover more articles, recipes, and DIY tutorials
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background: white; color: #667eea; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Visit Multigyan
              </a>
            </div>
          </div>
          
          ${generateEmailFooter(unsubscribeUrl)}
        </div>
      </body>
    </html>
  `
}

/**
 * Template 2: Grid Layout
 * 2-column grid of posts
 */
export function generateGridTemplate(campaign, posts, unsubscribeUrl) {
  // Split posts into pairs for 2-column layout
  const postPairs = []
  for (let i = 0; i < posts.length; i += 2) {
    postPairs.push(posts.slice(i, i + 2))
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          ${generateEmailHeader()}
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            ${campaign.content ? `
              <div style="margin-bottom: 40px; text-align: center;">
                <p style="font-size: 16px; line-height: 1.8; color: #333;">
                  ${campaign.content}
                </p>
              </div>
            ` : ''}
            
            <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 20px 0; color: #1a1a1a; text-align: center;">
              📖 Latest Articles
            </h2>
            
            ${postPairs.map(pair => `
              <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                ${pair.map(post => `
                  <div style="flex: 1;">
                    ${generateBlogPostCard(post, 'grid')}
                  </div>
                `).join('')}
              </div>
            `).join('')}
            
            <!-- CTA Section -->
            <div style="background: #f9f9f9; border-radius: 12px; padding: 30px; text-align: center; margin-top: 40px; border: 2px solid #667eea;">
              <h3 style="color: #1a1a1a; font-size: 20px; margin: 0 0 10px 0;">
                Want More Great Content?
              </h3>
              <p style="color: #666; font-size: 14px; margin: 0 0 20px 0;">
                Explore hundreds of articles on technology, recipes, DIY, and more
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                Browse All Articles
              </a>
            </div>
          </div>
          
          ${generateEmailFooter(unsubscribeUrl)}
        </div>
      </body>
    </html>
  `
}

/**
 * Template 3: List View
 * Simple list of all posts
 */
export function generateListTemplate(campaign, posts, unsubscribeUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          ${generateEmailHeader()}
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            ${campaign.content ? `
              <div style="margin-bottom: 40px;">
                <p style="font-size: 16px; line-height: 1.8; color: #333;">
                  ${campaign.content}
                </p>
              </div>
            ` : ''}
            
            <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 20px 0; color: #1a1a1a;">
              📝 This Week's Articles
            </h2>
            
            ${posts.map(post => generateBlogPostCard(post, 'compact')).join('')}
            
            <!-- CTA Section -->
            <div style="text-align: center; margin-top: 40px; padding-top: 40px; border-top: 2px solid #eee;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                View All Articles
              </a>
            </div>
          </div>
          
          ${generateEmailFooter(unsubscribeUrl)}
        </div>
      </body>
    </html>
  `
}

/**
 * Main function to generate newsletter HTML
 */
export function generateNewsletterHTML(campaign, posts = [], subscriber, templateType = 'featured') {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
  
  // If no posts provided, use custom HTML content
  if (!posts || posts.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${campaign.subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            ${generateEmailHeader()}
            
            <div style="padding: 40px 30px;">
              ${campaign.htmlContent || campaign.content}
            </div>
            
            ${generateEmailFooter(unsubscribeUrl)}
          </div>
        </body>
      </html>
    `
  }

  // Generate based on template type
  switch (templateType) {
    case 'grid':
      return generateGridTemplate(campaign, posts, unsubscribeUrl)
    case 'list':
      return generateListTemplate(campaign, posts, unsubscribeUrl)
    case 'featured':
    default:
      return generateFeaturedTemplate(campaign, posts, unsubscribeUrl)
  }
}
