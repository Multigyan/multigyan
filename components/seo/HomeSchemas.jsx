'use client'

import { useEffect } from 'react'

/**
 * HomeSchemas Component
 * Injects schema markup into the page for homepage
 * Works with client components by injecting into DOM
 */
export default function HomeSchemas() {
  useEffect(() => {
    const baseUrl = window.location.origin
    
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Multigyan",
      "alternateName": "Multigyan Blog",
      "url": baseUrl,
      "description": "A secure, high-performance, and SEO-optimized multi-author blogging platform for sharing knowledge and insights.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Multigyan",
        "url": baseUrl
      }
    }

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Multigyan",
      "alternateName": "Multigyan Blog Platform",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/Multigyan_Logo_bg.png`,
        "width": 512,
        "height": 512
      },
      "description": "Multi-author blogging platform for knowledge sharing and content creation.",
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "support@multigyan.in",
        "url": `${baseUrl}/contact`
      },
      "sameAs": [
        "https://twitter.com/multigyan",
        "https://linkedin.com/company/multigyan",
        "https://facebook.com/multigyan"
      ]
    }
    
    // Remove existing schema scripts if any
    const existingWebsiteSchema = document.querySelector('script[data-schema="website"]')
    const existingOrgSchema = document.querySelector('script[data-schema="organization"]')
    if (existingWebsiteSchema) existingWebsiteSchema.remove()
    if (existingOrgSchema) existingOrgSchema.remove()
    
    // Create and inject website schema
    const websiteScript = document.createElement('script')
    websiteScript.type = 'application/ld+json'
    websiteScript.setAttribute('data-schema', 'website')
    websiteScript.text = JSON.stringify(websiteSchema)
    document.head.appendChild(websiteScript)
    
    // Create and inject organization schema
    const orgScript = document.createElement('script')
    orgScript.type = 'application/ld+json'
    orgScript.setAttribute('data-schema', 'organization')
    orgScript.text = JSON.stringify(organizationSchema)
    document.head.appendChild(orgScript)
    
    // Cleanup on unmount
    return () => {
      websiteScript.remove()
      orgScript.remove()
    }
  }, [])

  return null // This component doesn't render anything
}
