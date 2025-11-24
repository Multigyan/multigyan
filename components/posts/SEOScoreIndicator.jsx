"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"

export default function SEOScoreIndicator({ formData, wordCount }) {
    // Calculate SEO score based on various factors
    const calculateScore = () => {
        let score = 0
        let maxScore = 100

        // Title length (20 points)
        if (formData.title) {
            const titleLength = formData.title.length
            if (titleLength >= 40 && titleLength <= 70) {
                score += 20
            } else if (titleLength >= 30 && titleLength <= 80) {
                score += 10
            }
        }

        // Content word count (30 points)
        if (wordCount >= 300) {
            score += 30
        } else if (wordCount >= 150) {
            score += 15
        }

        // Featured image (15 points)
        if (formData.featuredImageUrl && formData.featuredImageAlt) {
            score += 15
        } else if (formData.featuredImageUrl) {
            score += 7
        }

        // Excerpt (10 points)
        if (formData.excerpt && formData.excerpt.length >= 120) {
            score += 10
        } else if (formData.excerpt && formData.excerpt.length >= 60) {
            score += 5
        }

        // Category (5 points)
        if (formData.category) {
            score += 5
        }

        // Tags (10 points)
        if (formData.tags && formData.tags.length >= 3) {
            score += 10
        } else if (formData.tags && formData.tags.length >= 1) {
            score += 5
        }

        // SEO Title (5 points)
        if (formData.seoTitle && formData.seoTitle.length >= 50) {
            score += 5
        }

        // SEO Description (5 points)
        if (formData.seoDescription && formData.seoDescription.length >= 120) {
            score += 5
        }

        return Math.round((score / maxScore) * 100)
    }

    const score = calculateScore()

    // Determine color and icon based on score
    const getScoreColor = () => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreIcon = () => {
        if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />
        if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />
        return <XCircle className="h-5 w-5 text-red-600" />
    }

    const getScoreLabel = () => {
        if (score >= 80) return "Excellent"
        if (score >= 60) return "Good"
        if (score >= 40) return "Fair"
        return "Needs Work"
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    {getScoreIcon()}
                    SEO Score
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Score Display */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Overall Score</span>
                        <span className={`text-2xl font-bold ${getScoreColor()}`}>
                            {score}%
                        </span>
                    </div>

                    {/* Score Label */}
                    <div className="text-center">
                        <span className={`text-sm font-medium ${getScoreColor()}`}>
                            {getScoreLabel()}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${score >= 80
                                    ? "bg-green-600"
                                    : score >= 60
                                        ? "bg-yellow-600"
                                        : "bg-red-600"
                                }`}
                            style={{ width: `${score}%` }}
                        />
                    </div>

                    {/* Recommendations */}
                    <div className="text-xs text-muted-foreground space-y-1 mt-3">
                        <p className="font-semibold">Quick Tips:</p>
                        {!formData.title && <p>• Add a title (40-70 chars)</p>}
                        {wordCount < 300 && <p>• Write at least 300 words</p>}
                        {!formData.featuredImageUrl && <p>• Add a featured image</p>}
                        {!formData.featuredImageAlt && formData.featuredImageUrl && (
                            <p>• Add image alt text</p>
                        )}
                        {(!formData.tags || formData.tags.length < 3) && (
                            <p>• Add at least 3 tags</p>
                        )}
                        {!formData.excerpt && <p>• Add an excerpt (120+ chars)</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
