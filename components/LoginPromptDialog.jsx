"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPromptDialog({ open, onOpenChange, authorName }) {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    // Store the current URL to redirect back after login
    const callbackUrl = window.location.href
    await signIn(undefined, { callbackUrl })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign in to Follow {authorName}</DialogTitle>
          <DialogDescription className="text-base">
            Create an account or sign in to follow this author and get notified about their new posts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Benefits of following:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Get notified about new articles</li>
              <li>Build your personalized feed</li>
              <li>Support your favorite authors</li>
              <li>Join the Multigyan community</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={handleSignIn}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Sign In
            </Button>
            
            <Button 
              onClick={handleSignIn}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to Multigyan's Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  )
}
