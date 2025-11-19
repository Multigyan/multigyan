"use client"

import { useState, useCallback, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'

/**
 * FlexibleTagInput Component
 * 
 * A multi-functional tag input that supports:
 * 1. Comma-separated tags: "tag1, tag2, tag3"
 * 2. Hashtag format: "#tag1 #tag2 #tag3"
 * 3. Press Enter to add tags
 * 4. Space-separated tags
 * 5. Mix of all above formats
 * 6. Unicode support (Hindi, other languages)
 */

export default function FlexibleTagInput({ 
  tags = [], 
  onChange, 
  maxTags = 10,
  placeholder = "Add tags (comma, space, #hashtag, or press Enter)",
  label = "Tags",
  description = "Separate tags with commas, spaces, hashtags (#), or press Enter"
}) {
  const [inputValue, setInputValue] = useState('')

  /**
   * Parse input and extract tags from multiple formats
   */
  const parseTagsFromInput = useCallback((input) => {
    let parsedTags = []

    // Remove multiple spaces and trim
    input = input.trim()

    if (!input) return []

    // Method 1: Split by comma first (highest priority)
    if (input.includes(',')) {
      parsedTags = input.split(',').map(tag => tag.trim())
    }
    // Method 2: Check for hashtags
    else if (input.includes('#')) {
      // ✅ FIX: Updated regex to support Unicode characters including Hindi
      // \p{L} matches any Unicode letter (including Hindi/Devanagari)
      // \p{N} matches any Unicode number
      const hashtagMatches = input.match(/#[\p{L}\p{N}_]+/gu)
      if (hashtagMatches) {
        parsedTags = hashtagMatches.map(tag => tag.replace('#', ''))
      }
      // Also get non-hashtag words (supporting Unicode)
      const nonHashtags = input.replace(/#[\p{L}\p{N}_]+/gu, '').trim()
      if (nonHashtags) {
        parsedTags = [...parsedTags, ...nonHashtags.split(/\s+/)]
      }
    }
    // Method 3: Split by spaces
    else {
      parsedTags = input.split(/\s+/)
    }

    // ✅ FIX: Updated cleanup to preserve Unicode characters
    // Only remove truly problematic characters, keep letters from all languages
    parsedTags = parsedTags
      .map(tag => {
        // Remove leading/trailing whitespace and special symbols
        // But keep Unicode letters (Hindi, etc.), numbers, hyphens, and underscores
        return tag
          .trim()
          // Remove only problematic special characters, preserve Unicode letters
          .replace(/[^\p{L}\p{N}\s\-_]/gu, '')
          .trim()
      })
      .filter(tag => tag.length > 0) // Remove empty strings
      .filter(tag => tag.length <= 30) // Limit to 30 characters
      .filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates

    return parsedTags
  }, [])

  /**
   * Add tags from input
   */
  const addTags = useCallback(() => {
    const allParsedTags = inputValue.trim().split(/[,\s]+/).filter(t => t.length > 0)
    const longTags = allParsedTags.filter(tag => tag.length > 30)
    
    if (longTags.length > 0) {
      toast.error(`Tags cannot be more than 30 characters: ${longTags.join(', ')}`)
      return
    }

    const newTags = parseTagsFromInput(inputValue)
    
    if (newTags.length === 0) return

    // Check max tags limit
    const totalTags = tags.length + newTags.length
    if (totalTags > maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`)
      return
    }

    // Filter out tags that already exist
    const uniqueNewTags = newTags.filter(tag => 
      !tags.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
    )

    if (uniqueNewTags.length === 0) {
      toast.info('These tags already exist')
      setInputValue('')
      return
    }

    // Add new tags
    onChange([...tags, ...uniqueNewTags])
    setInputValue('')
    
    if (uniqueNewTags.length > 0) {
      toast.success(`Added ${uniqueNewTags.length} tag(s)`)
    }
  }, [inputValue, tags, maxTags, onChange, parseTagsFromInput])

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e) => {
    // Enter or comma triggers tag addition
    if (e.key === 'Enter') {
      e.preventDefault()
      addTags()
    }
    // Space can also trigger if there are multiple words or hashtags
    else if (e.key === ' ' && inputValue.includes('#')) {
      // Only auto-add on space if hashtags are being used
      e.preventDefault()
      addTags()
    }
    // Backspace on empty input removes last tag
    else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      const newTags = [...tags]
      newTags.pop()
      onChange(newTags)
    }
  }, [addTags, inputValue, tags, onChange])

  /**
   * Handle input change with auto-parsing
   */
  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    setInputValue(value)

    // Auto-add tags when comma is typed
    if (value.endsWith(',')) {
      addTags()
    }
  }, [addTags])

  /**
   * Remove a specific tag
   */
  const removeTag = useCallback((indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove)
    onChange(newTags)
  }, [tags, onChange])

  /**
   * Handle paste event - parse tags from pasted content
   */
  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const parsedTags = parseTagsFromInput(pastedText)
    
    if (parsedTags.length > 0) {
      const totalTags = tags.length + parsedTags.length
      
      if (totalTags > maxTags) {
        toast.error(`Maximum ${maxTags} tags allowed`)
        return
      }

      // Filter out duplicates
      const uniqueNewTags = parsedTags.filter(tag => 
        !tags.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
      )

      onChange([...tags, ...uniqueNewTags])
      setInputValue('')
      
      if (uniqueNewTags.length > 0) {
        toast.success(`Added ${uniqueNewTags.length} tag(s)`)
      }
    }
  }, [tags, maxTags, onChange, parseTagsFromInput])

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border border-border min-h-[42px]">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="pl-3 pr-1 py-1 text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags reached` : placeholder}
        disabled={tags.length >= maxTags}
        className="mt-1"
      />

      {/* Description with examples */}
      {description && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="font-medium">Examples:</p>
            <p>• Type: <code className="bg-muted px-1 py-0.5 rounded">javascript, react, nextjs</code></p>
            <p>• Type: <code className="bg-muted px-1 py-0.5 rounded">#javascript #react #nextjs</code></p>
            <p>• Type: <code className="bg-muted px-1 py-0.5 rounded">javascript react nextjs</code> (then press Enter)</p>
            <p>• Type: <code className="bg-muted px-1 py-0.5 rounded">PMAY Hindi, CLSS, सब्सिडी</code> (Hindi supported!)</p>
            <p>• Or mix formats and paste from anywhere!</p>
          </div>
        </div>
      )}

      {/* Tag Counter */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{tags.length} / {maxTags} tags</span>
        {tags.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-destructive hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
