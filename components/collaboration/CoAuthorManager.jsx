"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, X, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * CoAuthorManager Component
 * 
 * Manage co-authors for a post
 * Search and add/remove co-authors
 */

export default function CoAuthorManager({ postId, currentAuthors = [], coAuthors = [], onUpdate }) {
    const [searching, setSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [adding, setAdding] = useState(false)

    // Search users
    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setSearching(true)
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()

            if (response.ok) {
                // Filter out current author and existing co-authors
                const filtered = data.users.filter(user =>
                    !currentAuthors.some(id => id === user._id) &&
                    !coAuthors.some(author => author._id === user._id)
                )
                setSearchResults(filtered)
            } else {
                toast.error('Failed to search users')
            }
        } catch (error) {
            console.error('Search error:', error)
            toast.error('Failed to search users')
        } finally {
            setSearching(false)
        }
    }

    // Add co-author
    const handleAdd = async (userId) => {
        setAdding(true)
        try {
            const response = await fetch(`/api/posts/${postId}/authors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: 'contributor' })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Co-author added successfully!')
                setSearchQuery('')
                setSearchResults([])
                if (onUpdate) onUpdate(data.post)
            } else {
                toast.error(data.error || 'Failed to add co-author')
            }
        } catch (error) {
            console.error('Add co-author error:', error)
            toast.error('Failed to add co-author')
        } finally {
            setAdding(false)
        }
    }

    // Remove co-author
    const handleRemove = async (userId) => {
        if (!confirm('Are you sure you want to remove this co-author?')) return

        try {
            const response = await fetch(`/api/posts/${postId}/authors?userId=${userId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Co-author removed')
                if (onUpdate) onUpdate(data.post)
            } else {
                toast.error(data.error || 'Failed to remove co-author')
            }
        } catch (error) {
            console.error('Remove co-author error:', error)
            toast.error('Failed to remove co-author')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Co-Authors
                </CardTitle>
                <CardDescription>
                    Manage who can edit and publish this post
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current co-authors */}
                {coAuthors.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Co-Authors</label>
                        <div className="space-y-2">
                            {coAuthors.map(author => (
                                <div
                                    key={author._id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={author.profilePictureUrl} />
                                            <AvatarFallback>{author.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{author.name}</p>
                                            <p className="text-xs text-muted-foreground">{author.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(author._id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add co-author */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Add Co-Author</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={searching || !searchQuery.trim()}
                        >
                            {searching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search Results</label>
                        <div className="space-y-2">
                            {searchResults.map(user => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profilePictureUrl} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAdd(user._id)}
                                        disabled={adding}
                                    >
                                        <UserPlus className="mr-2 h-3 w-3" />
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
