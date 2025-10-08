// File: components/AdSense.js
// Purpose: Display Google AdSense ads
// IMPORTANT: Only use AFTER AdSense approval!

'use client'

import { useEffect } from 'react'

/**
 * AdSense Component
 * 
 * BEFORE USING:
 * 1. Get approved by Google AdSense
 * 2. Create ad units in AdSense dashboard
 * 3. Get your Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
 * 4. Replace "ca-pub-XXXXXXXXXXXXXXXX" below with your actual ID
 * 
 * USAGE:
 * import AdSense from '@/components/AdSense'
 * 
 * <AdSense adSlot="1234567890" adFormat="auto" />
 */

export default function AdSense({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  adStyle = { display: 'block', margin: '20px 0' }
}) {
  useEffect(() => {
    // Only load ads in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

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
        border: '2px dashed #ccc'
      }}>
        [AdSense Ad Preview - Slot: {adSlot}]
      </div>
    )
  }

  return (
    <ins
      className="adsbygoogle"
      style={adStyle}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REPLACE with your Publisher ID
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  )
}

/**
 * AD PLACEMENT BEST PRACTICES:
 * 
 * ✅ DO:
 * - Place 1-3 ads per page
 * - Use responsive ad formats
 * - Place ads in natural content breaks
 * 
 * ❌ DON'T:
 * - Use more than 3 ads per page
 * - Click on your own ads (will get banned!)
 * - Cover content with ads
 */
