"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { createLowlight } from 'lowlight'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Code2,
  Heading1, 
  Heading2, 
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Youtube as YoutubeIcon,
  Underline as UnderlineIcon,
  Minus,
  Upload,
  Zap
} from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { convertToWebP, googleDriveUrlToFile } from '@/lib/imageUtils'

// Configure lowlight with popular languages
const lowlight = createLowlight()
lowlight.register('js', js)
lowlight.register('javascript', js)
lowlight.register('ts', ts)
lowlight.register('typescript', ts)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('cpp', cpp)
lowlight.register('c++', cpp)

const MenuBar = ({ editor }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setLinkUrl('')
    setIsLinkDialogOpen(false)
  }, [editor, linkUrl])

  // Upload image to Cloudinary with WebP conversion
  const uploadToCloudinary = useCallback(async (file) => {
    // Convert to WebP first (unless already WebP)
    let processedFile = file
    if (file.type !== 'image/webp') {
      try {
        toast.info('Converting to WebP...', { duration: 2000 })
        processedFile = await convertToWebP(file, 0.85)
        const compressionRatio = ((1 - processedFile.size / file.size) * 100).toFixed(1)
        if (compressionRatio > 0) {
          console.log(`Image optimized: ${compressionRatio}% smaller`)
        }
      } catch (error) {
        console.error('WebP conversion failed, using original:', error)
        processedFile = file
      }
    }

    const formData = new FormData()
    formData.append('file', processedFile)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'multigyan_uploads')
    formData.append('folder', 'multigyan/posts/content')
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.secure_url
  }, [])

  // Handle drag and drop for images in editor
  const handleImageUpload = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setUploadingImage(true)
    
    try {
      const url = await uploadToCloudinary(file)
      if (url && editor) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run()
        toast.success('Image uploaded successfully!')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. You can use the image URL option instead.')
    } finally {
      setUploadingImage(false)
    }
  }, [editor, uploadToCloudinary])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // ✅ FIXED: Added Google Drive support with download and upload
  const addImage = useCallback(async () => {
  if (imageUrl && editor) {
    // Check if it's a Google Drive URL
    if (imageUrl.includes('drive.google.com')) {
      toast.info('Google Drive URL detected - downloading and uploading image...')
      setUploadingImage(true)
      
      try {
        // Download the image from Google Drive
        const file = await googleDriveUrlToFile(imageUrl)
        
        if (file) {
          toast.success('Image downloaded from Google Drive!')
          
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(file)
          
          if (cloudinaryUrl) {
            // Insert the Cloudinary URL into the editor
            editor.chain().focus().setImage({ 
              src: cloudinaryUrl, 
              alt: imageAlt || 'Google Drive Image' 
            }).run()
            toast.success('Image uploaded successfully!')
          }
        } else {
          throw new Error('Failed to download from Google Drive')
        }
      } catch (error) {
        console.error('Google Drive image error:', error)
        toast.error('Failed to process Google Drive image', {
          description: error.message || 'Please check the sharing settings and try again',
          duration: 5000
        })
      } finally {
        setUploadingImage(false)
      }
    } else {
      // Regular URL - use directly
      editor.chain().focus().setImage({ 
        src: imageUrl, 
        alt: imageAlt || 'Image' 
      }).run()
      toast.success('Image added successfully!')
    }
  }
  setImageUrl('')
  setImageAlt('')
  setIsImageDialogOpen(false)
}, [editor, imageUrl, imageAlt, uploadToCloudinary])

  const addYoutube = useCallback(() => {
    if (youtubeUrl && editor) {
      // Extract video ID from various YouTube URL formats
      let videoId = ''
      
      try {
        // Handle youtu.be links
        if (youtubeUrl.includes('youtu.be/')) {
          videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0]
        }
        // Handle youtube.com/watch links
        else if (youtubeUrl.includes('youtube.com/watch')) {
          const url = new URL(youtubeUrl)
          videoId = url.searchParams.get('v')
        }
        // Handle youtube.com/embed links
        else if (youtubeUrl.includes('youtube.com/embed/')) {
          videoId = youtubeUrl.split('embed/')[1].split('?')[0]
        }
        // Handle shorts
        else if (youtubeUrl.includes('youtube.com/shorts/')) {
          videoId = youtubeUrl.split('shorts/')[1].split('?')[0]
        }
        
        if (videoId) {
          editor.chain().focus().setYoutubeVideo({
            src: `https://www.youtube.com/watch?v=${videoId}`,
            width: 640,
            height: 360,
          }).run()
          toast.success('YouTube video embedded successfully!')
        } else {
          toast.error('Invalid YouTube URL. Please enter a valid YouTube video link.')
        }
      } catch (error) {
        toast.error('Invalid YouTube URL format')
      }
    }
    setYoutubeUrl('')
    setIsYoutubeDialogOpen(false)
  }, [editor, youtubeUrl])

  const addCodeBlock = useCallback((language = null) => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock({ language }).run()
    }
  }, [editor])

  const addHorizontalRule = useCallback(() => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, isActive, children, title, disabled }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  )

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1 items-center bg-muted/30 sticky top-0 z-10">
      {/* Text Formatting */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings - All 6 levels */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <Type className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1 (Largest)"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          title="Heading 4"
        >
          <Heading4 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          isActive={editor.isActive('heading', { level: 5 })}
          title="Heading 5"
        >
          <Heading5 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          isActive={editor.isActive('heading', { level: 6 })}
          title="Heading 6 (Smallest)"
        >
          <Heading6 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Alignment */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists and Quotes */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={addHorizontalRule}
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Code Block with Language Selection */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => addCodeBlock()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        
        {editor.isActive('codeBlock') && (
          <Select 
            value={editor.getAttributes('codeBlock').language || 'text'}
            onValueChange={(language) => addCodeBlock(language)}
          >
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Plain Text</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Media & Links */}
      <div className="flex gap-1">
        {/* Link Dialog */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant={editor.isActive('link') ? "default" : "ghost"}
              size="sm"
              title="Add Link (Ctrl+K)"
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
              <DialogDescription>
                Enter the URL you want to link to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setLink()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={setLink}>Add Link</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    editor.chain().focus().unsetLink().run()
                    setIsLinkDialogOpen(false)
                  }}
                >
                  Remove Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Dialog */}
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="Add Image"
              className="h-8 w-8 p-0"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
              <DialogDescription>
                Upload an image or paste an image URL (Google Drive links will be automatically downloaded and uploaded)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <Label>Upload Image</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                        Converting to WebP & Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image File
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-green-500" />
                  Auto-converts to WebP for faster loading
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <Label htmlFor="imageUrl">Image URL (supports Google Drive)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg or Google Drive link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span>💡</span>
                  <span>Google Drive images will be downloaded and uploaded to Cloudinary automatically</span>
                </p>
              </div>
              <div>
                <Label htmlFor="imageAlt">Alt Text (for accessibility)</Label>
                <Input
                  id="imageAlt"
                  placeholder="Describe the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addImage()}
                />
              </div>
              <Button onClick={addImage} disabled={!imageUrl || uploadingImage}>
                {uploadingImage ? 'Processing...' : 'Add Image'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* YouTube Dialog */}
        <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="Embed YouTube Video"
              className="h-8 w-8 p-0"
            >
              <YoutubeIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Embed YouTube Video</DialogTitle>
              <DialogDescription>
                Paste any YouTube video URL to embed it in your post
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addYoutube()}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats:
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
                  <li>• https://youtu.be/VIDEO_ID</li>
                  <li>• https://www.youtube.com/embed/VIDEO_ID</li>
                  <li>• https://www.youtube.com/shorts/VIDEO_ID</li>
                </ul>
              </div>
              <Button onClick={addYoutube} disabled={!youtubeUrl}>
                Embed Video
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* History */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}

export default function EnhancedRichTextEditor({ content, onChange, placeholder = "Start writing..." }) {
  // ✅ Upload pasted/dropped images to Cloudinary
  const uploadPastedImage = useCallback(async (file) => {
    try {
      // Convert to WebP first
      let processedFile = file
      if (file.type !== 'image/webp') {
        try {
          processedFile = await convertToWebP(file, 0.85)
        } catch (error) {
          console.error('WebP conversion failed, using original:', error)
          processedFile = file
        }
      }

      const formData = new FormData()
      formData.append('file', processedFile)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'multigyan_uploads')
      formData.append('folder', 'multigyan/posts/content')
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload pasted image')
      return null
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg border my-4',
        },
        allowBase64: false, // ✅ Disable base64 to force upload
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-lg my-4 mx-auto',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg border bg-muted p-4 my-4 font-mono text-sm overflow-x-auto',
        },
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] max-w-none p-4',
      },
      // ✅ Handle pasted content with multiple images and formatting
      handlePaste: async (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || [])
        let hasImages = false
        const imageFiles = []
        
        // Step 1: Check if there are any images in the clipboard
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            hasImages = true
            const file = item.getAsFile()
            if (file) imageFiles.push(file)
          }
        }
        
        // Step 2: If there are direct image files (screenshot paste), upload them
        if (hasImages && imageFiles.length > 0) {
          event.preventDefault()
          
          console.log(`Found ${imageFiles.length} direct image(s) to upload`)
          
          // Upload all images sequentially with proper toast management
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i]
            const loadingToast = toast.loading(`Uploading image ${i + 1}/${imageFiles.length}...`)
            
            try {
              const url = await uploadPastedImage(file)
              if (url) {
                editor.chain().focus().setImage({ src: url, alt: `Pasted image ${i + 1}` }).run()
                toast.success(`Image ${i + 1} uploaded!`, { id: loadingToast, duration: 2000 })
              } else {
                toast.error(`Failed to upload image ${i + 1}`, { id: loadingToast })
              }
            } catch (error) {
              toast.error(`Error uploading image ${i + 1}`, { id: loadingToast })
            }
          }
          
          return true
        }
        
        // Step 3: Handle HTML content from Word/Google Docs
        const htmlContent = event.clipboardData?.getData('text/html')
        
        if (htmlContent) {
          // Check if HTML contains base64 images
          const hasBase64Images = htmlContent.includes('data:image')
          
          if (hasBase64Images) {
            event.preventDefault()
            
            console.log('Found Word/Docs content with images, processing...')
            
            // Extract base64 images using regex
            const base64Regex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g
            const base64Images = []
            let match
            
            while ((match = base64Regex.exec(htmlContent)) !== null) {
              base64Images.push({
                fullMatch: match[0],
                format: match[1],
                data: match[2]
              })
            }
            
            console.log(`Found ${base64Images.length} image(s) in content`)
            
            // Show initial toast
            const mainToast = toast.loading(`Processing content with ${base64Images.length} image(s)...`)
            
            // Convert base64 to files and upload
            let processedHtml = htmlContent
            
            for (let i = 0; i < base64Images.length; i++) {
              const img = base64Images[i]
              
              // Update progress
              toast.loading(`Uploading image ${i + 1}/${base64Images.length}...`, { id: mainToast })
              
              try {
                // Convert base64 to blob
                const byteCharacters = atob(img.data)
                const byteNumbers = new Array(byteCharacters.length)
                for (let j = 0; j < byteCharacters.length; j++) {
                  byteNumbers[j] = byteCharacters.charCodeAt(j)
                }
                const byteArray = new Uint8Array(byteNumbers)
                const blob = new Blob([byteArray], { type: `image/${img.format}` })
                const file = new File([blob], `pasted-image-${i + 1}.${img.format}`, { type: `image/${img.format}` })
                
                // Upload to Cloudinary
                const cloudinaryUrl = await uploadPastedImage(file)
                
                if (cloudinaryUrl) {
                  // Replace base64 with Cloudinary URL in HTML
                  processedHtml = processedHtml.replace(
                    img.fullMatch,
                    `<img src="${cloudinaryUrl}" alt="Image ${i + 1}" />`
                  )
                }
              } catch (error) {
                console.error(`Failed to process image ${i + 1}:`, error)
              }
            }
            
            // ✅ Clean and format the HTML properly
            let cleanedHtml = processedHtml
            
            // Remove Word-specific tags and attributes
            cleanedHtml = cleanedHtml
              // Remove style attributes
              .replace(/style="[^"]*"/g, '')
              // Remove class attributes from Word
              .replace(/class="[^"]*Mso[^"]*"/g, '')
              // Remove Word namespace tags
              .replace(/<\/?o:[^>]*>/g, '')
              .replace(/<\/?w:[^>]*>/g, '')
              // Remove empty spans
              .replace(/<span[^>]*>\s*<\/span>/g, '')
              // Remove Word comments
              .replace(/<!--\[if[^\]]*\]>.*?<!\[endif\]-->/g, '')
              // Clean up multiple spaces
              .replace(/&nbsp;/g, ' ')
              .replace(/\s+/g, ' ')
            
            // ✅ Convert Word formatting to proper HTML
            // Convert <p class="MsoNormal"> to simple <p>
            cleanedHtml = cleanedHtml.replace(/<p[^>]*class="[^"]*MsoNormal[^"]*"[^>]*>/g, '<p>')
            
            // Convert Word headings to proper HTML headings
            cleanedHtml = cleanedHtml
              .replace(/<p[^>]*>\s*<b>\s*<span[^>]*>([^<]+)<\/span>\s*<\/b>\s*<\/p>/g, '<h3>$1</h3>')
              .replace(/<p[^>]*><b>([^<]+)<\/b><\/p>/g, '<h3>$1</h3>')
            
            // Convert Word bullet lists properly
            cleanedHtml = cleanedHtml
              .replace(/<p[^>]*>\s*·\s*([^<]+)<\/p>/g, '<li>$1</li>')
              .replace(/<p[^>]*>\s*•\s*([^<]+)<\/p>/g, '<li>$1</li>')
              .replace(/<p[^>]*>\s*-\s*([^<]+)<\/p>/g, '<li>$1</li>')
            
            // Wrap consecutive <li> in <ul>
            cleanedHtml = cleanedHtml.replace(/(<li>.*?<\/li>)+/g, (match) => `<ul>${match}</ul>`)
            
            // Convert numbered lists
            cleanedHtml = cleanedHtml
              .replace(/<p[^>]*>\s*\d+\.\s*([^<]+)<\/p>/g, '<li>$1</li>')
              .replace(/<p[^>]*>\s*\d+\)\s*([^<]+)<\/p>/g, '<li>$1</li>')
            
            // Wrap consecutive numbered <li> in <ol>
            cleanedHtml = cleanedHtml.replace(/(<li>.*?<\/li>){2,}/g, (match) => {
              if (!match.includes('<ul>')) {
                return `<ol>${match}</ol>`
              }
              return match
            })
            
            // ✅ Remove excessive line breaks and spacing
            cleanedHtml = cleanedHtml
              .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
              .replace(/<br>\s*<br>/g, '<br>') // Remove double line breaks
              .replace(/<p>\s*<br>\s*<\/p>/g, '') // Remove paragraphs with just br
              .replace(/(<\/p>)\s*(<p>)/g, '$1$2') // Remove space between paragraphs
            
            // Insert the cleaned HTML
            editor.chain().focus().insertContent(cleanedHtml).run()
            
            // Dismiss the main toast and show success
            toast.success(`✅ Content pasted! ${base64Images.length} image(s) uploaded`, { 
              id: mainToast,
              duration: 3000 
            })
            
            return true
          }
        }
        
        // Step 4: For plain text or normal HTML (no images), allow default paste
        return false
      },
      // ✅ Handle dropped images - upload to Cloudinary
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const files = Array.from(event.dataTransfer.files)
          
          for (const file of files) {
            if (file.type.startsWith('image/')) {
              event.preventDefault()
              
              toast.promise(
                uploadPastedImage(file),
                {
                  loading: 'Converting to WebP and uploading image...',
                  success: (url) => {
                    if (url) {
                      const { schema } = view.state
                      const coordinates = view.posAtCoords({
                        left: event.clientX,
                        top: event.clientY,
                      })
                      
                      const node = schema.nodes.image.create({ src: url })
                      const transaction = view.state.tr.insert(coordinates.pos, node)
                      view.dispatch(transaction)
                      
                      return 'Image uploaded successfully!'
                    }
                    return 'Upload completed'
                  },
                  error: 'Failed to upload image'
                }
              )
              
              return true
            }
          }
        }
        return false
      },
    },
  })

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      <style jsx global>{`
        /* ✅ Fix spacing issues in editor */
        .ProseMirror p {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
        }
        
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        
        /* Remove extra spacing from first/last elements */
        .ProseMirror > *:first-child {
          margin-top: 0;
        }
        
        .ProseMirror > *:last-child {
          margin-bottom: 0;
        }
        
        /* Tighter spacing for consecutive paragraphs */
        .ProseMirror p + p {
          margin-top: 0.5rem;
        }
      `}</style>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="min-h-[400px] max-h-[600px] overflow-y-auto"
      />
      <div className="border-t border-border p-2 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Pro Tips:</span> Drag & drop images (auto-converts to WebP!) • 
          Use <kbd className="bg-muted px-1 py-0.5 rounded text-xs mx-1">Ctrl+B</kbd> for bold, 
          <kbd className="bg-muted px-1 py-0.5 rounded text-xs mx-1">Ctrl+I</kbd> for italic •
          Supports Google Drive image URLs • Type <kbd className="bg-muted px-1 py-0.5 rounded text-xs mx-1">```</kbd> for code blocks
        </p>
      </div>
    </div>
  )
}
