"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    BarChart3,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Hash,
    Type,
    Loader2,
    RefreshCw,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ContentQualityWidget({ postId, content, contentType = 'blog' }) {
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const [autoAnalyze, setAutoAnalyze] = useState(false)

    // Auto-analyze when content changes (debounced)
    useEffect(() => {
        if (!autoAnalyze || !content) return

        const timer = setTimeout(() => {
            analyzeContent()
        }, 2000) // Wait 2 seconds after typing stops

        return () => clearTimeout(timer)
    }, [content, autoAnalyze])

    async function analyzeContent() {
        setLoading(true)
        try {
            const response = await fetch('/api/content/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, content, contentType })
            })

            if (response.ok) {
                const data = await response.json()
                setAnalysis(data.analysis)
            }
        } catch (error) {
            console.error('Analysis error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!expanded) {
        return (
            <Card className="border-2">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(true)}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Content Quality</CardTitle>
                            {analysis && (
                                <Badge variant={
                                    analysis.color === 'green' ? 'default' :
                                        analysis.color === 'yellow' ? 'secondary' : 'destructive'
                                }>
                                    {analysis.score}/100
                                </Badge>
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className={cn(
            "border-2 transition-all",
            analysis?.color === 'green' && "border-green-200 bg-green-50/30 dark:bg-green-950/20",
            analysis?.color === 'yellow' && "border-yellow-200 bg-yellow-50/30 dark:bg-yellow-950/20",
            analysis?.color === 'red' && "border-red-200 bg-red-50/30 dark:bg-red-950/20"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Content Quality</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={analyzeContent}
                            disabled={loading || !content}
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1.5">Analyze</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(false)}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    SEO optimization and content quality metrics
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {!analysis && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Click "Analyze" to check content quality</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                        <p className="text-sm text-muted-foreground">Analyzing content...</p>
                    </div>
                )}

                {analysis && !loading && (
                    <>
                        {/* Overall Score */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Overall Quality</span>
                                <div className="flex items-center gap-2">
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
                            </div>
                            <Progress
                                value={analysis.score}
                                className={cn(
                                    "h-2",
                                    analysis.color === 'green' && "[&>div]:bg-green-600",
                                    analysis.color === 'yellow' && "[&>div]:bg-yellow-600",
                                    analysis.color === 'red' && "[&>div]:bg-red-600"
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                {analysis.score >= 90 ? '🎉 Excellent! Well-optimized for SEO.' :
                                    analysis.score >= 80 ? '✅ Very good! Minor improvements could help.' :
                                        analysis.score >= 70 ? '👍 Good! Follow recommendations below.' :
                                            analysis.score >= 60 ? '⚠️ Fair. Address key issues for better performance.' :
                                                '❌ Needs improvement. Focus on critical issues first.'}
                            </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard
                                icon={<Type className="h-4 w-4" />}
                                label="Word Count"
                                value={analysis.wordCount}
                                target={analysis.target.ideal}
                                status={analysis.metrics.wordCount.status}
                            />
                            <MetricCard
                                icon={<FileText className="h-4 w-4" />}
                                label="Readability"
                                value={analysis.readabilityScore}
                                target={60}
                                status={analysis.metrics.readability.status}
                                suffix="/100"
                            />
                            <MetricCard
                                icon={<Hash className="h-4 w-4" />}
                                label="Headings"
                                value={analysis.headings.total}
                                target={analysis.metrics.headings.target}
                                status={analysis.metrics.headings.status}
                            />
                            <MetricCard
                                icon={<ImageIcon className="h-4 w-4" />}
                                label="Images"
                                value={analysis.images.total}
                                target={analysis.metrics.images.target}
                                status={analysis.metrics.images.status}
                            />
                            <MetricCard
                                icon={<LinkIcon className="h-4 w-4" />}
                                label="Internal Links"
                                value={analysis.links.internalLinks}
                                target={5}
                                status={analysis.metrics.internalLinks.status}
                            />
                            <MetricCard
                                icon={<CheckCircle2 className="h-4 w-4" />}
                                label="External Links"
                                value={analysis.links.externalLinks}
                                target={2}
                                status="good"
                            />
                        </div>

                        {/* Issues */}
                        {analysis.issues.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    Issues ({analysis.issues.length})
                                </h4>
                                <div className="space-y-1.5">
                                    {analysis.issues.map((issue, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2 text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-2"
                                        >
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-red-900 dark:text-red-100">{issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {analysis.recommendations.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    Recommendations ({analysis.recommendations.length})
                                </h4>
                                <div className="space-y-1.5">
                                    {analysis.recommendations.map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-2"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-blue-900 dark:text-blue-100">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

function MetricCard({ icon, label, value, target, status, suffix = '' }) {
    return (
        <div className={cn(
            "p-3 rounded-lg border-2 transition-all",
            status === 'good' && "border-green-200 bg-green-50/50 dark:bg-green-950/30",
            status === 'warning' && "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/30"
        )}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    {icon}
                    <span className="text-xs font-medium">{label}</span>
                </div>
                {status === 'good' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{value}{suffix}</span>
                <span className="text-xs text-muted-foreground">/ {target}</span>
            </div>
        </div>
    )
}
