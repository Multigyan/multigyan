/**
 * EnhancedSchema Component
 * Renders JSON-LD structured data for SEO
 * Supports multiple schema types
 */
export default function EnhancedSchema({ schemas }) {
  if (!schemas || schemas.length === 0) return null
  
  // Handle single schema or array of schemas
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas]
  
  return (
    <>
      {schemaArray.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0) // Minified for production
          }}
        />
      ))}
    </>
  )
}
