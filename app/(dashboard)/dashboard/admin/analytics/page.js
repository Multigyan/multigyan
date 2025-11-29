"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    Users,
    FileText,
    MessageSquare,
    Activity,
    Eye,
    Heart,
    Folder,
    AlertCircle,
    CheckCircle,
    Clock,
    Zap
} from "lucide-react"
import { toast } from "sonner"
import { AdminPageSkeleton } from "@/components/LoadingSkeletons"

export default function AnalyticsDashboard() {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState(null)
    const [activityData, setActivityData] = useState([])
    const [timeRange, setTimeRange] = useState('30')
    const [refreshInterval, setRefreshInterval] = useState(null)

    useEffect(() => {
        if (session?.user?.role !== 'admin') {
            router.push('/dashboard')
            return
        }
        fetchAnalytics()

        // Set up auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchAnalytics(true) // Silent refresh
        }, 30000)

        setRefreshInterval(interval)

        return () => {
            if (interval) clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, router, timeRange])

    // Set page title
    useEffect(() => {
        document.title = "Analytics Dashboard | Multigyan"
    }, [])

    const fetchAnalytics = async (silent = false) => {
        try {
            if (!silent) setLoading(true)

            const [analyticsRes, activityRes] = await Promise.all([
                fetch(`/api/admin/analytics?days=${timeRange}`),
                fetch(`/api/admin/activity?type=timeline&days=${timeRange}`)
            ])

            const analyticsData = await analyticsRes.json()
            const activityDataRes = await activityRes.json()

            if (analyticsRes.ok && activityRes.ok) {
                setAnalytics(analyticsData.analytics)
                setActivityData(activityDataRes.data)
            } else {
                if (!silent) toast.error('Failed to fetch analytics')
            }
        } catch (error) {
            if (!silent) toast.error('Failed to fetch analytics')
        } finally {
            if (!silent) setLoading(false)
        }
    }

    if (!session || session.user.role !== 'admin') {
        return null
    }

    if (loading) {
        return <AdminPageSkeleton />
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple/5 via-transparent to-purple/5 rounded-lg -z-10"></div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">Analytics Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground/80">
                        Comprehensive insights and performance metrics
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4 animate-pulse text-green-500" />
                        <span>Live</span>
                    </div>
                </div>
            </div>

            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{analytics?.users?.total || 0}</div>
                        <p className="text-xs text-muted-foreground/80">
                            <span className="text-green-600">+{analytics?.users?.newUsers || 0}</span> new this period
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-500/30 bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/20 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{analytics?.posts?.total || 0}</div>
                        <p className="text-xs text-muted-foreground/80">
                            <span className="text-blue-600">{analytics?.posts?.published || 0}</span> published
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Eye className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                            {(analytics?.posts?.totalViews || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground/80">
                            Across all content
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-pink-500/30 bg-gradient-to-br from-background to-pink-50/30 dark:to-pink-950/20 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                            {(analytics?.posts?.totalLikes || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground/80">
                            User engagement
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="growth" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="growth">Growth</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                {/* Growth Tab */}
                <TabsContent value="growth" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Growth Chart */}
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription className="text-muted-foreground/80">New users over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics?.growth?.users || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#8884d8" name="New Users" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Post Growth Chart */}
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Content Growth</CardTitle>
                                <CardDescription className="text-muted-foreground/80">New posts over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics?.growth?.posts || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#82ca9d" name="New Posts" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Activity Timeline */}
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Admin Activity</CardTitle>
                                <CardDescription className="text-muted-foreground/80">Actions performed over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={activityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="Actions" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Activity by Type */}
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Actions by Type</CardTitle>
                                <CardDescription className="text-muted-foreground/80">Distribution of admin actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analytics?.activity?.actionsByType || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry._id}: ${entry.count}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {(analytics?.activity?.actionsByType || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Distribution */}
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Posts by Category</CardTitle>
                                <CardDescription className="text-muted-foreground/80">Content distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics?.categories?.postsByCategory || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#82ca9d" name="Posts" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Posts */}
                        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Top Performing Posts</CardTitle>
                                <CardDescription className="text-muted-foreground/80">Most viewed content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(analytics?.topContent?.topPosts || []).slice(0, 5).map((post, index) => (
                                        <div key={post._id} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    by {post.author?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {post.views}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    {post.likeCount}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {analytics?.posts?.pending || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Posts awaiting approval
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {analytics?.users?.activeUsers || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active accounts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                                <Zap className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {analytics?.activity?.totalActions || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total admin activities
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
