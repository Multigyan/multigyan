// File: components/PerformanceMonitor.js
// Purpose: Monitor Core Web Vitals in production
// Usage: Add to your root layout

'use client'

import { useEffect } from 'react'

/**
 * Performance Monitor Component
 * Tracks Core Web Vitals and sends to analytics
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint) - Target: < 2.5s
 * - FID (First Input Delay) - Target: < 100ms
 * - CLS (Cumulative Layout Shift) - Target: < 0.1
 * - FCP (First Contentful Paint) - Target: < 1.8s
 * - TTFB (Time to First Byte) - Target: < 600ms
 */

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Function to send metrics to analytics
    function sendToAnalytics(metric) {
      const body = JSON.stringify(metric)
      
      // Send to Google Analytics if available
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        })
      }

      // Log to console in development
      console.log('[Performance]', metric.name, Math.round(metric.value), 'ms')

      // Optional: Send to your own analytics endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body
      // })
    }

    // Import web-vitals dynamically
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onFID(sendToAnalytics)
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    }).catch(err => {
      console.error('Error loading web-vitals:', err)
    })
  }, [])

  return null // This component doesn't render anything
}

/**
 * USAGE IN app/layout.js:
 * 
 * import PerformanceMonitor from '@/components/PerformanceMonitor'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PerformanceMonitor />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 */

/**
 * INSTALL web-vitals package:
 * npm install web-vitals
 */

/**
 * UNDERSTANDING THE METRICS:
 * 
 * LCP (Largest Contentful Paint):
 * - Measures loading performance
 * - Should occur within 2.5 seconds of page start
 * - Represents when the main content is visible
 * 
 * FID (First Input Delay):
 * - Measures interactivity
 * - Should be less than 100 milliseconds
 * - Time from user interaction to browser response
 * 
 * CLS (Cumulative Layout Shift):
 * - Measures visual stability
 * - Should be less than 0.1
 * - Prevents unexpected layout shifts
 * 
 * FCP (First Contentful Paint):
 * - Should be less than 1.8 seconds
 * - When first content appears
 * 
 * TTFB (Time to First Byte):
 * - Should be less than 600ms
 * - Server response time
 */
