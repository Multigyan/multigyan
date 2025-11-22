import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ProfileView from '@/models/ProfileView'

export async function POST(request) {
    try {
        await connectDB()
        const { profileId } = await request.json()

        if (!profileId) {
            return NextResponse.json(
                { error: 'Missing profileId' },
                { status: 400 }
            )
        }

        // Mark the most recent view as converted (followed)
        const result = await ProfileView.findOneAndUpdate(
            { profileId },
            {
                $set: {
                    followedAfterView: true,
                    followedAt: new Date()
                }
            },
            { sort: { timestamp: -1 }, new: true }
        )

        if (result) {
            console.log(`🎯 Conversion tracked: Follow on profile ${profileId}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Conversion tracking error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to track conversion' },
            { status: 200 } // Return 200 to not break the page
        )
    }
}
