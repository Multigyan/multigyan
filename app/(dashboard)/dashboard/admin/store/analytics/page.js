"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    TrendingUp,
    Package,
    MousePointerClick,
    Star,
    Calendar,
    BarChart3
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function StoreAnalyticsPage() {
    const [analytics, setAnalytics] = useState({
        totalProducts: 0,
        totalClicks: 0,
        avgClicksPerProduct: 0,
        topProducts: [],
        recentClicks: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/store/products?limit=100')
            const data = await response.json()
            const products = data.products || []

            const totalClicks = products.reduce((sum, p) => sum + (p.clickCount || 0), 0)
            const topProducts = [...products]
                .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                .slice(0, 10)

            setAnalytics({
                totalProducts: products.length,
                totalClicks,
                avgClicksPerProduct: products.length > 0 ? (totalClicks / products.length).toFixed(1) : 0,
                topProducts,
                recentClicks: products
                    .filter(p => p.lastClickedAt)
                    .sort((a, b) => new Date(b.lastClickedAt) - new Date(a.lastClickedAt))
                    .slice(0, 10)
            })
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="px-6 py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Store Analytics</h1>
                <p className="text-muted-foreground mt-2">
                    Track your affiliate store performance
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Active products in store
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Affiliate link clicks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Clicks/Product</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.avgClicksPerProduct}</div>
                        <p className="text-xs text-muted-foreground">
                            Average performance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>Products with the most affiliate clicks</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Clicks</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>CTR</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading analytics...
                                    </TableCell>
                                </TableRow>
                            ) : analytics.topProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No data available yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analytics.topProducts.map((product, index) => {
                                    const ctr = product.viewCount > 0
                                        ? ((product.clickCount / product.viewCount) * 100).toFixed(1)
                                        : 0

                                    return (
                                        <TableRow key={product._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {index < 3 && (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                    <span className="font-medium">#{index + 1}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium line-clamp-1 max-w-xs">
                                                    {product.title}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {product.brand?.name && (
                                                    <Badge style={{ backgroundColor: product.brand.color }}>
                                                        {product.brand.name}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-medium">{product.clickCount || 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                    <span>{product.viewCount || 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={ctr > 5 ? "default" : "secondary"}>
                                                    {ctr}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/store/${product.slug}`}
                                                    target="_blank"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest affiliate link clicks</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Last Clicked</TableHead>
                                <TableHead>Total Clicks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.recentClicks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        No recent activity
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analytics.recentClicks.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell className="font-medium line-clamp-1 max-w-xs">
                                            {product.title}
                                        </TableCell>
                                        <TableCell>
                                            {product.brand?.name && (
                                                <Badge style={{ backgroundColor: product.brand.color }}>
                                                    {product.brand.name}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(product.lastClickedAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{product.clickCount || 0}</span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
