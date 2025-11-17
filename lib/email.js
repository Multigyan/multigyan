import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send a single email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<Object>} - Resend response
 */
export async function sendEmail({ to, subject, html, text, from }) {
  try {
    const fromEmail = from || `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`
    
    const response = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text: text || stripHtml(html)
    })

    return {
      success: true,
      messageId: response.id,
      data: response
    }
  } catch (error) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send bulk emails using Resend
 * @param {Array} emails - Array of email objects [{to, subject, html}]
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Results summary
 */
export async function sendBulkEmails(emails, onProgress) {
  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    errors: []
  }

  // Send in batches to avoid rate limiting
  const BATCH_SIZE = 10
  const DELAY_BETWEEN_BATCHES = 1000 // 1 second

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(async (email) => {
      const result = await sendEmail(email)
      
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        results.errors.push({
          email: email.to,
          error: result.error
        })
      }

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          current: results.sent + results.failed,
          total: results.total,
          sent: results.sent,
          failed: results.failed
        })
      }

      return result
    })

    await Promise.all(batchPromises)

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < emails.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }

  return results
}

/**
 * Send newsletter to subscribers
 * @param {Object} campaign - Newsletter campaign object
 * @param {Array} subscribers - Array of subscriber objects
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Results summary
 */
export async function sendNewsletterCampaign(campaign, subscribers, onProgress) {
  const emails = subscribers.map(subscriber => ({
    to: subscriber.email,
    subject: campaign.subject,
    html: generateNewsletterHTML(campaign, subscriber),
    text: campaign.content
  }))

  return await sendBulkEmails(emails, onProgress)
}

/**
 * Send confirmation email for double opt-in
 * @param {string} email - Subscriber email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Email result
 */
export async function sendSubscriptionConfirmation(email, token) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Multigyan!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for subscribing to our newsletter! 🎉</p>
          
          <p style="font-size: 16px; margin-bottom: 30px;">Please confirm your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold; 
                      display: inline-block;">
              Confirm Subscription
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">
            ${confirmUrl}
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you didn't subscribe to this newsletter, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Multigyan. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject: '✅ Confirm your subscription to Multigyan Newsletter',
    html
  })
}

/**
 * Send welcome email to new subscriber
 * @param {string} email - Subscriber email
 * @param {Object} subscriber - Subscriber object
 * @returns {Promise<Object>} - Email result
 */
export async function sendWelcomeEmail(email, subscriber) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Multigyan</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Multigyan! 🎉</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi there! 👋</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for joining our community of knowledge seekers! You're now part of a growing family of learners.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Here's what you can expect from us:
          </p>
          
          <ul style="font-size: 16px; margin-bottom: 30px; line-height: 2;">
            <li>📚 Expert articles on technology, programming, and more</li>
            <li>🍳 Delicious recipes and cooking tips</li>
            <li>🔨 DIY tutorials and project ideas</li>
            <li>💡 Tips and tricks from industry experts</li>
            <li>🎯 Weekly digest of our best content</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold; 
                      display: inline-block;">
              Explore Multigyan
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            You can manage your subscription preferences or unsubscribe anytime by clicking the link at the bottom of any email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Multigyan. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}" 
               style="color: #667eea; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject: '🎉 Welcome to Multigyan Newsletter!',
    html
  })
}

/**
 * Generate newsletter HTML with tracking pixels
 * @param {Object} campaign - Campaign object
 * @param {Object} subscriber - Subscriber object
 * @returns {string} - HTML content
 */
function generateNewsletterHTML(campaign, subscriber) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
  const trackingPixel = campaign.settings.trackOpens 
    ? `<img src="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/track/open/${campaign._id}/${encodeURIComponent(subscriber.email)}" width="1" height="1" style="display:none" />`
    : ''

  // Add tracking to links if enabled
  let htmlContent = campaign.htmlContent
  if (campaign.settings.trackClicks) {
    htmlContent = htmlContent.replace(
      /href="([^"]*)"/g,
      `href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/track/click/${campaign._id}/${encodeURIComponent(subscriber.email)}?url=$1"`
    )
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${htmlContent}
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          <p>© ${new Date().getFullYear()} Multigyan. All rights reserved.</p>
          <p>
            You're receiving this email because you subscribed to our newsletter.
          </p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none;">Visit Website</a>
          </p>
        </div>
        ${trackingPixel}
      </body>
    </html>
  `
}

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Test email configuration
 * @param {string} testEmail - Email to send test to
 * @returns {Promise<Object>} - Test result
 */
export async function testEmailConfig(testEmail) {
  try {
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from Multigyan',
      html: '<h1>Test Successful!</h1><p>Your email configuration is working correctly.</p>'
    })

    return result
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  sendEmail,
  sendBulkEmails,
  sendNewsletterCampaign,
  sendSubscriptionConfirmation,
  sendWelcomeEmail,
  testEmailConfig
}
