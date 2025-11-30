import { ShoppingBag } from "lucide-react"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import Brand from "@/models/Brand"
import Category from "@/models/Category"
import ProductGrid from "@/components/store/ProductGrid"
import StoreClientWrapper from "@/components/store/StoreClientWrapper"

// ISR: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400

export const metadata = {
    title: 'Store | Multigyan',
    description: 'Explore our curated collection of products from top brands. Find the best deals and shop with confidence.',
}

export default async function StorePage() {
    await dbConnect()

    // Fetch initial data server-side
    const [products, brands, categories] = await Promise.all([
        Product.find({ isActive: true })
            .populate('brand', 'name slug logo color')
            .populate('category', 'name slug color')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean(),
        Brand.find({ isActive: true })
            .select('name slug logo color')
            .sort({ name: 1 })
            .lean(),
        Category.find({
            type: { $in: ['store', 'both'] },
            isActive: true
        })
            .select('name slug color')
            .sort({ name: 1 })
            .lean()
    ])

    // Serialize data for client
    const serializedProducts = JSON.parse(JSON.stringify(products))
    const serializedBrands = JSON.parse(JSON.stringify(brands))
    const serializedCategories = JSON.parse(JSON.stringify(categories))

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
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <StoreClientWrapper
                        initialProducts={serializedProducts}
                        brands={serializedBrands}
                        categories={serializedCategories}
                    />
                </div>
            </section>
        </div>
    )
}
