'use client'

export default function StructuredData({ data }) {
  // Only render on client to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  )
}
