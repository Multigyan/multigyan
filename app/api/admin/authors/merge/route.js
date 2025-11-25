import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Post from '@/models/Post'
import { clearStatsCache } from '@/lib/stats'

// Merge multiple author accounts
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { authorIds, primaryAuthorId, keepDetails } = await request.json()

        // Validation
        if (!authorIds || authorIds.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 authors required for merge' },
                { status: 400 }
            )
        }

        if (!primaryAuthorId || !authorIds.includes(primaryAuthorId)) {
            return NextResponse.json(
                { error: 'Primary author must be one of the selected authors' },
                { status: 400 }
            )
        }

        await connectDB()

        // Get all authors
        const authors = await User.find({ _id: { $in: authorIds } })

        if (authors.length !== authorIds.length) {
            return NextResponse.json(
                { error: 'One or more authors not found' },
                { status: 404 }
            )
        }

        // Get primary author
        const primaryAuthor = authors.find(a => a._id.toString() === primaryAuthorId)

        // Update primary author with selected details
        if (keepDetails) {
            if (keepDetails.name) primaryAuthor.name = keepDetails.name
            if (keepDetails.username) primaryAuthor.username = keepDetails.username
            if (keepDetails.email) primaryAuthor.email = keepDetails.email
            if (keepDetails.bio) primaryAuthor.bio = keepDetails.bio
            if (keepDetails.profilePictureUrl) primaryAuthor.profilePictureUrl = keepDetails.profilePictureUrl
            if (keepDetails.role) primaryAuthor.role = keepDetails.role

            await primaryAuthor.save()
        }

        // Get IDs of authors to be merged (excluding primary)
        const mergeAuthorIds = authorIds.filter(id => id !== primaryAuthorId)

        // Reassign all posts from merged authors to primary author
        const updateResult = await Post.updateMany(
            { author: { $in: mergeAuthorIds } },
            { $set: { author: primaryAuthorId } }
        )

        // Delete merged authors
        await User.deleteMany({ _id: { $in: mergeAuthorIds } })

        // Clear stats cache to refresh data
        clearStatsCache()

        return NextResponse.json({
            success: true,
            message: `Successfully merged ${mergeAuthorIds.length} author(s)`,
            postsReassigned: updateResult.modifiedCount,
            authorsDeleted: mergeAuthorIds.length
        })

    } catch (error) {
        console.error('Error merging authors:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to merge authors' },
            { status: 500 }
        )
    }
}
