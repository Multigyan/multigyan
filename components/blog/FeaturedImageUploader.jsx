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
  Crop,
  Info,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import ImageCropper from '@/components/image/ImageCropper'
import { convertToWebP, convertGoogleDriveUrl, optimizeImage } from '@/lib/imageUtils'

/**
 * FeaturedImageUploader Component with WebP Conversion
 * 
 * Features:
 * - Automatic WebP conversion
 * - Google Drive URL support
 * - Image optimization
 * - Drag & drop
 * - Optional cropping
 */

export default function FeaturedImageUploader({ 
  value, 
  onChange, 
  onAltTextChange,
  altText = '',
  className = '',
  maxSizeInMB = 10,
  allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  placeholder = 'Upload featured image for your blog post...',
  enableCropping = true,
  aspectRatio = 16 / 9,
  enableWebPConversion = true,
  enableOptimization = true
}) {
  const [uploading, setUploading] = useState(false)
  const [converting, setConverting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imageUrl, setImageUrl] = useState(value || '')
  const [urlInput, setUrlInput] = useState('')
  const [validatingUrl, setValidatingUrl] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [compressionInfo, setCompressionInfo] = useState(null)
  const fileInputRef = useRef(null)

  // Upload file to Cloudinary
  const uploadToCloudinary = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'multigyan_uploads')
    formData.append('folder', 'multigyan/posts/featured')
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please set up environment variables.')
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
      throw new Error(`Upload failed: ${errorMessage}`)
    }
    
    const data = await response.json()
    
    // Get actual image dimensions
    setImageDimensions({ 
      width: data.width, 
      height: data.height 
    })
    
    return data.secure_url
  }, [])

  // Handle file selection (with optional cropping and WebP conversion)
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
      // Process and upload directly without cropping
      await processAndUploadImage(file)
    }
  }, [allowedFormats, maxSizeInMB, enableCropping])

  // Process image (optimize and convert to WebP)
  const processAndUploadImage = useCallback(async (file) => {
    let processedFile = file
    const originalSize = file.size
    
    try {
      setConverting(true)
      
      // Step 1: Optimize image if needed (resize to max dimensions)
      if (enableOptimization) {
        toast.info('Optimizing image...', { duration: 2000 })
        processedFile = await optimizeImage(processedFile, 1920, 1080)
      }
      
      // Step 2: Convert to WebP (unless already WebP)
      if (enableWebPConversion && file.type !== 'image/webp') {
        toast.info('Converting to WebP format...', { duration: 2000 })
        processedFile = await convertToWebP(processedFile, 0.9)
      }
      
      const finalSize = processedFile.size
      const compressionRatio = ((1 - finalSize / originalSize) * 100).toFixed(1)
      
      setCompressionInfo({
        originalSize: (originalSize / 1024).toFixed(2),
        finalSize: (finalSize / 1024).toFixed(2),
        compressionRatio
      })
      
      if (compressionRatio > 0) {
        toast.success(`Image optimized! ${compressionRatio}% smaller`, { duration: 3000 })
      }
      
      setConverting(false)
      
      // Step 3: Upload
      await uploadFile(processedFile)
      
    } catch (error) {
      setConverting(false)
      console.error('Image processing error:', error)
      toast.error('Failed to process image. Uploading original...', { duration: 3000 })
      // Try uploading original file
      await uploadFile(file)
    }
  }, [enableOptimization, enableWebPConversion])

  // Upload file function
  const uploadFile = useCallback(async (file) => {
    setUploading(true)
    
    try {
      const url = await uploadToCloudinary(file)
      
      if (url) {
        setImageUrl(url)
        onChange(url)
        toast.success('Featured image uploaded successfully!')
        
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
        description: 'Try using the Image URL tab instead',
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
    await processAndUploadImage(croppedFile)
  }, [processAndUploadImage])

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
      let finalUrl = urlInput.trim()
      
      // Convert Google Drive URL if needed
      finalUrl = convertGoogleDriveUrl(finalUrl)
      
      if (finalUrl !== urlInput.trim()) {
        toast.info('Google Drive URL detected - converting to direct link...')
      }
      
      // Validate URL format
      const url = new URL(finalUrl)
      
      // Check if it's a valid image URL by trying to load it
      const img = new window.Image()
      img.onload = () => {
        // Get image dimensions
        setImageDimensions({ 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        })
        
        setImageUrl(finalUrl)
        onChange(finalUrl)
        setUrlInput('')
        toast.success('Featured image URL added successfully!')
        setValidatingUrl(false)
        
        // Auto-generate alt text from URL if none provided
        if (!altText && onAltTextChange) {
          const filename = url.pathname.split('/').pop()?.split('.')[0] || 'Featured image'
          onAltTextChange(filename.replace(/[-_]/g, ' '))
        }
      }
      img.onerror = () => {
        toast.error('Unable to load image from this URL. Please check the URL and try again.', {
          description: 'Make sure the URL is publicly accessible and points to an image file.',
          duration: 5000
        })
        setValidatingUrl(false)
      }
      img.src = finalUrl
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
    setImageDimensions({ width: 0, height: 0 })
    setCompressionInfo(null)
    if (onAltTextChange) {
      onAltTextChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isProcessing = uploading || converting

  return (
    <>
      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageSrc={tempImageUrl}
          onCropComplete={handleCroppedImage}
          onCancel={handleCancelCrop}
          aspectRatio={aspectRatio}
          cropShape="rect"
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
                  ${isProcessing ? 'pointer-events-none opacity-50' : ''}
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
                  disabled={isProcessing}
                />
                
                <div className="flex flex-col items-center space-y-4">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-sm font-medium">
                        {converting ? 'Optimizing image...' : 'Uploading...'}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className={`h-12 w-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          {dragActive ? 'Drop image here' : 'Drag & drop featured image here'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse files
                        </p>
                        {enableCropping && (
                          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Crop className="h-3 w-3" />
                            Recommended: 16:9 aspect ratio (1920x1080px)
                          </p>
                        )}
                        {enableWebPConversion && (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                            <Zap className="h-3 w-3" />
                            Auto-converts to WebP for faster loading
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Supports: {allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • Max: {maxSizeInMB}MB
                        </p>
                      </div>
                      <Button type="button" variant="outline" disabled={isProcessing}>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Best Practices Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Best Practices:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Use high-quality images (minimum 1200px wide)</li>
                    <li>16:9 aspect ratio is ideal for blog layouts</li>
                    <li>Images auto-optimized and converted to WebP</li>
                    <li>Use descriptive alt text for SEO</li>
                  </ul>
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
                      placeholder="https://example.com/image.jpg or Google Drive link"
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
                    Supports any image URL including Google Drive links
                  </p>
                </div>
                
                {/* Google Drive Instructions */}
                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Info className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Google Drive Support:</p>
                    <p>Just paste your Google Drive share link! It will be automatically converted to work.</p>
                    <p className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded">
                      drive.google.com/file/d/FILE_ID/view...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Use images from any website, CDN, or cloud storage
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Preview Label */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Featured Image Preview</h3>
                  <div className="flex items-center gap-2">
                    {imageDimensions.width > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {imageDimensions.width} × {imageDimensions.height}px
                      </span>
                    )}
                    {compressionInfo && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {compressionInfo.compressionRatio}% smaller
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Main Preview */}
                <div className="relative">
                  <div className="relative w-full rounded-lg overflow-hidden bg-muted border-2 border-border" style={{ aspectRatio: `${aspectRatio}` }}>
                    <Image
                      src={imageUrl}
                      alt={altText || 'Featured image preview'}
                      fill
                      className="object-cover"
                      onError={() => {
                        toast.error('Failed to load image. Please check the URL.')
                        handleRemoveImage()
                      }}
                      priority
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
                
                {/* Compression Info */}
                {compressionInfo && (
                  <div className="flex items-start gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Zap className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Optimized!</p>
                      <p>Original: {compressionInfo.originalSize}KB → Final: {compressionInfo.finalSize}KB WebP</p>
                    </div>
                  </div>
                )}
                
                {/* Image Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>Featured image selected</span>
                  </div>
                  <p className="text-xs text-muted-foreground break-all">
                    {imageUrl}
                  </p>
                </div>
                
                {/* Alt Text Input */}
                {onAltTextChange && (
                  <div>
                    <Label htmlFor="altText">Alt Text (for accessibility) *</Label>
                    <Input
                      id="altText"
                      placeholder="e.g., A guide to full-stack development with Next.js"
                      value={altText}
                      onChange={(e) => onAltTextChange(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Describe what the image shows - helps screen readers and improves SEO
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
                  Remove Featured Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
