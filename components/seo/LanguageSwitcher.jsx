'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * LanguageSwitcher Component
 * Allows users to switch between English and Hindi versions
 */
export default function LanguageSwitcher({ 
  currentLang = 'en', 
  currentSlug,
  translationSlug 
}) {
  const languages = {
    'en': { name: 'English', flag: '🇮🇳' },
    'hi': { name: 'हिन्दी', flag: '🇮🇳' }
  }
  
  const currentLanguage = languages[currentLang]
  const otherLang = currentLang === 'en' ? 'hi' : 'en'
  const otherLanguage = languages[otherLang]
  
  // If no translation exists, don't show switcher
  if (!translationSlug) {
    return null
  }
  
  const translationUrl = `/${otherLang}/blog/${translationSlug}`
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/${currentLang}/blog/${currentSlug}`} className="flex items-center gap-2">
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">Current</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={translationUrl} className="flex items-center gap-2">
            <span>{otherLanguage.flag}</span>
            <span>{otherLanguage.name}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
