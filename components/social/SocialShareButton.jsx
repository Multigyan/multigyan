"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Twitter,
    Facebook,
    Linkedin,
    Instagram,
    Share2,
    Loader2,
    CheckCircle2,
    XCircle,
    ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * SocialShareButton Component
 * 
 * One-click manual social media sharing
 * Admin controls which platforms to post to
 */

export default function SocialShareButton({ postId, postTitle, currentPlatforms = [] }) {
    const [loading, setLoading] = useState(false)
    const [selectedPlatforms, setSelectedPlatforms] = useState({
        twitter: currentPlatforms.some(p => p.name === 'twitter' && p.posted),
        facebook: currentPlatforms.some(p => p.name === 'facebook' && p.posted),
        linkedin: currentPlatforms.some(p => p.name === 'linkedin' && p.posted),
        instagram: currentPlatforms.some(p => p.name === 'instagram' && p.posted)
    })
    const [results, setResults] = useState(null)

    const platforms = [
        { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-[#1DA1F2]' },
        { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-[#4267B2]' },
        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-[#0077B5]' },
        { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E4405F]' }
    ]

    const handleShare = async () => {
        const platformsToPost = Object.entries(selectedPlatforms)
            .filter(([_, selected]) => selected)
            .map(([platform]) => platform)

        if (platformsToPost.length === 0) {
            toast.error('Please select at least one platform')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/posts/${postId}/social-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platforms: platformsToPost })
            })

            const data = await response.json()

            if (response.ok) {
                setResults(data.results)
                const successCount = data.results.filter(r => r.success).length
                const failCount = data.results.filter(r => !r.success).length

                if (successCount > 0) {
                    toast.success(`Posted to ${successCount} platform(s)!`)
                }
                if (failCount > 0) {
                    toast.error(`Failed to post to ${failCount} platform(s)`)
                }
            } else {
                toast.error(data.error || 'Failed to post to social media')
            }
        } catch (error) {
            console.error('Share error:', error)
            toast.error('Failed to post to social media')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share on Social Media
                </CardTitle>
                <CardDescription>
                    Manually share this post to your social media accounts
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Platforms</Label>
                    <div className="space-y-2">
                        {platforms.map(platform => {
                            const Icon = platform.icon
                            const alreadyPosted = currentPlatforms.find(p => p.name === platform.id && p.posted)

                            return (
                                <div key={platform.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={platform.id}
                                            checked={selectedPlatforms[platform.id]}
                                            onCheckedChange={(checked) =>
                                                setSelectedPlatforms(prev => ({ ...prev, [platform.id]: checked }))
                                            }
                                            disabled={loading}
                                        />
                                        <Label
                                            htmlFor={platform.id}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Icon className={`h-5 w-5 ${platform.color}`} />
                                            <span>{platform.name}</span>
                                        </Label>
                                    </div>

                                    {alreadyPosted && (
                                        <Badge variant="secondary" className="text-xs">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Posted
                                        </Badge>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Share Button */}
                <Button
                    onClick={handleShare}
                    disabled={loading || Object.values(selectedPlatforms).every(v => !v)}
                    className="w-full"
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        <>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share to Selected Platforms
                        </>
                    )}
                </Button>

                {/* Results */}
                {results && results.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t">
                        <Label className="text-sm font-medium">Results</Label>
                        {results.map(result => {
                            const platform = platforms.find(p => p.id === result.platform)
                            const Icon = platform?.icon || Share2

                            return (
                                <div
                                    key={result.platform}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${platform?.color}`} />
                                        <span className="text-sm font-medium capitalize">{result.platform}</span>
                                    </div>

                                    {result.success ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            {result.postUrl && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={result.postUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-xs text-red-600">{result.error}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Info */}
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium mb-1">💡 Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Post must be published to share on social media</li>
                        <li>You can share to multiple platforms at once</li>
                        <li>Already posted platforms can be shared again</li>
                        <li>Check social analytics after posting</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
