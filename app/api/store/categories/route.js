import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

// GET /api/store/categories - Fetch store categories
export async function GET(request) {
    try {
        await dbConnect();

        const categories = await Category.getActiveStoreCategories();

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error fetching store categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
