import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import Category from '@/models/Category';

// GET /api/store/products - Fetch products with filtering, sorting, and pagination
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const skip = (page - 1) * limit;

        // Build filter query
        const filter = { isActive: true };

        // Brand filter
        const brandSlug = searchParams.get('brand');
        if (brandSlug) {
            const brand = await Brand.findOne({ slug: brandSlug });
            if (brand) {
                filter.brand = brand._id;
            }
        }

        // Category filter
        const categorySlug = searchParams.get('category');
        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                filter.category = category._id;
            }
        }

        // Price range filter
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Featured filter
        const featured = searchParams.get('featured');
        if (featured === 'true') {
            filter.isFeatured = true;
        }

        // Search query
        const search = searchParams.get('search');
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Sorting
        const sortBy = searchParams.get('sort') || 'createdAt';
        const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1;

        let sortOptions = {};
        switch (sortBy) {
            case 'price-low':
                sortOptions = { price: 1 };
                break;
            case 'price-high':
                sortOptions = { price: -1 };
                break;
            case 'popular':
                sortOptions = { clickCount: -1, viewCount: -1 };
                break;
            case 'rating':
                sortOptions = { rating: -1 };
                break;
            case 'newest':
            default:
                sortOptions = { createdAt: -1 };
        }

        // Fetch products
        const [products, totalCount] = await Promise.all([
            Product.find(filter)
                .populate('brand', 'name slug logo color')
                .populate('category', 'name slug color')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .select('-affiliateLink') // Don't send affiliate link in list view
                .lean(),
            Product.countDocuments(filter)
        ]);

        return NextResponse.json({
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalProducts: totalCount,
                hasMore: skip + products.length < totalCount
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/store/products - Create new product (Admin only)
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

        // Validate required fields
        if (!data.title || !data.price || !data.affiliateLink || !data.brand || !data.category) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    details: {
                        hasTitle: !!data.title,
                        hasPrice: !!data.price,
                        hasAffiliateLink: !!data.affiliateLink,
                        hasBrand: !!data.brand,
                        hasCategory: !!data.category
                    }
                },
                { status: 400 }
            );
        }

        // Create product
        const product = await Product.create(data);

        // Increment brand and category product counts
        await Promise.all([
            Brand.findByIdAndUpdate(data.brand, { $inc: { productCount: 1 } }),
            Category.incrementProductCount(data.category)
        ]);

        // Populate references
        await product.populate([
            { path: 'brand', select: 'name slug logo color' },
            { path: 'category', select: 'name slug color' }
        ]);

        return NextResponse.json(
            { message: 'Product created successfully', product },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating product:', error);

        // Return detailed error for debugging
        return NextResponse.json(
            {
                error: 'Failed to create product',
                message: error.message,
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
