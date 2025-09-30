import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { 
  User as UserIcon, 
  Mail, 
  Globe, 
  Twitter, 
  Linkedin,
  Calendar,
  Shield,
  PenTool
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

async function getUserByUsername(username) {
  try {
    await connectDB()
    
    const user = await User.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    }).select('-password')
    
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function generateMetadata({ params }) {
  const { username } = params
  const user = await getUserByUsername(username)
  
  if (!user) {
    return {
      title: 'User Not Found - Multigyan',
    }
  }
  
  return {
    title: `${user.name} - Multigyan`,
    description: user.bio || `View ${user.name}'s profile on Multigyan`,
  }
}

export default async function ProfilePage({ params }) {
  const { username } = params
  const user = await getUserByUsername(username)
  
  if (!user) {
    notFound()
  }
  
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.profilePictureUrl} alt={user.name} />
                  <AvatarFallback className="bg-white text-blue-600 text-3xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.role === 'admin' && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <Shield className="h-5 w-5 text-yellow-900" />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-blue-100 mb-4">@{user.username}</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <PenTool className="h-3 w-3 mr-1" />
                        Author
                      </>
                    )}
                  </Badge>
                  
                  {user.emailVerified && (
                    <Badge variant="outline" className="bg-white/20 border-white text-white">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                {user.bio && (
                  <p className="text-lg text-blue-50 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {user.email}
                    </a>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      Website
                    </a>
                  </div>
                )}
                
                {user.twitterHandle && (
                  <div className="flex items-center gap-3 text-sm">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`https://twitter.com/${user.twitterHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.twitterHandle}
                    </a>
                  </div>
                )}
                
                {user.linkedinUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About {user.name.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                {user.bio ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    This user hasn't added a bio yet.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Future: Posts section can be added here */}
            {/* <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No posts yet.
                </p>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  )
}
