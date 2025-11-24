"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, RotateCcw, Eye, Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import RevisionDiff from "./RevisionDiff"
import { toast } from "sonner"

/**
 * Revision History Component
 * 
 * Display and manage post revisions
 * Allows viewing diffs and restoring previous versions
 * 
 * @param {string} postId - Post identifier
 * @param {object} currentData - Current post data
 * @param {function} onRestore - Callback when revision is restored
 */
export default function RevisionHistory({ postId, currentData, onRestore }) {
    const [revisions, setRevisions] = useState([])
    const [selectedRevision, setSelectedRevision] = useState(null)
    const [showDiff, setShowDiff] = useState(false)
    const [loading, setLoading] = useState(false)

    // Load revisions from localStorage
    useEffect(() => {
        if (!postId) return

        try {
            const storageKey = `revisions_${postId}`
            const saved = localStorage.getItem(storageKey)

            if (saved) {
                const parsed = JSON.parse(saved)
                setRevisions(parsed.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                ))
            }
        } catch (error) {
            console.error('Failed to load revisions:', error)
        }
    }, [postId])

    // Create a new revision
    const createRevision = (data, type = 'auto') => {
        if (!postId) return

        try {
            const revision = {
                id: `rev_${Date.now()}`,
                postId,
                version: revisions.length + 1,
                data: { ...data },
                createdAt: new Date().toISOString(),
                type, // 'auto', 'manual', 'publish'
                changesSummary: generateChangesSummary(revisions[0]?.data, data)
            }

            const updated = [revision, ...revisions].slice(0, 50) // Keep last 50 revisions
            setRevisions(updated)

            // Save to localStorage
            const storageKey = `revisions_${postId}`
            localStorage.setItem(storageKey, JSON.stringify(updated))

            if (type === 'manual') {
                toast.success('Revision saved!')
            }
        } catch (error) {
            console.error('Failed to create revision:', error)
            toast.error('Failed to save revision')
        }
    }

    // Generate summary of changes
    const generateChangesSummary = (oldData, newData) => {
        if (!oldData) return 'Initial version'

        const changes = []

        if (oldData.title !== newData.title) changes.push('title')
        if (oldData.content !== newData.content) changes.push('content')
        if (oldData.excerpt !== newData.excerpt) changes.push('excerpt')
        if (oldData.category !== newData.category) changes.push('category')
        if (JSON.stringify(oldData.tags) !== JSON.stringify(newData.tags)) changes.push('tags')

        if (changes.length === 0) return 'No changes'
        return `Updated ${changes.join(', ')}`
    }

    // Restore a revision
    const handleRestore = (revision) => {
        if (window.confirm('Are you sure you want to restore this version? Current changes will be saved as a new revision.')) {
            // Save current state as a revision first
            createRevision(currentData, 'manual')

            // Restore the selected revision
            if (onRestore) {
                onRestore(revision.data)
            }

            toast.success('Revision restored!')
            setShowDiff(false)
            setSelectedRevision(null)
        }
    }

    // View diff
    const handleViewDiff = (revision) => {
        setSelectedRevision(revision)
        setShowDiff(true)
    }

    // Expose createRevision for external use
    useEffect(() => {
        if (window) {
            window.createRevision = createRevision
        }
    }, [revisions])

    if (showDiff && selectedRevision) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Comparing Versions
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setShowDiff(false)}>
                            Back to List
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <RevisionDiff
                        oldData={selectedRevision.data}
                        newData={currentData}
                        onRestore={() => handleRestore(selectedRevision)}
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Revision History
                    {revisions.length > 0 && (
                        <Badge variant="secondary">{revisions.length} versions</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {revisions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No revisions yet</p>
                        <p className="text-sm">Changes will be saved automatically</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                            {revisions.map((revision, index) => (
                                <Card
                                    key={revision.id}
                                    className={`p-4 ${index === 0 ? 'border-primary' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={
                                                    revision.type === 'publish' ? 'default' :
                                                        revision.type === 'manual' ? 'secondary' :
                                                            'outline'
                                                }>
                                                    v{revision.version}
                                                </Badge>
                                                {index === 0 && (
                                                    <Badge variant="default">Current</Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {revision.type}
                                                </Badge>
                                            </div>

                                            <p className="text-sm font-medium mb-1">
                                                {revision.changesSummary}
                                            </p>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(revision.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDiff(revision)}
                                                disabled={index === 0}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                Diff
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRestore(revision)}
                                                disabled={index === 0}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {/* Manual Save Button */}
                <div className="mt-4 pt-4 border-t">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => createRevision(currentData, 'manual')}
                    >
                        <History className="mr-2 h-4 w-4" />
                        Save Current Version
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
