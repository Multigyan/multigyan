import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

/**
 * POST /api/store/products/[id]/view
 * 
 * Increment view count for a product
 * This endpoint is called client-side to track views for all users
 */
export async function POST(request, { params }) {
    try {
        const resolvedParams = await params
        const productId = resolvedParams.id

        await dbConnect()

        // Find the product
        const product = await Product.findById(productId).select('isActive').lean()

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Only count views for active products
        if (!product.isActive) {
            return NextResponse.json({ success: true, counted: false })
        }

        // Increment view count
        await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } })

        return NextResponse.json({ success: true, counted: true })

    } catch (error) {
        console.error('Error tracking product view:', error)
        // Return success even on error to not break the page
        return NextResponse.json({ success: true, counted: false })
    }
}
