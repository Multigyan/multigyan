// File: components/AdSense.js
// Purpose: Display Google AdSense ads
// Updated: Fixed for production use

'use client'

import { useEffect } from 'react'

/**
 * AdSense Component - READY TO USE
 * 
 * USAGE:
 * import AdSense from '@/components/AdSense'
 * 
 * <AdSense adSlot="1234567890" adFormat="auto" />
 * 
 * Get your ad slot IDs from: https://adsense.google.com
 */

export default function AdSense({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  adStyle = { display: 'block', margin: '20px 0' }
}) {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Show preview in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div style={{
        ...adStyle,
        background: '#f0f0f0',
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        border: '2px dashed #ccc',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          📢 AdSense Ad Preview
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Slot: {adSlot} | Format: {adFormat}
        </div>
        <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.5 }}>
          (Ads will show in production)
        </div>
      </div>
    )
  }

  return (
    <ins
      className="adsbygoogle"
      style={adStyle}
      data-ad-client="ca-pub-1982960683340318"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  )
}

/**
 * AD PLACEMENT BEST PRACTICES:
 * 
 * ✅ RECOMMENDED PLACEMENTS:
 * - After first paragraph in blog posts
 * - In the middle of long content
 * - At the end of articles (before comments)
 * - In sidebar (on desktop)
 * 
 * ✅ DO:
 * - Place 2-3 ads per page maximum
 * - Use responsive ad formats
 * - Place ads in natural content breaks
 * - Wait 2-3 seconds before loading ads
 * 
 * ❌ DON'T:
 * - Use more than 3 ads per page
 * - Click on your own ads (instant ban!)
 * - Place ads too close together
 * - Cover important content with ads
 * 
 * 📊 PERFORMANCE TIPS:
 * - Use 'auto' format for responsive sizing
 * - Test different placements
 * - Monitor CTR in AdSense dashboard
 * - Higher viewability = higher earnings
 */
