import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a brand name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Brand name cannot be more than 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    description: String,
    logo: {
        url: String,
        alt: String,
        publicId: String
    },
    website: String,
    affiliateProgram: String,
    color: {
        type: String,
        default: '#3B82F6' // Default blue
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    productCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate slug from name before saving
brandSchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

export default Brand;
