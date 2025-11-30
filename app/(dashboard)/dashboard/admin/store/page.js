import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Package, Tag, TrendingUp, Plus, BarChart3, Upload, Folder } from "lucide-react"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import Brand from "@/models/Brand"
import Category from "@/models/Category"

export const metadata = {
    title: 'Store Management - Admin Dashboard',
    description: 'Manage your affiliate store products, brands, and analytics',
}

export default async function StoreAdminPage() {
    await dbConnect()

    // Fetch store statistics
    const [totalProducts, totalBrands, totalClicks, featuredProducts] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Brand.countDocuments({ isActive: true }),
        Product.aggregate([
            { $group: { _id: null, totalClicks: { $sum: "$clickCount" } } }
        ]).then(result => result[0]?.totalClicks || 0),
        Product.countDocuments({ isFeatured: true, isActive: true })
    ])

    const storeCategories = await Category.countDocuments({
        type: { $in: ['store', 'both'] },
        isActive: true
    })

    return (
        <div className="px-6 py-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your affiliate products, brands, and track performance
                    </p>
                </div>
                <Button asChild size="lg" className="gap-2">
                    <Link href="/dashboard/admin/store/products/new">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            {featuredProducts} featured
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBrands}</div>
                        <p className="text-xs text-muted-foreground">
                            Affiliate partners
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storeCategories}</div>
                        <p className="text-xs text-muted-foreground">
                            Store categories
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Affiliate link clicks
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 group">
                        <Link href="/dashboard/admin/store/products">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-base mb-2">Manage Products</CardTitle>
                                <CardDescription className="text-sm">
                                    View, edit, and delete products
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-500/50 group">
                        <Link href="/dashboard/admin/store/products/bulk-upload">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle className="text-base mb-2">Bulk Upload</CardTitle>
                                <CardDescription className="text-sm">
                                    Import products from CSV/Excel
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500/50 group">
                        <Link href="/dashboard/admin/store/brands">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Tag className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-base mb-2">Manage Brands</CardTitle>
                                <CardDescription className="text-sm">
                                    Add and manage affiliate brands
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-500/50 group">
                        <Link href="/dashboard/admin/store/categories">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Folder className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-base mb-2">Categories</CardTitle>
                                <CardDescription className="text-sm">
                                    Manage product categories
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500/50 group">
                        <Link href="/dashboard/admin/store/analytics">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-base mb-2">Analytics</CardTitle>
                                <CardDescription className="text-sm">
                                    View performance metrics
                                </CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    )
}
