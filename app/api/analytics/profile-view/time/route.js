import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ProfileView from '@/models/ProfileView'

export async function POST(request) {
    try {
        await connectDB()
        const { profileId, timeSpent } = await request.json()

        if (!profileId || !timeSpent) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Update the most recent view for this profile
        const result = await ProfileView.findOneAndUpdate(
            { profileId },
            { $set: { timeOnProfile: timeSpent } },
            { sort: { timestamp: -1 }, new: true }
        )

        if (result) {
            console.log(`⏱️ Time tracking: ${timeSpent}s on profile ${profileId}`)
        }

        return NextResponse.json({ success: true, timeSpent })
    } catch (error) {
        console.error('Time tracking error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to track time' },
            { status: 200 } // Return 200 to not break the page
        )
    }
}
