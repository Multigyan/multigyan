"use client"

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Categories Widget for Sidebar
 * Displays categories with post counts
 */
export default function CategoriesWidget({
    contentType = null, // 'diy', 'recipe', or null for all
    limit = 8
}) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [contentType])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const url = contentType
                ? `/api/categories?contentType=${contentType}`
                : '/api/categories'

            const response = await fetch(url)
            const data = await response.json()

            if (response.ok) {
                setCategories(data.categories || [])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (categories.length === 0) return null

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Categories
                </CardTitle>
                <CardDescription>
                    Browse by topic
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {categories.slice(0, limit).map((category) => (
                        <Link
                            key={category._id}
                            href={`/category/${category.slug}`}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                                    style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                    {category.name}
                                </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {category.postCount || 0}
                            </Badge>
                        </Link>
                    ))}

                    {categories.length > limit && (
                        <Link
                            href="/categories"
                            className="flex items-center justify-center p-2 text-sm text-primary hover:text-primary/80 hover:bg-accent rounded-md transition-all font-medium"
                        >
                            View All Categories
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
