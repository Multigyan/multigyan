"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import useSWR from "swr"
import { profileStatsConfig } from "@/lib/swr-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// ⚡ OPTIMIZATION: Lazy load heavy ImageUploader component
const ImageUploader = dynamic(() => import('@/components/upload/ImageUploader'), {
  loading: () => <div className="h-32 bg-muted animate-pulse rounded-lg"></div>,
  ssr: false
})
import {
  User,
  Mail,
  Save,
  Shield,
  PenTool,
  Calendar,
  Eye,
  Edit3,
  Camera,
  Check,
  X
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/helpers"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ⚡ SWR OPTIMIZATION: Cache profile stats for instant loads
  const { data: profileData } = useSWR(
    session ? '/api/users/profile/stats' : null,
    profileStatsConfig
  )

  const profileStats = profileData?.stats || {
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    profilePictureUrl: "",
    twitterHandle: "",
    linkedinUrl: "",
    website: ""
  })
  const [usernameCheck, setUsernameCheck] = useState({
    checking: false,
    available: null,
    message: ''
  })
  const [usernameTimeout, setUsernameTimeout] = useState(null)

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        username: session.user.username || "",
        bio: session.user.bio || "",
        profilePictureUrl: session.user.profilePictureUrl || "",
        twitterHandle: session.user.twitterHandle || "",
        linkedinUrl: session.user.linkedinUrl || "",
        website: session.user.website || ""
      })
      // SWR automatically fetches profile stats
    }
  }, [session, status, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Check username availability as user types
    if (name === 'username') {
      // Clear previous timeout
      if (usernameTimeout) {
        clearTimeout(usernameTimeout)
      }

      // Reset check state
      setUsernameCheck({ checking: true, available: null, message: '' })

      // Don't check if empty or same as current username
      if (!value.trim() || value.trim() === session?.user?.username) {
        setUsernameCheck({ checking: false, available: null, message: '' })
        return
      }

      // Set new timeout for checking
      const timeout = setTimeout(() => {
        checkUsernameAvailability(value.trim())
      }, 500) // Wait 500ms after user stops typing

      setUsernameTimeout(timeout)
    }
  }

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameCheck({
        checking: false,
        available: false,
        message: 'Username must be at least 3 characters'
      })
      return
    }

    try {
      const response = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      setUsernameCheck({
        checking: false,
        available: data.available,
        message: data.message
      })
    } catch (error) {
      setUsernameCheck({
        checking: false,
        available: null,
        message: 'Failed to check username'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profile updated successfully!')

        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session.user,
            ...formData
          }
        })
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your public profile and account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a profile picture or use a URL from any source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={formData.profilePictureUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, profilePictureUrl: url }))}
                placeholder="Upload or enter profile picture URL..."
                maxSizeInMB={5}
                allowedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your personal information visible to other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed here. Contact support if needed.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="your-unique-username"
                      className={`pr-10 ${usernameCheck.available === false ? 'border-red-500' :
                        usernameCheck.available === true ? 'border-green-500' : ''
                        }`}
                    />
                    {usernameCheck.checking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                    {!usernameCheck.checking && usernameCheck.available === true && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {!usernameCheck.checking && usernameCheck.available === false && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {usernameCheck.message && (
                    <p className={`text-xs mt-1 ${usernameCheck.available === false ? 'text-red-500' :
                      usernameCheck.available === true ? 'text-green-500' :
                        'text-muted-foreground'
                      }`}>
                      {usernameCheck.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Your profile URL will be: multigyan.com/profile/{formData.username || 'username'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your expertise, and interests..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      Visible on your author profile and posts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.bio.length}/500
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      name="twitterHandle"
                      value={formData.twitterHandle}
                      onChange={handleInputChange}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                How others see your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={formData.profilePictureUrl} alt={formData.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {formData.name || 'Your Name'}
                  </h3>
                  {formData.username && (
                    <p className="text-sm text-muted-foreground">
                      @{formData.username}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={session.user.role === 'admin' ? 'default' : 'secondary'}>
                      {session.user.role === 'admin' ? (
                        <><Shield className="h-3 w-3 mr-1" />Admin</>
                      ) : (
                        <><PenTool className="h-3 w-3 mr-1" />Author</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              {formData.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {formData.bio}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {formData.email}
                </span>
              </div>

              {formData.username && (
                <div className="pt-3 border-t">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/profile/${formData.username}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      View Public Profile
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posts Published</span>
                  <span className="font-semibold">{profileStats.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-semibold">{profileStats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Likes</span>
                  <span className="font-semibold">{profileStats.totalLikes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="font-semibold">
                    {formatDate(session.user.createdAt || new Date())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">User ID: {session.user.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined: {formatDate(session.user.createdAt || new Date())}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {session.user.role === 'admin' ? (
                  <Shield className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Edit3 className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm">
                  Role: {session.user.role === 'admin' ? 'Administrator' : 'Author'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
