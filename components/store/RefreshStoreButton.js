"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function RefreshStoreButton() {
    const [loading, setLoading] = useState(false)

    const handleRefresh = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/revalidate/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'your-secret-key'
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Store page refreshed successfully!')
            } else {
                toast.error(data.error || 'Failed to refresh store page')
            }
        } catch (error) {
            toast.error('Error refreshing store page')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="lg"
            className="gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Store Page'}
        </Button>
    )
}
