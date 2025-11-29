"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ProductFilters({
    brands = [],
    categories = [],
    onFilterChange,
    initialFilters = {}
}) {
    const [selectedBrands, setSelectedBrands] = useState(initialFilters.brands || [])
    const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || [])
    const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 100000])

    useEffect(() => {
        onFilterChange({
            brands: selectedBrands,
            categories: selectedCategories,
            priceRange
        })
    }, [selectedBrands, selectedCategories, priceRange])

    const handleBrandToggle = (brandSlug) => {
        setSelectedBrands(prev =>
            prev.includes(brandSlug)
                ? prev.filter(b => b !== brandSlug)
                : [...prev, brandSlug]
        )
    }

    const handleCategoryToggle = (categorySlug) => {
        setSelectedCategories(prev =>
            prev.includes(categorySlug)
                ? prev.filter(c => c !== categorySlug)
                : [...prev, categorySlug]
        )
    }

    const clearAllFilters = () => {
        setSelectedBrands([])
        setSelectedCategories([])
        setPriceRange([0, 100000])
    }

    const hasActiveFilters = selectedBrands.length > 0 || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000

    return (
        <div className="space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Filters</h2>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-sm hover:text-destructive"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filters Count */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {selectedBrands.length + selectedCategories.length} active filters
                    </Badge>
                </div>
            )}

            {/* Price Range Filter */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-base">Price Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={100000}
                        step={1000}
                        className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">₹{priceRange[0].toLocaleString('en-IN')}</span>
                        <span className="text-muted-foreground">to</span>
                        <span className="font-medium">₹{priceRange[1].toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Brand Filter */}
            {brands.length > 0 && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base">Brands</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {brands.map((brand) => (
                            <div key={brand.slug} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`brand-${brand.slug}`}
                                    checked={selectedBrands.includes(brand.slug)}
                                    onCheckedChange={() => handleBrandToggle(brand.slug)}
                                />
                                <Label
                                    htmlFor={`brand-${brand.slug}`}
                                    className="flex items-center gap-2 cursor-pointer flex-1"
                                >
                                    <span className="flex-1">{brand.name}</span>
                                    {brand.productCount > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            ({brand.productCount})
                                        </span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {categories.map((category) => (
                            <div key={category.slug} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`category-${category.slug}`}
                                    checked={selectedCategories.includes(category.slug)}
                                    onCheckedChange={() => handleCategoryToggle(category.slug)}
                                />
                                <Label
                                    htmlFor={`category-${category.slug}`}
                                    className="flex items-center gap-2 cursor-pointer flex-1"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="flex-1">{category.name}</span>
                                    {category.productCount > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            ({category.productCount})
                                        </span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
