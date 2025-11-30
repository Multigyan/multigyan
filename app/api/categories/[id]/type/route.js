import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

// PATCH /api/categories/[id]/type - Update category type
export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;
        const { type } = await request.json();

        if (!['blog', 'store', 'both'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid type. Must be blog, store, or both' },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { type },
            { new: true }
        );

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error updating category type:', error);
        return NextResponse.json(
            { error: 'Failed to update category type' },
            { status: 500 }
        );
    }
}
