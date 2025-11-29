"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag, Filter as FilterIcon, X } from "lucide-react"
import ProductGrid from "@/components/store/ProductGrid"
import ProductFilters from "@/components/store/ProductFilters"
import ProductSort from "@/components/store/ProductSort"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export default function StorePage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [products, setProducts] = useState([])
    const [brands, setBrands] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState(null)
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
    const [filters, setFilters] = useState({
        brands: searchParams.get('brand') ? [searchParams.get('brand')] : [],
        categories: searchParams.get('category') ? [searchParams.get('category')] : [],
        priceRange: [0, 100000]
    })
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    // Fetch brands and categories on mount
    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [brandsRes, categoriesRes] = await Promise.all([
                    fetch('/api/store/brands?active=true'),
                    fetch('/api/store/categories')
                ])

                const brandsData = await brandsRes.json()
                const categoriesData = await categoriesRes.json()

                setBrands(brandsData.brands || [])
                setCategories(categoriesData.categories || [])
            } catch (error) {
                console.error('Error fetching filter data:', error)
            }
        }

        fetchFiltersData()
    }, [])

    // Fetch products when filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()

                // Add filters
                if (filters.brands.length > 0) {
                    filters.brands.forEach(brand => params.append('brand', brand))
                }
                if (filters.categories.length > 0) {
                    filters.categories.forEach(category => params.append('category', category))
                }
                if (filters.priceRange[0] > 0) {
                    params.append('minPrice', filters.priceRange[0])
                }
                if (filters.priceRange[1] < 100000) {
                    params.append('maxPrice', filters.priceRange[1])
                }

                // Add search
                if (searchQuery) {
                    params.append('search', searchQuery)
                }

                // Add sort
                params.append('sort', sortBy)

                const response = await fetch(`/api/store/products?${params.toString()}`)
                const data = await response.json()

                setProducts(data.products || [])
                setPagination(data.pagination)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [filters, searchQuery, sortBy])

    const handleSearch = (e) => {
        e.preventDefault()
        // Search is handled by the useEffect above
    }

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters)
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Affiliate Store</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Discover Amazing{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
                                Products
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Explore our curated collection of products from top brands. Find the best deals and shop with confidence.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-14 text-lg rounded-full border-2 border-primary/20 focus:border-primary/40"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Desktop Filters Sidebar */}
                        <aside className="hidden lg:block w-80 flex-shrink-0">
                            <div className="sticky top-24">
                                <ProductFilters
                                    brands={brands}
                                    categories={categories}
                                    onFilterChange={handleFilterChange}
                                    initialFilters={filters}
                                />
                            </div>
                        </aside>

                        {/* Products Section */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Mobile Filter Button */}
                                    <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="lg:hidden">
                                                <FilterIcon className="h-4 w-4 mr-2" />
                                                Filters
                                                {(filters.brands.length + filters.categories.length) > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {filters.brands.length + filters.categories.length}
                                                    </Badge>
                                                )}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-80 overflow-y-auto">
                                            <SheetHeader>
                                                <SheetTitle>Filters</SheetTitle>
                                            </SheetHeader>
                                            <div className="mt-6">
                                                <ProductFilters
                                                    brands={brands}
                                                    categories={categories}
                                                    onFilterChange={handleFilterChange}
                                                    initialFilters={filters}
                                                />
                                            </div>
                                        </SheetContent>
                                    </Sheet>

                                    {/* Results Count */}
                                    {pagination && (
                                        <p className="text-sm text-muted-foreground">
                                            Showing <span className="font-medium">{products.length}</span> of{" "}
                                            <span className="font-medium">{pagination.totalProducts}</span> products
                                        </p>
                                    )}
                                </div>

                                {/* Sort */}
                                <ProductSort value={sortBy} onChange={setSortBy} />
                            </div>

                            {/* Products Grid */}
                            <ProductGrid products={products} loading={loading} />

                            {/* Load More */}
                            {pagination && pagination.hasMore && (
                                <div className="text-center mt-12">
                                    <Button size="lg" variant="outline">
                                        Load More Products
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
