"use client"

/**
 * 📸 I MADE THIS COMPONENT
 * 
 * This component allows users to share photos of their completed DIY/Recipe projects.
 * 
 * Features:
 * 1. Photo upload with Cloudinary
 * 2. Gallery display of all user photos
 * 3. Like/unlike functionality
 * 4. Caption support
 * 5. User attribution
 * 
 * Usage:
 * <IMadeThisSection postId={post._id} contentType="diy" />
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Camera, Heart, Upload, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'

export default function IMadeThisSection({ postId, contentType = 'diy' }) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const { data: session } = useSession()
  const { toast } = useToast()
  
  // Photo data
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // ========================================
  // FETCH PHOTOS
  // ========================================
  
  useEffect(() => {
    fetchPhotos()
  }, [postId])
  
  const fetchPhotos = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/posts/${postId}/user-photos`)
      const data = await response.json()
      
      if (data.success) {
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // ========================================
  // HANDLE FILE SELECTION
  // ========================================
  
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive'
      })
      return
    }
    
    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }
  
  // ========================================
  // UPLOAD PHOTO
  // ========================================
  
  const handleUpload = async () => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to share your photos',
        variant: 'destructive'
      })
      return
    }
    
    if (!selectedFile) {
      toast({
        title: 'No photo selected',
        description: 'Please select a photo to upload',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setIsUploading(true)
      
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })
      
      // Upload to API
      const response = await fetch(`/api/posts/${postId}/user-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: base64,
          caption: caption.trim()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Photo uploaded!',
          description: 'Your creation has been shared with the community'
        })
        
        // Reset form
        setSelectedFile(null)
        setPreviewUrl(null)
        setCaption('')
        setIsDialogOpen(false)
        
        // Refresh photos
        await fetchPhotos()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  // ========================================
  // LIKE PHOTO
  // ========================================
  
  const handleLikePhoto = async (photoId) => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like photos',
        variant: 'destructive'
      })
      return
    }
    
    try {
      const response = await fetch(`/api/posts/${postId}/user-photos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photoId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setPhotos(prevPhotos =>
          prevPhotos.map(photo =>
            photo._id === photoId
              ? { ...photo, likes: data.likes }
              : photo
          )
        )
      }
    } catch (error) {
      console.error('Error liking photo:', error)
    }
  }
  
  // ========================================
  // RENDER
  // ========================================
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <CardTitle>I Made This! 🎉</CardTitle>
          </div>
          
          {/* Upload Button */}
          {session && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Share Your Creation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your {contentType === 'diy' ? 'DIY Project' : 'Recipe'}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* File Input */}
                  {!previewUrl ? (
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Click to upload photo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Caption Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Caption (Optional)
                    </label>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder={`Tell us about your ${contentType === 'diy' ? 'project' : 'cooking experience'}...`}
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {caption.length}/500 characters
                    </p>
                  </div>
                  
                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Share Photo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Share photos of your completed {contentType === 'diy' ? 'project' : 'dish'} with the community!
        </p>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No photos yet
            </p>
            <p className="text-sm text-muted-foreground">
              Be the first to share your creation!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => {
              const isLiked = session && photo.likes.includes(session.user.id)
              
              return (
                <div key={photo._id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || 'User photo'}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                      {/* User Info */}
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border-2 border-white">
                          <AvatarImage src={photo.user.profilePictureUrl} />
                          <AvatarFallback className="text-xs">
                            {photo.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-white truncate">
                          {photo.user.name}
                        </span>
                      </div>
                      
                      {/* Caption */}
                      {photo.caption && (
                        <p className="text-xs text-white line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                      
                      {/* Like Button */}
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-white hover:text-white hover:bg-white/20"
                          onClick={() => handleLikePhoto(photo._id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span className="text-xs">{photo.likes.length}</span>
                        </Button>
                        
                        <span className="text-xs text-white/70">
                          {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
