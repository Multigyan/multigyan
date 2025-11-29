import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AffiliateButton from "@/components/store/AffiliateButton"
import ProductCard from "@/components/store/ProductCard"
import {
    ChevronRight,
    Home,
    Star,
    Eye,
    TrendingUp,
    Share2,
    Heart,
    ShoppingBag,
} from "lucide-react"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    await dbConnect()
    const product = await Product.findOne({ slug: params.slug, isActive: true })
        .populate('brand', 'name')
        .populate('category', 'name')
        .lean()

    if (!product) {
        return {
            title: 'Product Not Found',
        }
    }

    return {
        title: `${product.title} - ${product.brand.name} | Multigyan Store`,
        description: product.shortDescription || product.description?.substring(0, 160),
        openGraph: {
            title: product.title,
            description: product.shortDescription,
            images: product.featuredImage?.url ? [product.featuredImage.url] : [],
            type: 'product',
        },
    }
}

export default async function ProductDetailPage({ params }) {
    await dbConnect()

    const product = await Product.findOne({ slug: params.slug, isActive: true })
        .populate('brand', 'name slug logo color website')
        .populate('category', 'name slug color')
        .lean()

    if (!product) {
        notFound()
    }

    // Fetch related products
    const relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
        isActive: true,
    })
        .populate('brand', 'name slug logo color')
        .populate('category', 'name slug color')
        .limit(4)
        .lean()

    const hasDiscount = product.discount > 0

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <section className="bg-muted/30 py-4">
                <div className="container mx-auto px-4 sm:px-6">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">
                            <Home className="h-4 w-4" />
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/store" className="hover:text-foreground transition-colors">
                            Store
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link
                            href={`/store/category/${product.category.slug}`}
                            className="hover:text-foreground transition-colors"
                        >
                            {product.category.name}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium line-clamp-1">
                            {product.title}
                        </span>
                    </nav>
                </div>
            </section>

            {/* Product Details */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 border-2 border-primary/20">
                                {product.featuredImage?.url ? (
                                    <Image
                                        src={product.featuredImage.url}
                                        alt={product.featuredImage.alt || product.title}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
                                        <ShoppingBag className="h-32 w-32 text-primary/60" />
                                    </div>
                                )}

                                {/* Badges */}
                                {hasDiscount && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-lg font-bold shadow-lg">
                                            {product.discount}% OFF
                                        </Badge>
                                    </div>
                                )}
                                {product.isFeatured && (
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-lg font-bold shadow-lg">
                                            ⭐ Featured
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Additional Images Thumbnails */}
                            {product.images && product.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {product.images.slice(0, 4).map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                                        >
                                            <Image
                                                src={image.url}
                                                alt={image.alt || `${product.title} ${index + 1}`}
                                                fill
                                                sizes="25vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Brand Badge */}
                            {product.brand && (
                                <Link href={`/store/brand/${product.brand.slug}`}>
                                    <Badge
                                        className="w-fit px-4 py-2 text-base shadow-md backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all hover:scale-105"
                                        style={{ backgroundColor: product.brand.color }}
                                    >
                                        {product.brand.name}
                                    </Badge>
                                </Link>
                            )}

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                                {product.title}
                            </h1>

                            {/* Rating & Views */}
                            <div className="flex items-center gap-6">
                                {product.rating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {product.rating.toFixed(1)}
                                            {product.reviewCount > 0 && ` (${product.reviewCount} reviews)`}
                                        </span>
                                    </div>
                                )}
                                {product.viewCount > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Eye className="h-4 w-4" />
                                        <span>{product.viewCount} views</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Price */}
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl md:text-5xl font-bold text-primary">
                                        ₹{product.price.toLocaleString('en-IN')}
                                    </span>
                                    {hasDiscount && product.originalPrice && (
                                        <span className="text-2xl text-muted-foreground line-through">
                                            ₹{product.originalPrice.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>
                                {hasDiscount && (
                                    <p className="text-green-600 font-medium">
                                        You save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')} ({product.discount}%)
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    {product.inStock ? (
                                        <span className="text-green-600 font-medium">✓ In Stock</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">✗ Out of Stock</span>
                                    )}
                                </p>
                            </div>

                            <Separator />

                            {/* Short Description */}
                            {product.shortDescription && (
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {product.shortDescription}
                                </p>
                            )}

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <AffiliateButton productSlug={product.slug} />
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="text-lg px-8 py-7"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    Save for Later
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="text-lg px-8 py-7"
                                >
                                    <Share2 className="mr-2 h-5 w-5" />
                                    Share
                                </Button>
                            </div>

                            {/* Affiliate Network Info */}
                            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">
                                        🛒 This product is available on{" "}
                                        <span className="font-semibold text-foreground">
                                            {product.affiliateNetwork}
                                        </span>
                                        . Clicking &#34;Buy Now&#34; will redirect you to their website.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold mb-6">Product Description</h2>
                            <Card className="border-2 border-primary/20">
                                <CardContent className="p-8">
                                    <div
                                        className="prose prose-lg max-w-none"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                        Related Products
                                    </span>
                                </h2>
                                <Button variant="outline" asChild>
                                    <Link href={`/store/category/${product.category.slug}`}>
                                        View All
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((relatedProduct) => (
                                    <ProductCard key={relatedProduct._id} product={relatedProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
