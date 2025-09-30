"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Save,
  Trash2,
  Download,
  Lock,
  Mail,
  AlertTriangle,
  Globe,
  Moon,
  Sun,
  Monitor
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    commentNotifications: true,
    likeNotifications: false,
    newFollowerNotifications: true,
    weeklyDigest: true,
    
    // Privacy Settings
    profileVisibility: true,
    showEmail: false,
    showJoinDate: true,
    allowFollowing: true,
    
    // Content Settings
    autoSaveDrafts: true,
    defaultPostVisibility: 'public',
    allowComments: true,
    moderateComments: false,
    
    // Display Settings
    theme: 'system',
    language: 'en',
    postsPerPage: 10,
    
    // Security Settings
    twoFactorEnabled: false,
    loginAlerts: true
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      fetchUserSettings()
    }
  }, [session, status, router])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/users/settings')
      const data = await response.json()
      
      if (response.ok && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Settings updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update settings')
      }
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/users/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `multigyan-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Data export started')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Account deleted successfully')
        router.push('/')
      } else {
        toast.error('Failed to delete account')
      }
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="space-y-8">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comment-notifications">Comment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone comments on your posts
                  </p>
                </div>
                <Switch
                  id="comment-notifications"
                  checked={settings.commentNotifications}
                  onCheckedChange={(checked) => handleSettingChange('commentNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="like-notifications">Like Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone likes your posts
                  </p>
                </div>
                <Switch
                  id="like-notifications"
                  checked={settings.likeNotifications}
                  onCheckedChange={(checked) => handleSettingChange('likeNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of platform activity
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control your profile visibility and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visibility">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to everyone
                  </p>
                </div>
                <Switch
                  id="profile-visibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email on your public profile
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-join-date">Show Join Date</Label>
                  <p className="text-sm text-muted-foreground">
                    Display when you joined Multigyan
                  </p>
                </div>
                <Switch
                  id="show-join-date"
                  checked={settings.showJoinDate}
                  onCheckedChange={(checked) => handleSettingChange('showJoinDate', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Content Preferences
            </CardTitle>
            <CardDescription>
              Manage your content creation and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-save Drafts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your posts as you write
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSaveDrafts}
                  onCheckedChange={(checked) => handleSettingChange('autoSaveDrafts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-comments">Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow readers to comment on your posts by default
                  </p>
                </div>
                <Switch
                  id="allow-comments"
                  checked={settings.allowComments}
                  onCheckedChange={(checked) => handleSettingChange('allowComments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="moderate-comments">Moderate Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Require approval for comments before they appear
                  </p>
                </div>
                <Switch
                  id="moderate-comments"
                  checked={settings.moderateComments}
                  onCheckedChange={(checked) => handleSettingChange('moderateComments', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posts-per-page">Posts Per Page</Label>
                <Input
                  id="posts-per-page"
                  type="number"
                  min="5"
                  max="50"
                  value={settings.postsPerPage}
                  onChange={(e) => handleSettingChange('postsPerPage', parseInt(e.target.value))}
                  className="w-24"
                />
                <p className="text-sm text-muted-foreground">
                  Number of posts to display per page (5-50)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={settings.loginAlerts}
                  onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription>
              Export your data or delete your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Export Your Data</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Download a copy of all your data including posts, comments, and profile information
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={handleExportData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="mt-2">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers including all your posts, comments,
                            and profile information.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
