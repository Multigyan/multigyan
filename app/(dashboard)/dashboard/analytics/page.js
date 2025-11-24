"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TopPosts from '@/components/analytics/TopPosts'
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react'

/**
 * Analytics Dashboard Page
 * 
 * Shows overall site analytics and top performing posts
 */

export default function AnalyticsDashboardPage() {
    const [period, setPeriod] = useState('30')

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Track your content performance and engagement metrics
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="top-posts">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Top Posts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Coming Soon</div>
                                <p className="text-xs text-muted-foreground">
                                    Overall site analytics
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Coming Soon</div>
                                <p className="text-xs text-muted-foreground">
                                    Likes, comments, shares
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Coming Soon</div>
                                <p className="text-xs text-muted-foreground">
                                    Best performing category
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Coming Soon</div>
                                <p className="text-xs text-muted-foreground">
                                    Average reading time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics Coming Soon</CardTitle>
                            <CardDescription>
                                Overall site analytics will be available here. For now, view individual post analytics on each post page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                To view analytics for a specific post:
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>Go to Dashboard → Posts</li>
                                <li>Click on a published post</li>
                                <li>Scroll down to see Social Analytics Dashboard</li>
                            </ol>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="top-posts">
                    <TopPosts days={parseInt(period)} limit={10} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
