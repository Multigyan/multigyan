"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Link as LinkIcon,
    Loader2,
    Plus,
    RefreshCw,
    CheckCircle2,
    Tag,
    Folder,
    Calendar,
    ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function InternalLinkSuggestions({ postId }) {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [injecting, setInjecting] = useState(false)

    useEffect(() => {
        if (postId) {
            loadSuggestions()
        }
    }, [postId])

    async function loadSuggestions() {
        setLoading(true)
        try {
            const response = await fetch(`/api/content/internal-links?postId=${postId}`)
            if (response.ok) {
                const data = await response.json()
                setSuggestions(data.suggestions || [])
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    async function autoInjectLinks() {
        setInjecting(true)
        try {
            const response = await fetch('/api/content/internal-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, autoInject: true, maxLinks: 5 })
            })

            const data = await response.json()

            if (response.ok) {
                if (data.linksAdded > 0) {
                    toast.success(`Added ${data.linksAdded} internal links!`, {
                        description: 'Save your post to keep the changes.'
                    })
                    // Reload the page to show updated content
                    window.location.reload()
                } else {
                    toast.info('No suitable link opportunities found', {
                        description: 'Your content may already have good internal linking.'
                    })
                }
            } else {
                toast.error(data.error || 'Failed to add links')
            }
        } catch (error) {
            console.error('Auto-inject error:', error)
            toast.error('Failed to add internal links')
        } finally {
            setInjecting(false)
        }
    }

    return (
        <Card className="border-2 border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Internal Link Suggestions</CardTitle>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadSuggestions}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>
                <CardDescription>
                    Boost SEO with smart internal links to related content
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {loading && (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                        <p className="text-sm text-muted-foreground">Finding related content...</p>
                    </div>
                )}

                {!loading && suggestions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No suggestions available yet</p>
                        <p className="text-xs mt-2">Create more posts with similar tags or categories</p>
                    </div>
                )}

                {!loading && suggestions.length > 0 && (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Found {suggestions.length} related posts
                            </p>
                            <Button
                                onClick={autoInjectLinks}
                                disabled={injecting}
                                size="sm"
                                className="gap-1.5"
                            >
                                {injecting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-3.5 w-3.5" />
                                        Auto-Add Links
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {suggestions.slice(0, 5).map((suggestion, idx) => (
                                <SuggestionCard
                                    key={suggestion._id}
                                    suggestion={suggestion}
                                    rank={idx + 1}
                                />
                            ))}
                        </div>

                        {suggestions.length > 5 && (
                            <p className="text-xs text-center text-muted-foreground">
                                + {suggestions.length - 5} more suggestions available
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

function SuggestionCard({ suggestion, rank }) {
    return (
        <div className="p-3 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary transition-all group">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-xs">
                            #{rank}
                        </Badge>
                        <MatchTypeBadge type={suggestion.matchType} />
                        {suggestion.relevanceScore && (
                            <span className="text-xs text-muted-foreground">
                                Score: {suggestion.relevanceScore}
                            </span>
                        )}
                    </div>

                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {suggestion.title}
                    </h4>

                    {suggestion.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {suggestion.excerpt}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {suggestion.category && (
                            <div className="flex items-center gap-1">
                                <Folder className="h-3 w-3" />
                                <span>{suggestion.category}</span>
                            </div>
                        )}
                        {suggestion.publishedAt && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                    {new Date(suggestion.publishedAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                    asChild
                >
                    <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-1"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </Button>
            </div>
        </div>
    )
}

function MatchTypeBadge({ type }) {
    const config = {
        tags: { label: 'Tags Match', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
        category: { label: 'Category', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
        keywords: { label: 'Keywords', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }
    }

    const { label, color } = config[type] || { label: type, color: 'bg-gray-100 text-gray-700' }

    return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", color)}>
            {label}
        </span>
    )
}
