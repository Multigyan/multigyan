"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import ProductFilters from "@/components/store/ProductFilters"
import ProductSort from "@/components/store/ProductSort"
import ProductGrid from "@/components/store/ProductGrid"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Filter as FilterIcon } from "lucide-react"

export default function StoreClientWrapper({ initialProducts, brands, categories }) {
    const [products, setProducts] = useState(initialProducts)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [filters, setFilters] = useState({
        brands: [],
        categories: [],
        priceRange: [0, 100000]
    })
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    // Fetch products when filters change
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
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    // Trigger fetch when filters/search/sort change
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters)
        fetchProducts()
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchProducts()
    }

    const handleSortChange = (newSort) => {
        setSortBy(newSort)
        fetchProducts()
    }

    return (
        <>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
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
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{products.length}</span> products
                            </p>
                        </div>

                        {/* Sort */}
                        <ProductSort value={sortBy} onChange={handleSortChange} />
                    </div>

                    {/* Products Grid */}
                    <ProductGrid products={products} loading={loading} />
                </div>
            </div>
        </>
    )
}
