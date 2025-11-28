"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Users, Loader2 } from 'lucide-react'

export default function FollowersList({ authorId, isOpen, onClose }) {
    const [followers, setFollowers] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if (isOpen && authorId) {
            fetchFollowers()
        }
    }, [isOpen, authorId, page])

    const fetchFollowers = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/author/${authorId}/followers?page=${page}&limit=10`)
            const data = await res.json()

            if (data.success) {
                setFollowers(data.followers)
                setTotal(data.total)
                setHasMore(data.hasMore)
            }
        } catch (error) {
            console.error('Error fetching followers:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Users className="h-6 w-6 text-blue-600" />
                        Followers
                        <span className="text-sm text-muted-foreground font-normal">({total})</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : followers.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground">No followers yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {followers.map((follower, index) => (
                                <Link
                                    key={follower._id}
                                    href={`/author/${follower.username}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 group animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800 group-hover:scale-110 transition-transform">
                                        <AvatarImage src={follower.profilePictureUrl} alt={follower.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {follower.name?.charAt(0) || <User className="h-5 w-5" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {follower.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            @{follower.username}
                                        </p>
                                    </div>

                                    <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        View →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && total > 10 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {Math.ceil(total / 10)}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasMore}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>

            <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </Dialog>
    )
}
