import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

export default async function TagsCloud({ limit = 20 }) {
    // Tags API endpoint doesn't exist yet, so return null for now
    // TODO: Create /api/tags endpoint to enable this feature
    return null

    /* Uncomment when /api/tags endpoint is created:
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/tags?limit=${limit}`, {
        next: { revalidate: 600 } // 10 minutes
      })
  
      if (!res.ok) {
        return null
      }
  
      const data = await res.json()
      const tags = data.tags || []
  
      if (tags.length === 0) return null
  
      // Calculate font sizes based on post count
      const maxCount = Math.max(...tags.map(t => t.count || 0))
      const minCount = Math.min(...tags.map(t => t.count || 0))
  
      const getFontSize = (count) => {
        if (maxCount === minCount) return 'text-sm'
        const ratio = (count - minCount) / (maxCount - minCount)
        if (ratio > 0.7) return 'text-lg'
        if (ratio > 0.4) return 'text-base'
        return 'text-sm'
      }
  
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag._id || tag.name}
                  href={`/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="transition-transform hover:scale-105"
                >
                  <Badge
                    variant="secondary"
                    className={`${getFontSize(tag.count)} cursor-pointer hover:bg-primary hover:text-primary-foreground`}
                  >
                    {tag.name}
                    {tag.count && <span className="ml-1 text-xs opacity-70">({tag.count})</span>}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    } catch (error) {
      console.log('TagsCloud error:', error)
      return null
    }
    */
}
