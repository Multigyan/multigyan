"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProductCard({ product, className }) {
    const discountPercentage = product.discount || 0
    const hasDiscount = discountPercentage > 0

    return (
        <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block group"
        >
            <Card className={cn(
                "overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm h-full",
                className
            )}>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                <CardContent className="p-0 relative">
                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                        {product.featuredImage?.url ? (
                            <Image
                                src={product.featuredImage.url}
                                alt={product.featuredImage.alt || product.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
                                <ShoppingCart className="h-20 w-20 text-primary/60 group-hover:scale-110 transition-transform" />
                            </div>
                        )}

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute top-3 right-3 z-20">
                                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-right duration-500">
                                    {discountPercentage}% OFF
                                </Badge>
                            </div>
                        )}

                        {/* Featured Badge */}
                        {product.isFeatured && (
                            <div className="absolute top-3 left-3 z-20">
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-left duration-500">
                                    ⭐ Featured
                                </Badge>
                            </div>
                        )}

                        {/* View Count */}
                        {product.viewCount > 0 && (
                            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                                <Eye className="h-3 w-3" />
                                <span>{product.viewCount}</span>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="p-5 space-y-3">
                        {/* Brand Badge */}
                        {product.brand && (
                            <Badge
                                className="w-fit px-3 py-1 shadow-md backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all hover:scale-105"
                                style={{ backgroundColor: product.brand.color }}
                            >
                                {product.brand.name}
                            </Badge>
                        )}

                        {/* Product Title */}
                        <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem] bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text group-hover:from-primary group-hover:to-primary/60 transition-all duration-500">
                            {product.title}
                        </h3>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Rating */}
                        {product.rating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={cn(
                                                "text-lg",
                                                i < Math.floor(product.rating) ? "text-yellow-500" : "text-gray-300"
                                            )}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                {product.reviewCount > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        ({product.reviewCount})
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Price Section */}
                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </span>
                                {hasDiscount && product.originalPrice && (
                                    <span className="text-sm text-muted-foreground line-through">
                                        ₹{product.originalPrice.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* View Details Button */}
                        <Button
                            className="w-full mt-4 group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 shadow-lg"
                            size="lg"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                            View Details
                            <TrendingUp className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </a>
    )
}
