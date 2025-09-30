"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Send, 
  X, 
  User, 
  Mail, 
  MessageCircle,
  LogIn,
  UserPlus,
  Shield 
} from 'lucide-react'
import { toast } from 'sonner'

export default function CommentForm({ 
  postId, 
  parentComment = null, 
  onCommentAdded, 
  onCancel,
  placeholder = "Share your thoughts...",
  compact = false
}) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState(session ? 'user' : 'guest')

  const isReply = !!parentComment
  const maxLength = 1000

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (content.length > maxLength) {
      toast.error(`Comment cannot be more than ${maxLength} characters`)
      return
    }

    // Validation for guest comments
    if (!session && activeTab === 'guest') {
      if (!guestName.trim()) {
        toast.error('Please enter your name')
        return
      }
      if (!guestEmail.trim()) {
        toast.error('Please enter your email')
        return
      }
      
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(guestEmail)) {
        toast.error('Please enter a valid email address')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        postId,
        content: content.trim(),
        parentComment
      }

      // Add guest info if not logged in
      if (!session && activeTab === 'guest') {
        requestData.guestName = guestName.trim()
        requestData.guestEmail = guestEmail.trim()
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        setContent('')
        setGuestName('')
        setGuestEmail('')
        onCommentAdded(data.comment, data.needsApproval)
      } else {
        toast.error(data.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setGuestName('')
    setGuestEmail('')
    onCancel()
  }

  if (compact && session) {
    // Compact form for replies when user is logged in
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={session.user.image} alt={session.user.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[80px] resize-none"
              maxLength={maxLength}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {content.length}/{maxLength}
              </span>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isSubmitting || !content.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        {session ? (
          // Logged in user form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={session.user.image} alt={session.user.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{session.user.name}</span>
                  {session.user.role === 'admin' && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
              </div>
            </div>

            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] resize-none"
                maxLength={maxLength}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {content.length}/{maxLength}
                </span>
                {session.user.role === 'admin' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Your comments are auto-approved
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !content.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : (isReply ? 'Post Reply' : 'Post Comment')}
              </Button>
            </div>
          </form>
        ) : (
          // Not logged in - show tabs for guest/login options
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guest">
                <MessageCircle className="h-4 w-4 mr-2" />
                Guest
              </TabsTrigger>
              <TabsTrigger value="login">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guest" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guestName">Name *</Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your name"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">Email *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guestContent">Comment *</Label>
                  <Textarea
                    id="guestContent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[100px] resize-none"
                    maxLength={maxLength}
                    required
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {content.length}/{maxLength}
                    </span>
                    <span className="text-xs text-yellow-600">
                      Guest comments require approval
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !content.trim() || !guestName.trim() || !guestEmail.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Login to Comment</h3>
                <p className="text-muted-foreground mb-4">
                  Login to your account to join the discussion. Your comments will be posted immediately.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Join the Community</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to participate in discussions, like comments, and get notified of replies.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href="/register">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
