// Script to fix Hindi category slug
// Run this once to update the category with a proper slug

import mongoose from 'mongoose'
import connectDB from './lib/mongodb.js'
import Category from './models/Category.js'

async function fixHindiCategorySlug() {
    try {
        await connectDB()

        // Find the category without a slug or with empty slug
        const hindiCategory = await Category.findOne({
            name: 'सरकारी योजनाएं'
        })

        if (hindiCategory) {
            console.log('Found Hindi category:', hindiCategory.name)
            console.log('Current slug:', hindiCategory.slug)

            // Set a proper English slug
            hindiCategory.slug = 'government-schemes'
            await hindiCategory.save()

            console.log('✅ Updated slug to:', hindiCategory.slug)
        } else {
            console.log('❌ Hindi category not found')
        }

        // List all categories and their slugs
        const allCategories = await Category.find({})
        console.log('\n📋 All categories:')
        allCategories.forEach(cat => {
            console.log(`  - ${cat.name}: ${cat.slug || '(NO SLUG)'}`)
        })

        process.exit(0)
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

fixHindiCategorySlug()
