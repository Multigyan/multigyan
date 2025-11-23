"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Youtube } from '@tiptap/extension-youtube'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
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
  Bold, Italic, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, Quote, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, Type,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Youtube as YoutubeIcon, Underline as UnderlineIcon,
  Minus, Upload, Zap, Table as TableIcon, Trash2, Plus, Palette, Highlighter,
} from 'lucide-react'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { convertToWebP, googleDriveUrlToFile } from '@/lib/imageUtils'

// Configure lowlight (using the singleton from 'lowlight/lib/core')
const lowlight = createLowlight()
lowlight.register('javascript', js)
lowlight.register('ts', ts)
lowlight.register('xml', html)    // your `html` import is XML from highlight.js
lowlight.register('css', css)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('cpp', cpp)

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

  const uploadToCloudinary = useCallback(async (file) => {
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

  const handleImageUpload = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

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
      toast.error('Failed to upload image')
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

  const addImage = useCallback(async () => {
    if (imageUrl && editor) {
      if (imageUrl.includes('drive.google.com')) {
        toast.info('Google Drive URL detected - downloading and uploading image...')
        setUploadingImage(true)

        try {
          const file = await googleDriveUrlToFile(imageUrl)

          if (file) {
            toast.success('Image downloaded from Google Drive!')
            const cloudinaryUrl = await uploadToCloudinary(file)

            if (cloudinaryUrl) {
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
      let videoId = ''

      try {
        if (youtubeUrl.includes('youtu.be/')) {
          videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0]
        }
        else if (youtubeUrl.includes('youtube.com/watch')) {
          const url = new URL(youtubeUrl)
          videoId = url.searchParams.get('v')
        }
        else if (youtubeUrl.includes('youtube.com/embed/')) {
          videoId = youtubeUrl.split('embed/')[1].split('?')[0]
        }
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
          toast.error('Invalid YouTube URL')
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

      {/* Text Color & Highlight */}
      <div className="flex gap-1">
        <div className="relative">
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="h-8 w-8 cursor-pointer rounded border border-input"
            title="Text Color"
          />
        </div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
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
          title="Heading 1"
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
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
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
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* 🆕 TABLE CONTROLS */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>

        {editor.isActive('table') && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Add Column Before"
            >
              <Plus className="h-3 w-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete Column"
            >
              <Trash2 className="h-3 w-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Add Row Before"
            >
              <Plus className="h-3 w-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Delete Row"
            >
              <Trash2 className="h-3 w-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete Table"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </ToolbarButton>
          </>
        )}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Code Block */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => addCodeBlock()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Media */}
      <div className="flex gap-1">
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant={editor.isActive('link') ? "default" : "ghost"}
              size="sm"
              title="Add Link"
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
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
              <Button onClick={setLink}>Add Link</Button>
            </div>
          </DialogContent>
        </Dialog>

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
            </DialogHeader>
            <div className="space-y-4">
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
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">Alt Text</Label>
                <Input
                  id="imageAlt"
                  placeholder="Describe the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              <Button onClick={addImage} disabled={!imageUrl || uploadingImage}>
                Add Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="YouTube"
              className="h-8 w-8 p-0"
            >
              <YoutubeIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Embed YouTube Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <Button onClick={addYoutube} disabled={!youtubeUrl}>
                Embed
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
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}

export default function EnhancedRichTextEditor({ content, onChange, placeholder = "Start writing..." }) {
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  const base64ToBlob = (base64String) => {
    try {
      const parts = base64String.split(';base64,')
      const contentType = parts[0].split(':')[1]
      const raw = window.atob(parts[1])
      const rawLength = raw.length
      const uInt8Array = new Uint8Array(rawLength)

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
      }

      return new Blob([uInt8Array], { type: contentType })
    } catch (error) {
      console.error('Failed to convert base64 to blob:', error)
      return null
    }
  }

  const uploadBase64Image = async (base64String) => {
    try {
      const blob = base64ToBlob(base64String)
      if (!blob) return null

      const file = new File([blob], 'pasted-image.png', { type: blob.type })

      let processedFile = file
      try {
        processedFile = await convertToWebP(file, 0.85)
      } catch (error) {
        console.error('WebP conversion failed:', error)
        processedFile = file
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
      console.error('Failed to upload base64 image:', error)
      return null
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'my-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg border my-4',
        },
        allowBase64: true,
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
      // ✅ PHASE 2: Debounced onChange for better performance
      const html = editor.getHTML()

      // Clear existing timeout
      if (window.editorChangeTimeout) {
        clearTimeout(window.editorChangeTimeout)
      }

      // Debounce onChange by 300ms to reduce re-renders
      window.editorChangeTimeout = setTimeout(() => {
        onChange(html)
      }, 300)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] max-w-none p-4',
      },
    },
  })

  // ✅ PHASE 2: Update editor when content prop changes (for template insertion)
  useEffect(() => {
    if (!editor || !content) return

    // Only update if content is different from current editor content
    const currentContent = editor.getHTML()
    if (content !== currentContent) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  useEffect(() => {
    if (!editor) return

    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.ProseMirror pre')

      codeBlocks.forEach((block) => {
        if (block.querySelector('.copy-code-button')) return

        const button = document.createElement('button')
        button.className = 'copy-code-button'
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
        button.title = 'Copy code'

        button.onclick = async (e) => {
          e.preventDefault()
          const code = block.querySelector('code')
          if (code) {
            try {
              await navigator.clipboard.writeText(code.textContent)
              toast.success('Code copied!')
            } catch (err) {
              toast.error('Failed to copy')
            }
          }
        }

        block.appendChild(button)
      })
    }

    const timeoutId = setTimeout(addCopyButtons, 100)
    return () => clearTimeout(timeoutId)
  }, [editor?.state.doc.content])

  useEffect(() => {
    if (!editor) return

    const checkAndUploadBase64Images = async () => {
      const html = editor.getHTML()
      const base64ImageRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]+"/g
      const matches = html.match(base64ImageRegex)

      if (!matches || matches.length === 0) return
      if (isProcessingImages) return

      setIsProcessingImages(true)
      const loadingToast = toast.loading(`Uploading ${matches.length} image(s)...`)

      try {
        let updatedHtml = html
        let uploadedCount = 0

        for (const match of matches) {
          const srcMatch = match.match(/src="([^"]+)"/)
          if (!srcMatch) continue

          const base64Src = srcMatch[1]
          const cloudinaryUrl = await uploadBase64Image(base64Src)

          if (cloudinaryUrl) {
            updatedHtml = updatedHtml.replace(base64Src, cloudinaryUrl)
            uploadedCount++
          }
        }

        if (uploadedCount > 0) {
          editor.commands.setContent(updatedHtml)
          toast.success(`${uploadedCount} image(s) uploaded!`, { id: loadingToast })
        } else {
          toast.error('Failed to upload images', { id: loadingToast })
        }
      } catch (error) {
        console.error('Error processing images:', error)
        toast.error('Failed to process images', { id: loadingToast })
      } finally {
        setIsProcessingImages(false)
      }
    }

    const timeoutId = setTimeout(checkAndUploadBase64Images, 500)
    return () => clearTimeout(timeoutId)
  }, [editor?.state.doc.content])

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[400px] max-h-[600px] overflow-y-auto"
      />
      <div className="border-t border-border p-2 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">✨ Word Support:</span> Paste tables, colored text, highlights from Word! •
          Copy from Excel/Word and it will work! •
          Use toolbar to create tables manually
        </p>
      </div>

      <style jsx global>{`
        /* Table Styling */
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5rem 0;
          overflow: hidden;
        }

        .ProseMirror td,
        .ProseMirror th {
          min-width: 1em;
          border: 2px solid var(--border);
          padding: 0.5rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }

        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: var(--muted);
        }

        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }

        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: var(--primary);
          pointer-events: none;
        }

        /* Code Block Styling */
        .ProseMirror pre {
          position: relative;
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-radius: 0.5rem;
          padding: 1rem;
          padding-top: 2.5rem;
          margin: 1rem 0;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          max-height: 500px;
          border: 1px solid #334155;
        }
        
        .ProseMirror pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          white-space: pre !important;
        }
        
        .copy-code-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.5rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #475569;
          border-radius: 0.375rem;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }
        
        .copy-code-button:hover {
          background: #475569;
          transform: scale(1.05);
        }

        /* Highlight colors */
        .ProseMirror mark {
          background-color: #fef08a;
          padding: 0.125rem 0;
          border-radius: 0.125rem;
        }
      `}</style>
    </div>
  )
}
