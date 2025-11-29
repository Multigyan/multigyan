import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';

// GET /api/store/brands - Fetch all brands
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        const filter = activeOnly ? { isActive: true } : {};

        const brands = await Brand.find(filter)
            .sort({ productCount: -1, name: 1 })
            .select('name slug logo color productCount isFeatured')
            .lean();

        return NextResponse.json({ brands });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brands' },
            { status: 500 }
        );
    }
}

// POST /api/store/brands - Create new brand (Admin only)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        await dbConnect();

        const data = await request.json();

        if (!data.name) {
            return NextResponse.json(
                { error: 'Brand name is required' },
                { status: 400 }
            );
        }

        const brand = await Brand.create(data);

        return NextResponse.json(
            { message: 'Brand created successfully', brand },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating brand:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Brand with this name already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create brand' },
            { status: 500 }
        );
    }
}
