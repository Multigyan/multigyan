import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ProfileView from '@/models/ProfileView'

export async function POST(request) {
    try {
        await connectDB()
        const { profileId, section } = await request.json()

        if (!profileId || !section) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Add section view to the most recent profile view
        const result = await ProfileView.findOneAndUpdate(
            { profileId },
            {
                $push: {
                    sectionsViewed: {
                        section,
                        timestamp: new Date()
                    }
                }
            },
            { sort: { timestamp: -1 }, new: true }
        )

        if (result) {
            console.log(`👁️ Section viewed: ${section} on profile ${profileId}`)
        }

        return NextResponse.json({ success: true, section })
    } catch (error) {
        console.error('Section tracking error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to track section' },
            { status: 200 } // Return 200 to not break the page
        )
    }
}
