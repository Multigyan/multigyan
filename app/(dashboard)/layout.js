import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions)
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?callbackUrl=/dashboard')
  }
  
  return children
}
