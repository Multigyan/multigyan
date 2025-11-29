import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import Category from '@/models/Category';

// GET /api/store/products/[slug] - Fetch single product
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { slug } = params;

        const product = await Product.findOne({ slug, isActive: true })
            .populate('brand', 'name slug logo color website')
            .populate('category', 'name slug color')
            .lean();

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // ✅ REMOVED: Server-side view tracking doesn't work for cached pages
        // View tracking is now handled client-side via ProductViewTracker component

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT /api/store/products/[slug] - Update product (Admin only)
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { slug } = params;
        const data = await request.json();

        const product = await Product.findOne({ slug });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // If brand or category changed, update counts
        const oldBrandId = product.brand.toString();
        const oldCategoryId = product.category.toString();
        const newBrandId = data.brand?.toString();
        const newCategoryId = data.category?.toString();

        if (newBrandId && oldBrandId !== newBrandId) {
            await Promise.all([
                Brand.findByIdAndUpdate(oldBrandId, { $inc: { productCount: -1 } }),
                Brand.findByIdAndUpdate(newBrandId, { $inc: { productCount: 1 } })
            ]);
        }

        if (newCategoryId && oldCategoryId !== newCategoryId) {
            await Promise.all([
                Category.decrementProductCount(oldCategoryId),
                Category.incrementProductCount(newCategoryId)
            ]);
        }

        // Update product
        Object.assign(product, data);
        await product.save();

        // Populate references
        await product.populate([
            { path: 'brand', select: 'name slug logo color' },
            { path: 'category', select: 'name slug color' }
        ]);

        return NextResponse.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE /api/store/products/[slug] - Delete product (Admin only)
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { slug } = params;

        const product = await Product.findOne({ slug });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Decrement brand and category counts
        await Promise.all([
            Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: -1 } }),
            Category.decrementProductCount(product.category)
        ]);

        await product.deleteOne();

        return NextResponse.json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
