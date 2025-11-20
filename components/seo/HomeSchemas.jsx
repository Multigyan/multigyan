/**
 * HomeSchemas Component
 * Server component that renders schema markup for homepage
 */
export default function HomeSchemas() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  )
}
