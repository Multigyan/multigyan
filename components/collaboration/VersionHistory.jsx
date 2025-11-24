"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    Clock,
    User,
    FileText,
    RotateCcw,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

/**
 * VersionHistory Component
 * 
 * Display version history timeline for a post
 * Allow viewing and restoring previous versions
 */

export default function VersionHistory({ postId, open, onClose }) {
    const [loading, setLoading] = useState(false)
    const [versions, setVersions] = useState([])
    const [selectedVersion, setSelectedVersion] = useState(null)
    const [restoring, setRestoring] = useState(false)

    // Fetch version history
    useEffect(() => {
        if (open && postId) {
            fetchVersions()
        }
    }, [open, postId])

    const fetchVersions = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/posts/${postId}/versions`)
            const data = await response.json()

            if (response.ok) {
                setVersions(data.versions || [])
            } else {
                toast.error('Failed to load version history')
            }
        } catch (error) {
            console.error('Fetch versions error:', error)
            toast.error('Failed to load version history')
        } finally {
            setLoading(false)
        }
    }

    // Restore version
    const handleRestore = async (version) => {
        if (!confirm(`Are you sure you want to restore to version ${version.version}? This will create a new version with the restored content.`)) {
            return
        }

        setRestoring(true)
        try {
            const response = await fetch(`/api/posts/${postId}/versions/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version: version.version,
                    reason: `Restored to version ${version.version}`
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Version restored successfully!')
                onClose()
                // Reload page to show restored content
                window.location.reload()
            } else {
                toast.error(data.error || 'Failed to restore version')
            }
        } catch (error) {
            console.error('Restore error:', error)
            toast.error('Failed to restore version')
        } finally {
            setRestoring(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>Version History</DialogTitle>
                    <DialogDescription>
                        View and restore previous versions of this post
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No version history</p>
                        <p className="text-sm text-muted-foreground">
                            Versions will be created automatically when you edit this post
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Timeline */}
                        <ScrollArea className="flex-1 px-6 pb-6">
                            <div className="space-y-4">
                                {versions.map((version, index) => (
                                    <div
                                        key={version._id}
                                        className={`relative pl-8 pb-4 ${index !== versions.length - 1 ? 'border-l-2 border-muted' : ''
                                            }`}
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                                        {/* Version card */}
                                        <div
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedVersion?._id === version._id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                            onClick={() => setSelectedVersion(version)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        Version {version.version}
                                                    </Badge>
                                                    {index === 0 && (
                                                        <Badge className="bg-green-500">Current</Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm mb-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{version.editedBy?.name || 'Unknown'}</span>
                                            </div>

                                            {version.changesSummary && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {version.changesSummary}
                                                </p>
                                            )}

                                            {version.diff?.fieldsChanged?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {version.diff.fieldsChanged.map(field => (
                                                        <Badge key={field} variant="outline" className="text-xs">
                                                            {field}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {index !== 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRestore(version)
                                                    }}
                                                    disabled={restoring}
                                                >
                                                    <RotateCcw className="mr-2 h-3 w-3" />
                                                    Restore This Version
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Version details panel */}
                        {selectedVersion && (
                            <div className="w-80 border-l bg-muted/30 p-6">
                                <h3 className="font-semibold mb-4">Version Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Version</label>
                                        <p className="text-2xl font-bold">{selectedVersion.version}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Edited By</label>
                                        <p className="text-sm">{selectedVersion.editedBy?.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedVersion.editedBy?.email}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Date</label>
                                        <p className="text-sm">
                                            {new Date(selectedVersion.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {selectedVersion.editReason && (
                                        <div>
                                            <label className="text-sm font-medium">Reason</label>
                                            <p className="text-sm text-muted-foreground">{selectedVersion.editReason}</p>
                                        </div>
                                    )}

                                    {selectedVersion.diff && (
                                        <>
                                            {selectedVersion.diff.addedTags?.length > 0 && (
                                                <div>
                                                    <label className="text-sm font-medium text-green-600">Added Tags</label>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {selectedVersion.diff.addedTags.map(tag => (
                                                            <Badge key={tag} className="bg-green-500 text-xs">{tag}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedVersion.diff.removedTags?.length > 0 && (
                                                <div>
                                                    <label className="text-sm font-medium text-red-600">Removed Tags</label>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {selectedVersion.diff.removedTags.map(tag => (
                                                            <Badge key={tag} variant="destructive" className="text-xs">{tag}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedVersion.diff.contentLengthChange !== 0 && (
                                                <div>
                                                    <label className="text-sm font-medium">Content Change</label>
                                                    <p className={`text-sm ${selectedVersion.diff.contentLengthChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedVersion.diff.contentLengthChange > 0 ? '+' : ''}
                                                        {selectedVersion.diff.contentLengthChange} characters
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
