"use client"

import ProductCard from "./ProductCard"

export default function ProductGrid({ products, loading = false }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-96" />
                    </div>
                ))}
            </div>
        )
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                    <svg
                        className="w-10 h-10 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your filters or search query
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
                <div
                    key={product._id}
                    className="animate-in fade-in slide-in-from-bottom-6 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    )
}
