"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import {
    TrendingUp,
    Eye,
    Heart,
    MessageSquare,
    Share2,
    Clock,
    Smartphone,
    Monitor,
    Tablet,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

/**
 * AnalyticsDashboard Component
 * 
 * Comprehensive analytics dashboard for posts
 * Shows views, engagement, traffic sources, and trends
 */

export default function AnalyticsDashboard({ postId }) {
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState(null)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        if (postId) {
            fetchAnalytics()
        }
    }, [postId, period])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/posts/${postId}/analytics?days=${period}`)
            const data = await response.json()

            if (response.ok) {
                setAnalytics(data.analytics)
            } else {
                toast.error('Failed to load analytics')
            }
        } catch (error) {
            console.error('Fetch analytics error:', error)
            toast.error('Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No analytics data available</p>
                </CardContent>
            </Card>
        )
    }

    // Prepare chart data
    const dailyData = analytics.dailyData?.map(day => ({
        date: format(new Date(day.date), 'MMM dd'),
        views: day.views.total,
        likes: day.likes,
        comments: day.comments
    })) || []

    const sourceData = Object.entries(analytics.sources).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }))

    const deviceData = Object.entries(analytics.devices).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }))

    const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

    return (
        <div className="space-y-6">
            {/* Header with period selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analytics</h2>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.uniqueViews.toLocaleString()} unique
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Likes</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((analytics.totalLikes / analytics.totalViews) * 100).toFixed(1)}% engagement
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Comments</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalComments.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((analytics.totalComments / analytics.totalViews) * 100).toFixed(1)}% rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.floor(analytics.avgReadTime / 60)}:{(analytics.avgReadTime % 60).toString().padStart(2, '0')}
                        </div>
                        <p className="text-xs text-muted-foreground">minutes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                </TabsList>

                <TabsContent value="trends" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Over Time</CardTitle>
                            <CardDescription>Views, likes, and comments trend</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} />
                                    <Line type="monotone" dataKey="comments" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sources" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Traffic Sources</CardTitle>
                                <CardDescription>Where your visitors come from</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={sourceData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {sourceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Source Breakdown</CardTitle>
                                <CardDescription>Detailed traffic sources</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {sourceData.map((source, index) => (
                                        <div key={source.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="text-sm font-medium">{source.name}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {source.value.toLocaleString()} ({((source.value / analytics.totalViews) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="devices" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Device Breakdown</CardTitle>
                            <CardDescription>How users access your content</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={deviceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
