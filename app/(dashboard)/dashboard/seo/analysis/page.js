"use client"

import { useState, useEffect, useCallback } from "react"


import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowLeft,
    BarChart3,
    TrendingUp,
    Search,
    Loader2,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    FileText,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const POSTS_PER_PAGE = 20
const CACHE_KEY = 'seo-analysis-cache'
const CACHE_EXPIRY = 1000 * 60 * 60 * 24 // 24 hours

export default function BulkAnalysisPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [analyzing, setAnalyzing] = useState(false)
    const [loadingPosts, setLoadingPosts] = useState(true)
    const [posts, setPosts] = useState([])
    const [allPosts, setAllPosts] = useState([])
    const [authors, setAuthors] = useState([])
    const [selectedAuthor, setSelectedAuthor] = useState('all')
    const [analyses, setAnalyses] = useState([])
    const [stats, setStats] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [lastAnalyzed, setLastAnalyzed] = useState(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (session?.user) {
            loadPosts()
            loadCachedAnalyses()
        }
    }, [session, status, router])

    // Set page title
    useEffect(() => {
        document.title = "SEO Analysis | Multigyan"
    }, [])

    const loadCachedAnalyses = useCallback(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) {
                const { data, timestamp } = JSON.parse(cached)
                const age = Date.now() - timestamp

                if (age < CACHE_EXPIRY) {
                    setAnalyses(data.analyses || [])
                    setStats(data.stats || null)
                    setLastAnalyzed(new Date(timestamp))
                    toast.success('Loaded cached analysis results', {
                        description: `Last analyzed ${formatTimeAgo(timestamp)}`
                    })
                } else {
                    // Cache expired
                    localStorage.removeItem(CACHE_KEY)
                }
            }
        } catch (error) {
            console.error('Failed to load cache:', error)
        }
    }, [])

    function saveCachedAnalyses(analysesData, statsData) {
        try {
            const cacheData = {
                data: {
                    analyses: analysesData,
                    stats: statsData
                },
                timestamp: Date.now()
            }
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
            setLastAnalyzed(new Date())
        } catch (error) {
            console.error('Failed to save cache:', error)
        }
    }

    const loadPosts = useCallback(async () => {
        if (!session?.user) return

        setLoadingPosts(true)
        try {
            const userParam = session.user.role === 'admin' ? '' : `&author=${session.user.id}`
            const response = await fetch(`/api/posts?status=published&limit=1000${userParam}`)

            if (response.ok) {
                const data = await response.json()
                const loadedPosts = data.posts || []
                setAllPosts(loadedPosts)
                setPosts(loadedPosts)

                // Extract unique authors for admin
                if (session.user.role === 'admin') {
                    const uniqueAuthors = [...new Map(
                        loadedPosts
                            .filter(p => p.author)
                            .map(p => [p.author._id, p.author])
                    ).values()]
                    setAuthors(uniqueAuthors)
                }
            } else {
                toast.error('Failed to load posts')
            }
        } catch (error) {
            console.error('Load error:', error)
            toast.error('Failed to load posts')
        } finally {
            setLoadingPosts(false)
        }
    }, [session])

    async function analyzeAllPosts() {
        if (posts.length === 0) {
            toast.error('No posts to analyze')
            return
        }

        setAnalyzing(true)
        const newAnalyses = []

        try {
            toast.info(`Starting analysis of ${posts.length} posts...`, {
                description: 'This may take a few moments'
            })

            for (const post of posts) {
                try {
                    const response = await fetch('/api/content/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId: post._id })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        newAnalyses.push({
                            _id: post._id,
                            title: post.title,
                            slug: post.slug,
                            ...data.analysis
                        })
                    }
                } catch (error) {
                    console.error(`Analysis failed for ${post._id}:`, error)
                }
            }

            setAnalyses(newAnalyses)
            const newStats = calculateStats(newAnalyses)
            setStats(newStats)

            // Save to cache
            saveCachedAnalyses(newAnalyses, newStats)

            toast.success(`Analysis complete! Analyzed ${newAnalyses.length} posts`, {
                description: 'Results cached for 24 hours'
            })
        } catch (error) {
            console.error('Analysis error:', error)
            toast.error('Analysis failed')
        } finally {
            setAnalyzing(false)
        }
    }

    function calculateStats(analysesData) {
        if (analysesData.length === 0) return null

        const avgScore = analysesData.reduce((sum, a) => sum + a.score, 0) / analysesData.length || 0

        const distribution = {
            excellent: analysesData.filter(a => a.score >= 90).length,
            veryGood: analysesData.filter(a => a.score >= 80 && a.score < 90).length,
            good: analysesData.filter(a => a.score >= 70 && a.score < 80).length,
            fair: analysesData.filter(a => a.score >= 60 && a.score < 70).length,
            poor: analysesData.filter(a => a.score < 60).length
        }

        return { avgScore: Math.round(avgScore), distribution }
    }

    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000)
        if (seconds < 60) return 'just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        const days = Math.floor(hours / 24)
        return `${days} day${days > 1 ? 's' : ''} ago`
    }

    // Filter posts by selected author
    useEffect(() => {
        if (selectedAuthor === 'all') {
            setPosts(allPosts)
        } else {
            setPosts(allPosts.filter(p => p.author?._id === selectedAuthor))
        }
        // Clear analyses when changing author filter
        setAnalyses([])
        setStats(null)
    }, [selectedAuthor, allPosts])

    // Filter and paginate
    const filteredAnalyses = analyses.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedAnalyses = [...filteredAnalyses].sort((a, b) => a.score - b.score)

    const totalPages = Math.ceil(sortedAnalyses.length / POSTS_PER_PAGE)
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE
    const endIndex = startIndex + POSTS_PER_PAGE
    const paginatedAnalyses = sortedAnalyses.slice(startIndex, endIndex)

    if (loadingPosts) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <h2 className="text-xl font-semibold mb-2">Loading Posts...</h2>
                    <p className="text-muted-foreground">Fetching your content</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/posts">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <BarChart3 className="h-8 w-8" />
                                SEO Quality Analysis
                            </h1>
                            <p className="text-muted-foreground">
                                {posts.length} posts available for analysis
                                {selectedAuthor !== 'all' && authors.length > 0 && (
                                    <span className="ml-2">
                                        by {authors.find(a => a._id === selectedAuthor)?.name || 'Unknown'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={analyzeAllPosts}
                        disabled={analyzing || posts.length === 0}
                        className="gap-2"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing... ({analyses.length}/{posts.length})
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                {analyses.length > 0 ? 'Refresh Analysis' : 'Start Analysis'}
                            </>
                        )}
                    </Button>
                </div>

                {/* Admin Author Filter */}
                {session?.user?.role === 'admin' && authors.length > 0 && (
                    <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium whitespace-nowrap">
                                    Filter by Author:
                                </label>
                                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                                    <SelectTrigger className="w-[300px] bg-white dark:bg-gray-900">
                                        <SelectValue placeholder="Select author" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <div className="flex items-center justify-between gap-4 w-full">
                                                <span className="font-medium">All Authors</span>
                                                <Badge variant="secondary">{allPosts.length} posts</Badge>
                                            </div>
                                        </SelectItem>
                                        {authors.map((author) => {
                                            const authorPostCount = allPosts.filter(p => p.author?._id === author._id).length
                                            return (
                                                <SelectItem key={author._id} value={author._id}>
                                                    <div className="flex items-center justify-between gap-4 w-full">
                                                        <span>{author.name}</span>
                                                        <Badge variant="outline">{authorPostCount} posts</Badge>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Last Analyzed Info */}
            {lastAnalyzed && !analyzing && (
                <Card className="mb-6 border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
                    <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Last analyzed: {formatTimeAgo(lastAnalyzed.getTime())}</span>
                            <span className="text-muted-foreground">
                                ({lastAnalyzed.toLocaleString()})
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Cache expires in {Math.ceil((CACHE_EXPIRY - (Date.now() - lastAnalyzed.getTime())) / (1000 * 60 * 60))} hours
                        </span>
                    </CardContent>
                </Card>
            )}

            {/* No Analysis State */}
            {analyses.length === 0 && !analyzing && (
                <Card className="border-2 border-dashed">
                    <CardContent className="text-center py-20">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-2xl font-semibold mb-2">No Analysis Data</h2>
                        <p className="text-muted-foreground mb-6">
                            Click &quot;Start Analysis&quot; to analyze all {posts.length} posts and get quality scores
                        </p>
                        <Button onClick={analyzeAllPosts} size="lg" className="gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Start Analysis Now
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Stats Overview */}
            {stats && !analyzing && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Average Quality Score</CardDescription>
                            <CardTitle className="text-4xl">{stats.avgScore}<span className="text-2xl text-muted-foreground">/100</span></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={stats.avgScore} className="h-2" />
                        </CardContent>
                    </Card>

                    <StatsCard
                        title="Excellent (90+)"
                        count={stats.distribution.excellent}
                        total={analyses.length}
                        color="green"
                        icon={<TrendingUp />}
                    />

                    <StatsCard
                        title="Good (70-89)"
                        count={stats.distribution.veryGood + stats.distribution.good}
                        total={analyses.length}
                        color="blue"
                        icon={<CheckCircle2 />}
                    />

                    <StatsCard
                        title="Needs Work (<70)"
                        count={stats.distribution.fair + stats.distribution.poor}
                        total={analyses.length}
                        color="red"
                        icon={<AlertTriangle />}
                    />
                </div>
            )}

            {/* Search and Pagination Info */}
            {analyses.length > 0 && !analyzing && (
                <>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search posts..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1) // Reset to first page on search
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredAnalyses.length)} of {filteredAnalyses.length} posts
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4 mb-6">
                        {paginatedAnalyses.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">No posts found matching &quot;{searchTerm}&quot;</p>
                                </CardContent>
                            </Card>
                        ) : (
                            paginatedAnalyses.map((analysis) => (
                                <AnalysisCard key={analysis._id} analysis={analysis} />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Card>
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="gap-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="gap-2"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

function StatsCard({ title, count, total, color, icon }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0

    return (
        <Card className={cn(
            "border-2",
            color === 'green' && "border-green-200 bg-green-50/30 dark:bg-green-950/20",
            color === 'blue' && "border-blue-200 bg-blue-50/30 dark:bg-blue-950/20",
            color === 'red' && "border-red-200 bg-red-50/30 dark:bg-red-950/20"
        )}>
            <CardHeader className="pb-3">
                <CardDescription>{title}</CardDescription>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-4xl">{count}</CardTitle>
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        color === 'green' && "bg-green-100 text-green-600",
                        color === 'blue' && "bg-blue-100 text-blue-600",
                        color === 'red' && "bg-red-100 text-red-600"
                    )}>
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground">
                    {percentage}% of all posts
                </div>
            </CardContent>
        </Card>
    )
}

function AnalysisCard({ analysis }) {
    return (
        <Card className={cn(
            "border-2",
            analysis.color === 'green' && "border-green-200 hover:border-green-300",
            analysis.color === 'yellow' && "border-yellow-200 hover:border-yellow-300",
            analysis.color === 'red' && "border-red-200 hover:border-red-300"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                                analysis.color === 'green' ? 'default' :
                                    analysis.color === 'yellow' ? 'secondary' : 'destructive'
                            } className="text-base px-3 py-1">
                                {analysis.score}/100
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">
                                {analysis.grade}
                            </span>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{analysis.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/posts/${analysis._id}/edit`}>
                                Edit
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`/blog/${analysis.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <MetricBadge label="Words" value={analysis.wordCount} target={analysis.target?.ideal} />
                    <MetricBadge label="Readability" value={analysis.readabilityScore} target={60} suffix="/100" />
                    <MetricBadge label="Headings" value={analysis.headings?.total} target={5} />
                    <MetricBadge label="Links" value={analysis.links?.internalLinks} target={3} />
                </div>

                {analysis.issues?.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                            Top Issues:
                        </p>
                        <div className="space-y-1">
                            {analysis.issues.slice(0, 3).map((issue, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-red-600">•</span>
                                    <span className="line-clamp-1">{issue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function MetricBadge({ label, value, target, suffix = '' }) {
    const isGood = value >= target
    return (
        <div className={cn(
            "p-2 rounded-md border text-center",
            isGood ? "bg-green-50 border-green-200 dark:bg-green-950/30" : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30"
        )}>
            <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
            <div className="text-sm font-bold">
                {value}{suffix}
                <span className="text-xs font-normal text-muted-foreground"> / {target}</span>
            </div>
        </div>
    )
}
