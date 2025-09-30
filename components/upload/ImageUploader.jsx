"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Link as LinkIcon, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Check,
  Crop
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import ImageCropper from '@/components/image/ImageCropper'

export default function ImageUploader({ 
  value, 
  onChange, 
  onAltTextChange,
  altText = '',
  className = '',
  maxSizeInMB = 10,
  allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  placeholder = 'Upload or enter image URL...',
  enableCropping = true, // New prop to enable/disable cropping
  cropShape = 'round', // 'rect' or 'round'
  aspectRatio = 1 // 1 = square, 16/9 = landscape, etc.
}) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imageUrl, setImageUrl] = useState(value || '')
  const [urlInput, setUrlInput] = useState('')
  const [validatingUrl, setValidatingUrl] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const fileInputRef = useRef(null)

  // Upload file to Cloudinary
  const uploadToCloudinary = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'multigyan_uploads')
    formData.append('folder', 'multigyan/posts')
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please set up NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file.')
    }
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error?.message || 'Upload failed'
      throw new Error(`Upload failed: ${errorMessage}. Please check your Cloudinary upload preset configuration.`)
    }
    
    const data = await response.json()
    return data.secure_url
  }, [])

  // Handle file selection (with optional cropping)
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return

    // Validate file type
    if (!allowedFormats.includes(file.type)) {
      toast.error(`Please select a valid image format: ${allowedFormats.map(f => f.split('/')[1]).join(', ')}`)
      return
    }

    // Validate file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      toast.error(`File size must be less than ${maxSizeInMB}MB`)
      return
    }

    // If cropping is enabled, show cropper
    if (enableCropping) {
      const reader = new FileReader()
      reader.onload = () => {
        setTempImageUrl(reader.result)
        setOriginalFile(file)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    } else {
      // Upload directly without cropping
      await uploadFile(file)
    }
  }, [allowedFormats, maxSizeInMB, enableCropping])

  // Upload file function
  const uploadFile = useCallback(async (file) => {
    setUploading(true)
    
    try {
      const url = await uploadToCloudinary(file)
      
      if (url) {
        setImageUrl(url)
        onChange(url)
        toast.success('Image uploaded successfully!')
        
        // Auto-generate alt text from filename if none provided
        if (!altText && onAltTextChange) {
          const filename = file.name.split('.')[0].replace(/[-_]/g, ' ')
          onAltTextChange(filename)
        }
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error.message || 'Failed to upload image'
      toast.error(errorMessage, {
        description: 'Try using the Image URL tab instead, or check the setup guide.',
        duration: 5000
      })
    } finally {
      setUploading(false)
    }
  }, [uploadToCloudinary, onChange, onAltTextChange, altText])

  // Handle cropped image
  const handleCroppedImage = useCallback(async (croppedFile) => {
    setShowCropper(false)
    setTempImageUrl(null)
    await uploadFile(croppedFile)
  }, [uploadFile])

  // Cancel cropping
  const handleCancelCrop = useCallback(() => {
    setShowCropper(false)
    setTempImageUrl(null)
    setOriginalFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle URL validation and setting
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    setValidatingUrl(true)
    
    try {
      // Validate URL format
      const url = new URL(urlInput.trim())
      
      // Check if it's a valid image URL by trying to load it
      const img = new window.Image()
      img.onload = () => {
        setImageUrl(urlInput.trim())
        onChange(urlInput.trim())
        setUrlInput('')
        toast.success('Image URL added successfully!')
        setValidatingUrl(false)
        
        // Auto-generate alt text from URL if none provided
        if (!altText && onAltTextChange) {
          const filename = url.pathname.split('/').pop()?.split('.')[0] || 'Image'
          onAltTextChange(filename.replace(/[-_]/g, ' '))
        }
      }
      img.onerror = () => {
        toast.error('Unable to load image from this URL. Please check the URL and try again.')
        setValidatingUrl(false)
      }
      img.src = url.href
    } catch (error) {
      toast.error('Please enter a valid URL')
      setValidatingUrl(false)
    }
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }

  const handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    }
  }

  // Remove image
  const handleRemoveImage = () => {
    setImageUrl('')
    onChange('')
    setUrlInput('')
    if (onAltTextChange) {
      onAltTextChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageSrc={tempImageUrl}
          onCropComplete={handleCroppedImage}
          onCancel={handleCancelCrop}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
        />
      )}

      <div className={`space-y-4 ${className}`}>
        {!imageUrl ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                  ${uploading ? 'pointer-events-none opacity-50' : ''}
                `}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={allowedFormats.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploading}
                />
                
                <div className="flex flex-col items-center space-y-4">
                  {uploading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  ) : (
                    <Upload className={`h-12 w-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {uploading ? 'Uploading...' : dragActive ? 'Drop image here' : 'Drag & drop an image here'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                    {enableCropping && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Crop className="h-3 w-3" />
                        You'll be able to crop and adjust the image
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Supports: {allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • Max size: {maxSizeInMB}MB
                    </p>
                  </div>
                  
                  <Button type="button" variant="outline" disabled={uploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      disabled={validatingUrl}
                    />
                    <Button 
                      type="button"
                      onClick={handleUrlSubmit}
                      disabled={validatingUrl || !urlInput.trim()}
                    >
                      {validatingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter any image URL from any source (no cropping available for URLs)
                  </p>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    You can use images from any website, social media, cloud storage, or CDN
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="space-y-4">
                  {/* Preview Label */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Preview</h3>
                    <span className="text-xs text-muted-foreground">How it will look</span>
                  </div>
                  
                  {/* Main Preview - Full Image */}
                  <div className="relative">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border-2 border-border">
                      <Image
                        src={imageUrl}
                        alt={altText || 'Preview'}
                        fill
                        className="object-contain"
                        onError={() => {
                          toast.error('Failed to load image. Please check the URL.')
                          handleRemoveImage()
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 shadow-lg"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Profile Picture Preview - How it will appear */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-background border-2 border-primary/20 flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={altText || 'Profile preview'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Profile Picture Preview</p>
                      <p className="text-xs text-muted-foreground">This is how your image will appear in your profile</p>
                    </div>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>Image selected</span>
                  </div>
                  <p className="text-xs text-muted-foreground break-all">
                    {imageUrl}
                  </p>
                </div>
                
                {/* Alt Text Input */}
                {onAltTextChange && (
                  <div>
                    <Label htmlFor="altText">Alt Text (for accessibility)</Label>
                    <Input
                      id="altText"
                      placeholder="Describe the image for screen readers"
                      value={altText}
                      onChange={(e) => onAltTextChange(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Helps screen readers and improves SEO
                    </p>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
