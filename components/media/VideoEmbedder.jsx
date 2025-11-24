"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Video,
    Link as LinkIcon,
    Play,
    Youtube,
    Check,
    Loader2,
    Info,
    ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

/**
 * VideoEmbedder Component
 * 
 * Smart video embedding with auto-detection for YouTube and Vimeo
 * Features:
 * - YouTube/Vimeo URL auto-detection
 * - Thumbnail preview
 * - Responsive embed codes
 * - Direct video URL support
 */

export default function VideoEmbedder({
    value,
    onChange,
    className = '',
    placeholder = 'Paste YouTube, Vimeo, or video URL...'
}) {
    const [videoUrl, setVideoUrl] = useState(value || '')
    const [urlInput, setUrlInput] = useState('')
    const [validating, setValidating] = useState(false)
    const [videoData, setVideoData] = useState(null)
    const [activeTab, setActiveTab] = useState('url')

    // Parse video URL and extract platform/ID
    const parseVideoUrl = useCallback((url) => {
        try {
            const urlObj = new URL(url)

            // YouTube patterns
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                let videoId = null

                if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1)
                } else if (urlObj.searchParams.has('v')) {
                    videoId = urlObj.searchParams.get('v')
                }

                if (videoId) {
                    return {
                        platform: 'youtube',
                        id: videoId,
                        embedUrl: `https://www.youtube.com/embed/${videoId}`,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                        watchUrl: `https://www.youtube.com/watch?v=${videoId}`
                    }
                }
            }

            // Vimeo patterns
            if (urlObj.hostname.includes('vimeo.com')) {
                const videoId = urlObj.pathname.split('/').filter(Boolean)[0]

                if (videoId) {
                    return {
                        platform: 'vimeo',
                        id: videoId,
                        embedUrl: `https://player.vimeo.com/video/${videoId}`,
                        thumbnail: null, // Vimeo requires API call for thumbnail
                        watchUrl: `https://vimeo.com/${videoId}`
                    }
                }
            }

            // Direct video URL
            if (url.match(/\.(mp4|webm|ogg)$/i)) {
                return {
                    platform: 'direct',
                    id: null,
                    embedUrl: url,
                    thumbnail: null,
                    watchUrl: url
                }
            }

            return null
        } catch (error) {
            return null
        }
    }, [])

    // Handle URL submission
    const handleUrlSubmit = useCallback(async () => {
        if (!urlInput.trim()) {
            toast.error('Please enter a video URL')
            return
        }

        setValidating(true)

        try {
            const parsed = parseVideoUrl(urlInput.trim())

            if (!parsed) {
                toast.error('Invalid video URL', {
                    description: 'Please enter a YouTube, Vimeo, or direct video URL'
                })
                setValidating(false)
                return
            }

            setVideoData(parsed)
            setVideoUrl(urlInput.trim())
            onChange(urlInput.trim())
            setUrlInput('')
            toast.success(`${parsed.platform === 'youtube' ? 'YouTube' : parsed.platform === 'vimeo' ? 'Vimeo' : 'Video'} URL added successfully!`)

        } catch (error) {
            console.error('Video URL error:', error)
            toast.error('Failed to process video URL')
        } finally {
            setValidating(false)
        }
    }, [urlInput, parseVideoUrl, onChange])

    // Remove video
    const handleRemove = useCallback(() => {
        setVideoUrl('')
        setVideoData(null)
        onChange('')
        toast.success('Video removed')
    }, [onChange])

    // Parse existing value on mount
    useEffect(() => {
        if (value && !videoData) {
            const parsed = parseVideoUrl(value)
            if (parsed) {
                setVideoData(parsed)
            }
        }
    }, [value, videoData, parseVideoUrl])

    // Get embed code
    const getEmbedCode = useCallback(() => {
        if (!videoData) return ''

        return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="${videoData.embedUrl}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>`
    }, [videoData])

    return (
        <div className={`space-y-4 ${className}`}>
            {!videoUrl ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">Video URL</TabsTrigger>
                        <TabsTrigger value="embed">Embed Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="space-y-4">
                        <div>
                            <Label htmlFor="videoUrl">Video URL</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="videoUrl"
                                    type="url"
                                    placeholder={placeholder}
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                    disabled={validating}
                                />
                                <Button
                                    type="button"
                                    onClick={handleUrlSubmit}
                                    disabled={validating || !urlInput.trim()}
                                >
                                    {validating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Supports YouTube, Vimeo, and direct video URLs (.mp4, .webm, .ogg)
                            </p>
                        </div>

                        {/* Platform Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <Youtube className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">YouTube</p>
                                    <p className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded mt-1">
                                        youtube.com/watch?v=...
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <Play className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">Vimeo</p>
                                    <p className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded mt-1">
                                        vimeo.com/123456789
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="embed" className="space-y-4">
                        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-muted-foreground">
                                <p className="font-medium text-foreground">Coming Soon!</p>
                                <p>Direct embed code support will be added in a future update.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Preview
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            {videoData?.platform === 'youtube' && (
                                <Badge className="bg-red-500">
                                    <Youtube className="h-3 w-3 mr-1" />
                                    YouTube
                                </Badge>
                            )}
                            {videoData?.platform === 'vimeo' && (
                                <Badge className="bg-blue-500">
                                    <Play className="h-3 w-3 mr-1" />
                                    Vimeo
                                </Badge>
                            )}
                            {videoData?.platform === 'direct' && (
                                <Badge>
                                    <Video className="h-3 w-3 mr-1" />
                                    Direct Video
                                </Badge>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Video Preview */}
                        <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                            {videoData?.thumbnail ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={videoData.thumbnail}
                                        alt="Video thumbnail"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play className="h-8 w-8 text-black ml-1" fill="black" />
                                        </div>
                                    </div>
                                </div>
                            ) : videoData?.embedUrl ? (
                                <iframe
                                    src={videoData.embedUrl}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : null}
                        </div>

                        {/* Video Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <LinkIcon className="h-4 w-4" />
                                <span>Video URL added</span>
                            </div>
                            <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
                                {videoUrl}
                            </p>
                            {videoData?.watchUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a href={videoData.watchUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        Watch on {videoData.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
                                    </a>
                                </Button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemove}
                                className="flex-1"
                            >
                                Remove Video
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Badge component (if not already in your UI library)
function Badge({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            {children}
        </span>
    )
}
