// Run this script to activate your product
// Usage: node activate-product.js

const mongoose = require('mongoose');

async function activateProduct() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update the product
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const result = await Product.updateOne(
            {
                slug: 'li-ning-air-force-g3-carbon-fibre-badminton-racket-for-adults-premium-shuttle-racquet-with-protective-full-cover-expertly-strung-for-maximum-power-white-light-orange-black'
            },
            {
                $set: { isActive: true }
            }
        );

        console.log('Update result:', result);
        console.log('✅ Product activated successfully!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

activateProduct();
