"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Users, Lock, AlertTriangle } from 'lucide-react'

/**
 * EditingIndicator Component
 * 
 * Shows if someone else is editing the post
 * Displays lock status and warnings
 */

export default function EditingIndicator({ postId }) {
    const [editingStatus, setEditingStatus] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!postId) return

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/posts/${postId}/lock`)
                const data = await response.json()

                if (response.ok) {
                    setEditingStatus(data.editing)
                }
            } catch (error) {
                console.error('Check editing status error:', error)
            } finally {
                setLoading(false)
            }
        }

        checkStatus()
        // Check every 30 seconds
        const interval = setInterval(checkStatus, 30000)

        return () => clearInterval(interval)
    }, [postId])

    if (loading || !editingStatus?.isLocked) return null

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
                <div>
                    <strong>{editingStatus.lockedBy?.name || 'Another user'}</strong> is currently editing this post.
                    <span className="text-xs block mt-1">
                        Locked {new Date(editingStatus.lockedAt).toLocaleTimeString()}
                    </span>
                </div>
                <Badge variant="destructive">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                </Badge>
            </AlertDescription>
        </Alert>
    )
}
