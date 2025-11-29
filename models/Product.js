import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a product title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    description: {
        type: String,
        default: ''
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot be more than 500 characters']
    },
    images: [{
        url: String,
        alt: String,
        publicId: String
    }],
    featuredImage: {
        url: String,
        alt: String,
        publicId: String
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategories: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    price: {
        type: Number,
        required: [true, 'Please provide a price']
    },
    originalPrice: {
        type: Number
    },
    currency: {
        type: String,
        default: 'INR'
    },
    discount: {
        type: Number,
        default: 0
    },
    affiliateLink: {
        type: String,
        required: [true, 'Please provide an affiliate link']
    },
    affiliateNetwork: {
        type: String,
        enum: ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Other'],
        default: 'Other'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Boolean,
        default: true
    },
    clickCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    lastClickedAt: {
        type: Date
    },
    metaTitle: String,
    metaDescription: String
}, {
    timestamps: true
});

// Calculate discount percentage before saving
productSchema.pre('save', function (next) {
    if (this.originalPrice && this.price && this.originalPrice > this.price) {
        this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }

    // Generate slug from title if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
