import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

/**
 * POST /api/store/products/[slug]/view
 * 
 * Increment view count for a product
 * This endpoint is called client-side to track views for all users
 */
export async function POST(request, { params }) {
    try {
        const resolvedParams = await params
        const productSlug = resolvedParams.slug

        await dbConnect()

        // Find the product by slug
        const product = await Product.findOne({ slug: productSlug, isActive: true }).select('_id').lean()

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Increment view count
        await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } })

        return NextResponse.json({ success: true, counted: true })

    } catch (error) {
        console.error('Error tracking product view:', error)
        // Return success even on error to not break the page
        return NextResponse.json({ success: true, counted: false })
    }
}
