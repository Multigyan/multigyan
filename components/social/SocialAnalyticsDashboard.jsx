"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
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
    Heart,
    MessageSquare,
    Share2,
    Eye,
    Twitter,
    Facebook,
    Linkedin,
    Instagram,
    Loader2,
    RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * SocialAnalyticsDashboard Component
 * 
 * Display social media performance across all platforms
 * Track engagement, reach, and ROI
 */

export default function SocialAnalyticsDashboard({ postId }) {
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (postId) {
            fetchAnalytics()
        }
    }, [postId])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/posts/${postId}/social-post`)
            const data = await response.json()

            if (response.ok) {
                setAnalytics(data.analytics)
            } else if (data.message) {
                // No analytics yet
                setAnalytics(null)
            } else {
                toast.error('Failed to load social analytics')
            }
        } catch (error) {
            console.error('Fetch analytics error:', error)
            toast.error('Failed to load social analytics')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchAnalytics()
        setRefreshing(false)
        toast.success('Analytics refreshed!')
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (!analytics) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Social Media Analytics</CardTitle>
                    <CardDescription>No social media data available yet</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Post this content to social media to start tracking analytics.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const { platforms, totalShares, totalLikes, totalComments, totalReach, avgEngagementRate } = analytics

    // Prepare chart data
    const platformData = [
        { name: 'Twitter', likes: platforms.twitter?.likes || 0, shares: platforms.twitter?.retweets || 0, comments: platforms.twitter?.replies || 0 },
        { name: 'Facebook', likes: platforms.facebook?.likes || 0, shares: platforms.facebook?.shares || 0, comments: platforms.facebook?.comments || 0 },
        { name: 'LinkedIn', likes: platforms.linkedin?.likes || 0, shares: platforms.linkedin?.shares || 0, comments: platforms.linkedin?.comments || 0 },
        { name: 'Instagram', likes: platforms.instagram?.likes || 0, shares: 0, comments: platforms.instagram?.comments || 0 }
    ]

    const engagementData = platformData.map(p => ({
        name: p.name,
        engagement: p.likes + p.shares + p.comments
    }))

    const COLORS = ['#1DA1F2', '#4267B2', '#0077B5', '#E4405F']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Social Media Analytics</h2>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReach.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Impressions across platforms</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(totalLikes + totalShares + totalComments).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {avgEngagementRate.toFixed(2)}% engagement rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all platforms</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Retweets + Shares</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="engagement" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                    <TabsTrigger value="platforms">Platforms</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                </TabsList>

                <TabsContent value="engagement">
                    <Card>
                        <CardHeader>
                            <CardTitle>Engagement by Platform</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={platformData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="likes" fill="#ec4899" name="Likes" />
                                    <Bar dataKey="shares" fill="#8b5cf6" name="Shares" />
                                    <Bar dataKey="comments" fill="#f59e0b" name="Comments" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="platforms">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Engagement Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={engagementData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="engagement"
                                    >
                                        {engagementData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="breakdown">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Twitter */}
                        {platforms.twitter?.postedAt && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                                        Twitter
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Likes:</span>
                                        <span className="font-semibold">{platforms.twitter.likes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Retweets:</span>
                                        <span className="font-semibold">{platforms.twitter.retweets}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Replies:</span>
                                        <span className="font-semibold">{platforms.twitter.replies}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Impressions:</span>
                                        <span className="font-semibold">{platforms.twitter.impressions}</span>
                                    </div>
                                    {platforms.twitter.postUrl && (
                                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                            <a href={platforms.twitter.postUrl} target="_blank" rel="noopener noreferrer">
                                                View Post
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Facebook */}
                        {platforms.facebook?.postedAt && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Facebook className="h-5 w-5 text-[#4267B2]" />
                                        Facebook
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Likes:</span>
                                        <span className="font-semibold">{platforms.facebook.likes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Shares:</span>
                                        <span className="font-semibold">{platforms.facebook.shares}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Comments:</span>
                                        <span className="font-semibold">{platforms.facebook.comments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Reach:</span>
                                        <span className="font-semibold">{platforms.facebook.reach}</span>
                                    </div>
                                    {platforms.facebook.postUrl && (
                                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                            <a href={platforms.facebook.postUrl} target="_blank" rel="noopener noreferrer">
                                                View Post
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* LinkedIn */}
                        {platforms.linkedin?.postedAt && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Linkedin className="h-5 w-5 text-[#0077B5]" />
                                        LinkedIn
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Likes:</span>
                                        <span className="font-semibold">{platforms.linkedin.likes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Shares:</span>
                                        <span className="font-semibold">{platforms.linkedin.shares}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Comments:</span>
                                        <span className="font-semibold">{platforms.linkedin.comments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Impressions:</span>
                                        <span className="font-semibold">{platforms.linkedin.impressions}</span>
                                    </div>
                                    {platforms.linkedin.postUrl && (
                                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                            <a href={platforms.linkedin.postUrl} target="_blank" rel="noopener noreferrer">
                                                View Post
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Instagram */}
                        {platforms.instagram?.postedAt && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Instagram className="h-5 w-5 text-[#E4405F]" />
                                        Instagram
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Likes:</span>
                                        <span className="font-semibold">{platforms.instagram.likes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Comments:</span>
                                        <span className="font-semibold">{platforms.instagram.comments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Saves:</span>
                                        <span className="font-semibold">{platforms.instagram.saves}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Reach:</span>
                                        <span className="font-semibold">{platforms.instagram.reach}</span>
                                    </div>
                                    {platforms.instagram.postUrl && (
                                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                            <a href={platforms.instagram.postUrl} target="_blank" rel="noopener noreferrer">
                                                View Post
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
