"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe, Languages } from "lucide-react"
import { toast } from "sonner"

/**
 * LanguageSwitcher Component
 * Displays a language toggle button when a post has translations
 * 
 * @param {Object} post - The current post object
 * @param {string} post.lang - Current post language ('en' or 'hi')
 * @param {string} post.translationOf - ID of the linked translation post
 * @param {string} post._id - Current post ID
 */
export default function LanguageSwitcher({ post }) {
  const [translatedPost, setTranslatedPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (post) {
      fetchTranslation()
    }
  }, [post])

  const fetchTranslation = async () => {
    try {
      setLoading(true)

      // Check if this post has a translation linked
      if (post.translationOf) {
        // This post IS a translation, fetch the original
        console.log('Fetching original post:', post.translationOf)
        const response = await fetch(`/api/posts/${post.translationOf}`)
        const data = await response.json()
        
        console.log('Original post response:', data)
        
        if (response.ok && data.post) {
          console.log('Setting translated post to:', data.post.title, data.post.slug)
          setTranslatedPost(data.post)
        } else {
          console.error('Failed to fetch original post:', data)
        }
      } else {
        // This is the original, find if there's a translation
        console.log('Searching for translation of post:', post._id)
        const response = await fetch(`/api/posts?translationOf=${post._id}&status=published&limit=1`)
        const data = await response.json()
        
        console.log('Translation search response:', data)
        
        if (response.ok && data.posts && data.posts.length > 0) {
          console.log('Setting translated post to:', data.posts[0].title, data.posts[0].slug)
          setTranslatedPost(data.posts[0])
        } else {
          console.log('No translation found')
        }
      }
    } catch (error) {
      console.error('Error fetching translation:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show if no translation exists
  if (loading || !translatedPost) {
    return null
  }

  const currentLang = post.lang || 'en'
  const targetLang = translatedPost.lang || (currentLang === 'en' ? 'hi' : 'en')

  const languageLabels = {
    en: { full: 'English', short: 'EN', flag: '🇬🇧', label: 'Read in English' },
    hi: { full: 'Hindi', short: 'HI', flag: '🇮🇳', label: 'हिंदी में पढ़ें' }
  }

  const current = languageLabels[currentLang]
  const target = languageLabels[targetLang]

  return (
    <div className="flex items-center gap-3">
      {/* Mobile View: Icon Button */}
      <Link href={`/blog/${translatedPost.slug}`} className="md:hidden">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 hover:bg-primary/10 border-primary/30"
          title={target.label}
        >
          <Languages className="h-4 w-4" />
          <span>{target.flag} {target.short}</span>
        </Button>
      </Link>

      {/* Desktop View: Full Button */}
      <Link href={`/blog/${translatedPost.slug}`} className="hidden md:block">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 hover:bg-primary/10 border-primary/30"
        >
          <Globe className="h-4 w-4" />
          <span>
            {target.flag} {target.label}
          </span>
        </Button>
      </Link>

      {/* Current Language Indicator */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-md border border-border">
        <span className="text-xs text-muted-foreground">Currently viewing:</span>
        <span className="text-xs font-medium">{current.flag} {current.full}</span>
      </div>
    </div>
  )
}
