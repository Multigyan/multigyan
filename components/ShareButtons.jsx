'use client'

import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ShareButtons({ url, title, className = '' }) {
    const [copied, setCopied] = useState(false)

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error('Failed to copy link')
        }
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm text-muted-foreground mr-2">Share:</span>

            <Button
                variant="outline"
                size="icon"
                asChild
                aria-label="Share on Twitter"
            >
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                </a>
            </Button>

            <Button
                variant="outline"
                size="icon"
                asChild
                aria-label="Share on Facebook"
            >
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                </a>
            </Button>

            <Button
                variant="outline"
                size="icon"
                asChild
                aria-label="Share on LinkedIn"
            >
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                </a>
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                aria-label="Copy link"
            >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </Button>
        </div>
    )
}
