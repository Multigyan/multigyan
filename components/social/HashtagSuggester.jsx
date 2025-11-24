"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Hash, TrendingUp, Plus, X, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * HashtagSuggester Component
 * 
 * Suggest relevant hashtags based on post content
 * Allow manual hashtag entry
 */

export default function HashtagSuggester({ title, content, tags, initialHashtags = [], onUpdate }) {
    const [hashtags, setHashtags] = useState(initialHashtags)
    const [suggestions, setSuggestions] = useState([])
    const [customHashtag, setCustomHashtag] = useState('')
    const [generating, setGenerating] = useState(false)

    // Generate hashtag suggestions from content
    const generateSuggestions = () => {
        setGenerating(true)

        // Simple algorithm: extract keywords from title and content
        const text = `${title} ${content}`.toLowerCase()
        const words = text
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 4) // Only words longer than 4 chars
            .filter(word => !['about', 'there', 'their', 'these', 'those', 'which', 'where', 'while'].includes(word))

        // Count word frequency
        const wordCount = {}
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1
        })

        // Sort by frequency and take top 10
        const topWords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word)

        // Add category tags
        const categoryHashtags = tags?.map(tag => tag.toLowerCase().replace(/\s+/g, '')) || []

        // Combine and format
        const allSuggestions = [...new Set([...categoryHashtags, ...topWords])]
            .map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`)
            .filter(tag => !hashtags.includes(tag))
            .slice(0, 15)

        setSuggestions(allSuggestions)
        setGenerating(false)
        toast.success(`Generated ${allSuggestions.length} hashtag suggestions!`)
    }

    // Add hashtag
    const addHashtag = (tag) => {
        const formattedTag = tag.startsWith('#') ? tag : `#${tag}`
        if (!hashtags.includes(formattedTag)) {
            const newHashtags = [...hashtags, formattedTag]
            setHashtags(newHashtags)
            if (onUpdate) onUpdate(newHashtags)
            setSuggestions(suggestions.filter(s => s !== formattedTag))
        }
    }

    // Remove hashtag
    const removeHashtag = (tag) => {
        const newHashtags = hashtags.filter(h => h !== tag)
        setHashtags(newHashtags)
        if (onUpdate) onUpdate(newHashtags)
    }

    // Add custom hashtag
    const handleAddCustom = () => {
        if (customHashtag.trim()) {
            addHashtag(customHashtag.trim())
            setCustomHashtag('')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Hashtags
                </CardTitle>
                <CardDescription>
                    Add hashtags to increase social media reach
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Hashtags */}
                {hashtags.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Selected Hashtags</Label>
                        <div className="flex flex-wrap gap-2">
                            {hashtags.map(tag => (
                                <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                                    {tag}
                                    <button
                                        onClick={() => removeHashtag(tag)}
                                        className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Custom Hashtag */}
                <div>
                    <Label htmlFor="customHashtag" className="text-sm font-medium mb-2 block">
                        Add Custom Hashtag
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="customHashtag"
                            value={customHashtag}
                            onChange={(e) => setCustomHashtag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                            placeholder="#YourHashtag"
                        />
                        <Button onClick={handleAddCustom} disabled={!customHashtag.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Generate Suggestions */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={generateSuggestions}
                    disabled={generating || !title}
                >
                    {generating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Suggestions
                        </>
                    )}
                </Button>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Suggested Hashtags
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => addHashtag(tag)}
                                >
                                    {tag}
                                    <Plus className="ml-1 h-3 w-3" />
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium mb-1">💡 Hashtag Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Use 5-10 relevant hashtags for best engagement</li>
                        <li>Mix popular and niche hashtags</li>
                        <li>Research trending hashtags in your category</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}

// Label component (if not in UI library)
function Label({ children, htmlFor, className = '' }) {
    return (
        <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>
            {children}
        </label>
    )
}
