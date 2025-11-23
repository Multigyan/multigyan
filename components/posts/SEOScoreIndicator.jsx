"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react"

/**
 * Calculate SEO score based on multiple factors
 * @param {object} formData - Post form data
 * @param {number} wordCount - Content word count
 * @returns {object} Score and checklist items
 */
function calculateSEOScore(formData, wordCount) {
    const checks = []
    let score = 0
    const maxScore = 100

    // 1. Title Length (20 points)
    const titleLength = formData.title?.length || 0
    if (titleLength >= 40 && titleLength <= 70) {
        checks.push({ label: 'Title length optimal (40-70 chars)', status: 'pass', points: 20 })
        score += 20
    } else if (titleLength >= 30 && titleLength < 100) {
        checks.push({ label: `Title length: ${titleLength} chars (aim for 40-70)`, status: 'warning', points: 10 })
        score += 10
    } else {
        checks.push({ label: `Title too ${titleLength < 30 ? 'short' : 'long'} (${titleLength} chars)`, status: 'fail', points: 0 })
    }

    // 2. Meta Description (15 points)
    const descLength = formData.seoDescription?.length || 0
    if (descLength >= 120 && descLength <= 160) {
        checks.push({ label: 'Meta description optimal (120-160 chars)', status: 'pass', points: 15 })
        score += 15
    } else if (descLength >= 100 && descLength < 200) {
        checks.push({ label: `Meta description: ${descLength} chars (aim for 120-160)`, status: 'warning', points: 8 })
        score += 8
    } else if (descLength > 0) {
        checks.push({ label: `Meta description ${descLength < 100 ? 'too short' : 'too long'}`, status: 'fail', points: 0 })
    } else {
        checks.push({ label: 'Meta description missing', status: 'fail', points: 0 })
    }

    // 3. Content Length (25 points)
    if (wordCount >= 1000) {
        checks.push({ label: `Excellent content length (${wordCount} words)`, status: 'pass', points: 25 })
        score += 25
    } else if (wordCount >= 600) {
        checks.push({ label: `Good content length (${wordCount} words)`, status: 'pass', points: 20 })
        score += 20
    } else if (wordCount >= 300) {
        checks.push({ label: `Adequate content (${wordCount} words, aim for 600+)`, status: 'warning', points: 12 })
        score += 12
    } else if (wordCount > 0) {
        checks.push({ label: `Content too short (${wordCount} words, need 300+)`, status: 'fail', points: 0 })
    } else {
        checks.push({ label: 'No content yet', status: 'fail', points: 0 })
    }

    // 4. Featured Image (10 points)
    if (formData.featuredImageUrl) {
        checks.push({ label: 'Featured image added', status: 'pass', points: 10 })
        score += 10
    } else {
        checks.push({ label: 'Featured image missing', status: 'fail', points: 0 })
    }

    // 5. Category Selected (10 points)
    if (formData.category) {
        checks.push({ label: 'Category selected', status: 'pass', points: 10 })
        score += 10
    } else {
        checks.push({ label: 'Category not selected', status: 'fail', points: 0 })
    }

    // 6. Tags (10 points)
    const tagCount = formData.tags?.length || 0
    if (tagCount >= 3 && tagCount <= 5) {
        checks.push({ label: `Optimal tags (${tagCount})`, status: 'pass', points: 10 })
        score += 10
    } else if (tagCount >= 1 && tagCount < 8) {
        checks.push({ label: `${tagCount} tags (aim for 3-5)`, status: 'warning', points: 5 })
        score += 5
    } else {
        checks.push({ label: 'Tags missing', status: 'fail', points: 0 })
    }

    // 7. Excerpt (10 points)
    const excerptLength = formData.excerpt?.length || 0
    if (excerptLength >= 100 && excerptLength <= 200) {
        checks.push({ label: 'Excerpt length optimal', status: 'pass', points: 10 })
        score += 10
    } else if (excerptLength > 0) {
        checks.push({ label: `Excerpt ${excerptLength < 100 ? 'too short' : 'too long'}`, status: 'warning', points: 5 })
        score += 5
    } else {
        checks.push({ label: 'Excerpt missing', status: 'fail', points: 0 })
    }

    return {
        score: Math.round(score),
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        checks,
        grade: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work'
    }
}

/**
 * SEO Score Indicator Component
 * 
 * Displays real-time SEO score with checklist
 * 
 * @param {object} formData - Post form data
 * @param {number} wordCount - Content word count
 */
export default function SEOScoreIndicator({ formData, wordCount }) {
    const seoData = useMemo(() =>
        calculateSEOScore(formData, wordCount),
        [formData.title, formData.seoDescription, formData.excerpt, formData.featuredImageUrl,
        formData.category, formData.tags, wordCount]
    )

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600'
        if (percentage >= 60) return 'text-yellow-600'
        if (percentage >= 40) return 'text-orange-600'
        return 'text-red-600'
    }

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-600'
        if (percentage >= 60) return 'bg-yellow-600'
        if (percentage >= 40) return 'bg-orange-600'
        return 'bg-red-600'
    }

    const getBadgeVariant = (percentage) => {
        if (percentage >= 80) return 'default'
        if (percentage >= 60) return 'secondary'
        return 'destructive'
    }

    return (
        <Card className={`border-2 ${seoData.percentage >= 80 ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' :
            seoData.percentage >= 60 ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20' :
                seoData.percentage >= 40 ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20' :
                    'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
            }`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        SEO Score
                    </div>
                    <Badge variant={getBadgeVariant(seoData.percentage)} className="text-lg px-3 py-1">
                        {seoData.percentage}/100
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{seoData.grade}</span>
                        <span className={`font-bold ${getScoreColor(seoData.percentage)}`}>
                            {seoData.score}/{seoData.maxScore} points
                        </span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${getProgressColor(seoData.percentage)}`}
                            style={{ width: `${seoData.percentage}%` }}
                        />
                    </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Checklist</p>
                    {seoData.checks.map((check, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                            {check.status === 'pass' && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            )}
                            {check.status === 'warning' && (
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            )}
                            {check.status === 'fail' && (
                                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={
                                check.status === 'pass' ? 'text-green-700 dark:text-green-400' :
                                    check.status === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                                        'text-red-700 dark:text-red-400'
                            }>
                                {check.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Tips */}
                {seoData.percentage < 80 && (
                    <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">💡 Quick Tips</p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                            {seoData.percentage < 40 && (
                                <li>• Focus on adding quality content (600+ words)</li>
                            )}
                            {!formData.featuredImageUrl && (
                                <li>• Add a featured image for better engagement</li>
                            )}
                            {(!formData.seoDescription || formData.seoDescription.length < 120) && (
                                <li>• Write a compelling meta description (120-160 chars)</li>
                            )}
                            {(formData.tags?.length || 0) < 3 && (
                                <li>• Add 3-5 relevant tags for better discoverability</li>
                            )}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
