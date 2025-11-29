import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// POST /api/store/products/[slug]/click - Track affiliate link click
export async function POST(request, { params }) {
    try {
        await dbConnect();

        const { slug } = params;

        const product = await Product.findOne({ slug, isActive: true });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Increment click count and update last clicked timestamp
        await Product.findByIdAndUpdate(product._id, {
            $inc: { clickCount: 1 },
            lastClickedAt: new Date()
        });

        // Return the affiliate link
        return NextResponse.json({
            affiliateLink: product.affiliateLink,
            message: 'Click tracked successfully'
        });
    } catch (error) {
        console.error('Error tracking click:', error);
        return NextResponse.json(
            { error: 'Failed to track click' },
            { status: 500 }
        );
    }
}
