'use client'

/**
 * HreflangTags Component
 * Renders hreflang link tags for bilingual SEO
 */
export default function HreflangTags({ tags }) {
  if (!tags || tags.length === 0) return null
  
  return (
    <>
      {tags.map((tag, index) => (
        <link
          key={index}
          rel={tag.rel}
          hrefLang={tag.hreflang}
          href={tag.href}
        />
      ))}
    </>
  )
}
