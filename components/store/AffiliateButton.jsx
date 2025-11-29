"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AffiliateButton({ productSlug, className }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        try {
            setIsLoading(true)

            // Track the click and get the affiliate link
            const response = await fetch(`/api/store/products/${productSlug}/click`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to track click')
            }

            const data = await response.json()

            // Open affiliate link in new tab
            if (data.affiliateLink) {
                window.open(data.affiliateLink, '_blank', 'noopener,noreferrer')
            }
        } catch (error) {
            console.error('Error tracking click:', error)
            toast.error('Failed to open product link')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            size="lg"
            className={`w-full sm:w-auto text-lg px-10 py-7 shadow-2xl hover:shadow-xl transition-all hover:scale-105 group bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${className}`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Opening...
                </>
            ) : (
                <>
                    <ExternalLink className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
                    Buy Now
                </>
            )}
        </Button>
    )
}
