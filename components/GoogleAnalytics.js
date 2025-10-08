// File: components/GoogleAnalytics.js
// Purpose: Adds Google Analytics 4 tracking to your site

'use client'

import Script from 'next/script'

/**
 * Google Analytics Component
 * 
 * How to get your Measurement ID:
 * 1. Go to https://analytics.google.com
 * 2. Admin → Property Settings
 * 3. Copy your Measurement ID (starts with G-)
 * 
 * Usage in app/layout.js:
 * import GoogleAnalytics from '@/components/GoogleAnalytics'
 * 
 * <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
 */

export default function GoogleAnalytics({ measurementId }) {
  // Don't load in development to avoid skewing analytics
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      {/* Load Google Analytics script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      
      {/* Initialize Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
