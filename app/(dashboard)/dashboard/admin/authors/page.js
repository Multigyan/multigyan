"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users,
    Plus,
    Trash2,
    Edit,
    Merge,
    BookOpen,
    AlertTriangle,
    Loader2,
    Save,
    X,
    Info,
    Eye,
    Heart,
    ArrowRightLeft,
    Shield,
    User
} from "lucide-react"
import { toast } from "sonner"

export default function AdminAuthorsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [authors, setAuthors] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    const [showMergeDialog, setShowMergeDialog] = useState(false)
    const [selectedAuthors, setSelectedAuthors] = useState([])
    const [primaryAuthorId, setPrimaryAuthorId] = useState("")
    const [mergeDetails, setMergeDetails] = useState({
        name: "",
        username: "",
        email: "",
        bio: "",
        profilePictureUrl: "",
        role: "author"
    })

    const [showReassignDialog, setShowReassignDialog] = useState(false)
    const [reassignFrom, setReassignFrom] = useState("")
    const [reassignTo, setReassignTo] = useState("")

    const [filterRole, setFilterRole] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (status === 'loading') return

        if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
            router.push('/dashboard')
            return
        }

        fetchAuthors()
    }, [status, session, router])

    async function fetchAuthors() {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/authors')
            const data = await response.json()

            if (response.ok) {
                setAuthors(data.authors || [])
            } else {
                toast.error('Failed to load authors')
            }
        } catch (error) {
            toast.error('Failed to load authors')
        } finally {
            setLoading(false)
        }
    }

    async function handleMergeAuthors() {
        if (selectedAuthors.length < 2) {
            toast.error('Select at least 2 authors to merge')
            return
        }

        if (!primaryAuthorId) {
            toast.error('Select a primary author')
            return
        }

        setActionLoading(true)
        try {
            const response = await fetch('/api/admin/authors/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorIds: selectedAuthors,
                    primaryAuthorId,
                    keepDetails: mergeDetails
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(`Merged ${data.authorsDeleted} author(s) successfully!`)
                setShowMergeDialog(false)
                setSelectedAuthors([])
                setPrimaryAuthorId("")
                setMergeDetails({
                    name: "",
                    username: "",
                    email: "",
                    bio: "",
                    profilePictureUrl: "",
                    role: "author"
                })
                fetchAuthors()
            } else {
                toast.error(data.error || 'Failed to merge authors')
            }
        } catch (error) {
            toast.error('Failed to merge authors')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleReassignPosts() {
        if (!reassignFrom || !reassignTo) {
            toast.error('Select both source and target authors')
            return
        }

        setActionLoading(true)
        try {
            const response = await fetch('/api/admin/authors/reassign-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromAuthorId: reassignFrom,
                    toAuthorId: reassignTo,
                    postIds: [] // Empty = all posts
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(`Reassigned ${data.postsReassigned} post(s) successfully!`)
                setShowReassignDialog(false)
                setReassignFrom("")
                setReassignTo("")
                fetchAuthors()
            } else {
                toast.error(data.error || 'Failed to reassign posts')
            }
        } catch (error) {
            toast.error('Failed to reassign posts')
        } finally {
            setActionLoading(false)
        }
    }

    function toggleAuthorSelection(authorId) {
        setSelectedAuthors(prev =>
            prev.includes(authorId)
                ? prev.filter(id => id !== authorId)
                : [...prev, authorId]
        )
    }

    function openMergeDialog() {
        if (selectedAuthors.length < 2) {
            toast.error('Select at least 2 authors to merge')
            return
        }

        // Auto-select author with most posts as primary
        const selectedAuthorData = authors.filter(a => selectedAuthors.includes(a._id))
        const primaryAuthor = selectedAuthorData.reduce((max, author) =>
            author.postCount > max.postCount ? author : max
        )

        setPrimaryAuthorId(primaryAuthor._id)
        setMergeDetails({
            name: primaryAuthor.name,
            username: primaryAuthor.username,
            email: primaryAuthor.email,
            bio: primaryAuthor.bio || "",
            profilePictureUrl: primaryAuthor.profilePictureUrl || "",
            role: primaryAuthor.role
        })
        setShowMergeDialog(true)
    }

    function getTotalPosts() {
        return authors.reduce((sum, author) => sum + (author.postCount || 0), 0)
    }

    function getTotalViews() {
        return authors.reduce((sum, author) => sum + (author.totalViews || 0), 0)
    }

    function getAdminCount() {
        return authors.filter(author => author.role === 'admin').length
    }

    const filteredAuthors = authors.filter(author => {
        const matchesRole = filterRole === 'all' || author.role === filterRole
        const matchesSearch = !searchQuery ||
            author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            author.email.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesRole && matchesSearch
    })

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    if (session?.user?.role !== 'admin') {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Authors Management</h1>
                <p className="text-muted-foreground">
                    Manage authors, merge duplicate accounts, and reassign posts
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Authors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{authors.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Total Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{getTotalPosts()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Total Views
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{getTotalViews().toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admins
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{getAdminCount()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search by name, username, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="md:w-96"
                />

                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="md:w-48">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="author">Authors</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-3 ml-auto">
                    <Button
                        variant="outline"
                        onClick={openMergeDialog}
                        disabled={selectedAuthors.length < 2}
                    >
                        <Merge className="h-4 w-4 mr-2" />
                        Merge ({selectedAuthors.length})
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setShowReassignDialog(true)}
                    >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Reassign Posts
                    </Button>

                    {selectedAuthors.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedAuthors([])}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Authors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuthors.map((author) => (
                    <Card
                        key={author._id}
                        className={`relative ${selectedAuthors.includes(author._id)
                                ? 'ring-2 ring-primary'
                                : ''
                            }`}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={author.profilePictureUrl} alt={author.name} />
                                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">
                                            {author.name}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground truncate">
                                            @{author.username}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant={author.role === 'admin' ? 'default' : 'secondary'}>
                                                {author.role === 'admin' ? (
                                                    <><Shield className="h-3 w-3 mr-1" /> Admin</>
                                                ) : (
                                                    <><User className="h-3 w-3 mr-1" /> Author</>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={selectedAuthors.includes(author._id)}
                                    onChange={() => toggleAuthorSelection(author._id)}
                                    className="w-5 h-5 cursor-pointer"
                                />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        Posts
                                    </span>
                                    <span className="font-semibold">{author.postCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        Views
                                    </span>
                                    <span className="font-semibold">{author.totalViews.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Heart className="h-3 w-3" />
                                        Likes
                                    </span>
                                    <span className="font-semibold">{author.totalLikes}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredAuthors.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Authors Found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || filterRole !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No authors in the system yet'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Merge Dialog */}
            <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Merge Author Accounts</DialogTitle>
                        <DialogDescription>
                            Merge {selectedAuthors.length} authors into one account
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2">Authors to Merge</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedAuthors.map(id => {
                                    const author = authors.find(a => a._id === id)
                                    return author ? (
                                        <Badge key={id} variant="secondary" className="text-sm">
                                            {author.name} ({author.postCount} posts)
                                        </Badge>
                                    ) : null
                                })}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="primary-author">Primary Author (Keep This Account) *</Label>
                            <Select value={primaryAuthorId} onValueChange={(value) => {
                                setPrimaryAuthorId(value)
                                const author = authors.find(a => a._id === value)
                                if (author) {
                                    setMergeDetails({
                                        name: author.name,
                                        username: author.username,
                                        email: author.email,
                                        bio: author.bio || "",
                                        profilePictureUrl: author.profilePictureUrl || "",
                                        role: author.role
                                    })
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select primary author" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedAuthors.map(id => {
                                        const author = authors.find(a => a._id === id)
                                        return author ? (
                                            <SelectItem key={id} value={id}>
                                                {author.name} (@{author.username}) - {author.postCount} posts
                                            </SelectItem>
                                        ) : null
                                    })}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                This account will be kept. Others will be deleted after merging.
                            </p>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Final Author Details</h4>

                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="merge-name">Name *</Label>
                                    <Input
                                        id="merge-name"
                                        value={mergeDetails.name}
                                        onChange={(e) => setMergeDetails(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="merge-username">Username *</Label>
                                    <Input
                                        id="merge-username"
                                        value={mergeDetails.username}
                                        onChange={(e) => setMergeDetails(prev => ({ ...prev, username: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="merge-email">Email *</Label>
                                    <Input
                                        id="merge-email"
                                        type="email"
                                        value={mergeDetails.email}
                                        onChange={(e) => setMergeDetails(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="merge-bio">Bio</Label>
                                    <Textarea
                                        id="merge-bio"
                                        value={mergeDetails.bio}
                                        onChange={(e) => setMergeDetails(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="merge-role">Role</Label>
                                    <Select
                                        value={mergeDetails.role}
                                        onValueChange={(value) => setMergeDetails(prev => ({ ...prev, role: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="author">Author</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                            <p className="text-sm text-amber-800">
                                ⚠️ This action cannot be undone. All posts from merged authors will be reassigned to the primary account.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleMergeAuthors} disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Merging...
                                </>
                            ) : (
                                <>
                                    <Merge className="h-4 w-4 mr-2" />
                                    Merge Authors
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reassign Posts Dialog */}
            <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reassign Posts</DialogTitle>
                        <DialogDescription>
                            Move all posts from one author to another
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="from-author">From Author</Label>
                            <Select value={reassignFrom} onValueChange={setReassignFrom}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source author" />
                                </SelectTrigger>
                                <SelectContent>
                                    {authors.filter(a => a.postCount > 0).map(author => (
                                        <SelectItem key={author._id} value={author._id}>
                                            {author.name} (@{author.username}) - {author.postCount} posts
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="to-author">To Author</Label>
                            <Select value={reassignTo} onValueChange={setReassignTo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target author" />
                                </SelectTrigger>
                                <SelectContent>
                                    {authors.filter(a => a._id !== reassignFrom).map(author => (
                                        <SelectItem key={author._id} value={author._id}>
                                            {author.name} (@{author.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-sm text-blue-800">
                                ℹ️ All posts from the source author will be reassigned to the target author.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReassignDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReassignPosts} disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Reassigning...
                                </>
                            ) : (
                                <>
                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                    Reassign Posts
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
