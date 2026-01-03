"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Search,
    Loader2,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    FileText
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function BulkAnalysisPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState([])
    const [analyses, setAnalyses] = useState([])
    const [stats, setStats] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (session?.user) {
            loadPosts()
        }
    }, [session, status, router])

    async function loadPosts() {
        setLoading(true)
        try {
            // Fetch all user's posts
            const userParam = session.user.role === 'admin' ? '' : `&author=${session.user.id}`
            const response = await fetch(`/api/posts?status=published&limit=1000${userParam}`)

            if (response.ok) {
                const data = await response.json()
                setPosts(data.posts || [])
                analyzeAllPosts(data.posts || [])
            } else {
                toast.error('Failed to load posts')
            }
        } catch (error) {
            console.error('Load error:', error)
            toast.error('Failed to load posts')
        }
    }

    async function analyzeAllPosts(postsToAnalyze) {
        const analyses = []

        for (const post of postsToAnalyze) {
            try {
                const response = await fetch('/api/content/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: post._id })
                })

                if (response.ok) {
                    const data = await response.json()
                    analyses.push({
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

        setAnalyses(analyses)
        calculateStats(analyses)
        setLoading(false)
    }

    function calculateStats(analyses) {
        const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length || 0

        const distribution = {
            excellent: analyses.filter(a => a.score >= 90).length,
            veryGood: analyses.filter(a => a.score >= 80 && a.score < 90).length,
            good: analyses.filter(a => a.score >= 70 && a.score < 80).length,
            fair: analyses.filter(a => a.score >= 60 && a.score < 70).length,
            poor: analyses.filter(a => a.score < 60).length
        }

        setStats({ avgScore: Math.round(avgScore), distribution })
    }

    const filteredAnalyses = analyses.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <h2 className="text-xl font-semibold mb-2">Analyzing All Posts...</h2>
                    <p className="text-muted-foreground">
                        This may take a moment. Analyzing {posts.length} posts.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/posts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BarChart3 className="h-8 w-8" />
                            Content Quality Analysis
                        </h1>
                        <p className="text-muted-foreground">
                            SEO quality scores for all your posts
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
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

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                {filteredAnalyses.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No posts found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredAnalyses
                        .sort((a, b) => a.score - b.score) // Lowest scores first (need most attention)
                        .map((analysis, idx) => (
                            <AnalysisCard key={analysis._id} analysis={analysis} rank={filteredAnalyses.length - idx} />
                        ))
                )}
            </div>
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

function AnalysisCard({ analysis, rank }) {
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
        </Card >
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
