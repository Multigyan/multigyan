"use client"

import { Button } from "@/components/ui/button"
import {
    Twitter,
    Facebook,
    Linkedin,
    Copy,
    Share2
} from "lucide-react"
import { toast } from "sonner"

/**
 * Share Buttons Component
 * 
 * Reusable share buttons for blog posts
 * Supports Twitter, Facebook, LinkedIn, WhatsApp, and Copy Link
 * 
 * @param {string} url - URL to share (defaults to current page)
 * @param {string} title - Title to share
 * @param {string} size - Button size: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} showLabel - Show platform labels (default: false)
 * @param {string} className - Additional CSS classes
 */
export default function ShareButtons({
    url,
    title,
    size = 'md',
    showLabel = false,
    className = ''
}) {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

    const handleShare = async (platform) => {
        let shareLink = ''

        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
                break
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                break
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
                break
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + shareUrl)}`
                break
            case 'copy':
                try {
                    await navigator.clipboard.writeText(shareUrl)
                    toast.success('Link copied to clipboard!', {
                        description: 'Share it anywhere you like'
                    })
                    return
                } catch (error) {
                    toast.error('Failed to copy link')
                    return
                }
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400,noopener,noreferrer')
        }
    }

    const buttonSize = size === 'sm' ? 'icon' : size === 'lg' ? 'lg' : 'icon'
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    const minSize = size === 'sm' ? 'min-h-[36px] min-w-[36px]' : 'min-h-[44px] min-w-[44px]'

    return (
        <div className={`flex items-center gap-2 flex-wrap ${className}`}>
            {!showLabel && (
                <span className="text-xs sm:text-sm text-muted-foreground mr-1 sm:mr-2">
                    Share:
                </span>
            )}

            {/* Twitter */}
            <Button
                variant="outline"
                size={buttonSize}
                onClick={() => handleShare('twitter')}
                title="Share on Twitter"
                className={`hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 ${minSize}`}
            >
                <Twitter className={iconSize} />
                {showLabel && <span className="ml-2">Twitter</span>}
            </Button>

            {/* Facebook */}
            <Button
                variant="outline"
                size={buttonSize}
                onClick={() => handleShare('facebook')}
                title="Share on Facebook"
                className={`hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 ${minSize}`}
            >
                <Facebook className={iconSize} />
                {showLabel && <span className="ml-2">Facebook</span>}
            </Button>

            {/* LinkedIn */}
            <Button
                variant="outline"
                size={buttonSize}
                onClick={() => handleShare('linkedin')}
                title="Share on LinkedIn"
                className={`hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 ${minSize}`}
            >
                <Linkedin className={iconSize} />
                {showLabel && <span className="ml-2">LinkedIn</span>}
            </Button>

            {/* WhatsApp */}
            <Button
                variant="outline"
                size={buttonSize}
                onClick={() => handleShare('whatsapp')}
                title="Share on WhatsApp"
                className={`hover:bg-green-50 hover:text-green-600 hover:border-green-600 ${minSize}`}
            >
                <Share2 className={iconSize} />
                {showLabel && <span className="ml-2">WhatsApp</span>}
            </Button>

            {/* Copy Link */}
            <Button
                variant="outline"
                size={buttonSize}
                onClick={() => handleShare('copy')}
                title="Copy link"
                className={`hover:bg-gray-50 ${minSize}`}
            >
                <Copy className={iconSize} />
                {showLabel && <span className="ml-2">Copy</span>}
            </Button>
        </div>
    )
}
