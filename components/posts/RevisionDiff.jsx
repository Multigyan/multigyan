"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, RotateCcw } from "lucide-react"

/**
 * Revision Diff Component
 * 
 * Shows side-by-side comparison of two versions
 * 
 * @param {object} oldData - Previous version data
 * @param {object} newData - Current version data
 * @param {function} onRestore - Restore callback
 */
export default function RevisionDiff({ oldData, newData, onRestore }) {
    const fields = [
        { key: 'title', label: 'Title' },
        { key: 'excerpt', label: 'Excerpt' },
        { key: 'content', label: 'Content' },
        { key: 'category', label: 'Category' },
        { key: 'tags', label: 'Tags', isArray: true },
        { key: 'seoTitle', label: 'SEO Title' },
        { key: 'seoDescription', label: 'SEO Description' }
    ]

    const hasChanged = (field) => {
        const oldValue = oldData[field.key]
        const newValue = newData[field.key]

        if (field.isArray) {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue)
        }

        return oldValue !== newValue
    }

    const formatValue = (value, field) => {
        if (!value) return <span className="text-muted-foreground italic">Empty</span>

        if (field.isArray) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((item, i) => (
                        <Badge key={i} variant="secondary">{item}</Badge>
                    ))}
                </div>
            )
        }

        if (field.key === 'content') {
            // Show truncated HTML content
            const text = value.replace(/<[^>]*>/g, '').substring(0, 200)
            return (
                <div className="text-sm">
                    {text}...
                    <span className="text-xs text-muted-foreground ml-2">
                        ({value.length} chars)
                    </span>
                </div>
            )
        }

        return <div className="text-sm">{value}</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <Badge variant="outline">Previous Version</Badge>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                        <Badge variant="default">Current Version</Badge>
                    </div>
                </div>
                <Button onClick={onRestore} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore Previous
                </Button>
            </div>

            {/* Field Comparisons */}
            <div className="space-y-4">
                {fields.map((field) => {
                    const changed = hasChanged(field)

                    return (
                        <Card
                            key={field.key}
                            className={`p-4 ${changed ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Field Label */}
                                <div className="w-32 flex-shrink-0">
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        {field.label}
                                        {changed && (
                                            <Badge variant="destructive" className="text-xs">
                                                Changed
                                            </Badge>
                                        )}
                                    </p>
                                </div>

                                {/* Old Value */}
                                <div className="flex-1 min-w-0">
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                        {formatValue(oldData[field.key], field)}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 pt-3">
                                    <ArrowRight className={`h-4 w-4 ${changed ? 'text-orange-600' : 'text-muted-foreground'}`} />
                                </div>

                                {/* New Value */}
                                <div className="flex-1 min-w-0">
                                    <div className={`p-3 rounded-lg border ${changed
                                            ? 'bg-green-50 dark:bg-green-950/20 border-green-500/50'
                                            : 'bg-muted/50'
                                        }`}>
                                        {formatValue(newData[field.key], field)}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Summary */}
            <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50">
                <p className="text-sm font-medium mb-2">Summary</p>
                <p className="text-sm text-muted-foreground">
                    {fields.filter(hasChanged).length} field(s) changed
                </p>
            </Card>
        </div>
    )
}
