"use client"

import { useState, useEffect } from 'react'
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

    // Set page title
    useEffect(() => {
        document.title = "Analytics | Multigyan"
    }, [])

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Enhanced Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple/5 via-transparent to-purple/5 rounded-lg -z-10"></div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">Analytics Dashboard</span>
                </h1>
                <p className="text-muted-foreground/80">
                    Track your content performance and engagement metrics
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-gradient-to-r from-muted to-muted/50 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="top-posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Top Posts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Eye className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Coming Soon</div>
                                <p className="text-xs text-muted-foreground/80">
                                    Overall site analytics
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-500/30 bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/20 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Coming Soon</div>
                                <p className="text-xs text-muted-foreground/80">
                                    Likes, comments, shares
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-500/30 bg-gradient-to-br from-background to-yellow-50/30 dark:to-yellow-950/20 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Coming Soon</div>
                                <p className="text-xs text-muted-foreground/80">
                                    Best performing category
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Coming Soon</div>
                                <p className="text-xs text-muted-foreground/80">
                                    Average reading time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Analytics Coming Soon</CardTitle>
                            <CardDescription className="text-muted-foreground/80">
                                Overall site analytics will be available here. For now, view individual post analytics on each post page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground/80">
                                To view analytics for a specific post:
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground/80">
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
