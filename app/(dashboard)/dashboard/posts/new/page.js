"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import EnhancedRichTextEditor from "@/components/editor/EnhancedRichTextEditor"
import FeaturedImageUploader from "@/components/blog/FeaturedImageUploader"
import FlexibleTagInput from "@/components/blog/FlexibleTagInput"
import CategorySelector from "@/components/blog/CategorySelector"
import BlogPostPreview from "@/components/blog/BlogPostPreview"
import { ArrowLeft, Save, Send, FileText, Image, Tag, Settings, Eye } from "lucide-react"
import { toast } from "sonner"
import { generateSlug } from "@/lib/helpers"

export default function NewPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImageUrl: "",
    featuredImageAlt: "",
    category: "",
    tags: [],
    seoTitle: "",
    seoDescription: "",
    allowComments: true
  })

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (status = 'draft') => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Post title is required')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Post content is required')
      return
    }

    if (!formData.category) {
      toast.error('Please select a category')
      return
    }

    if (!formData.featuredImageUrl) {
      toast.error('Featured image is required for better engagement')
      return
    }

    if (!formData.featuredImageAlt) {
      toast.error('Please add alt text for the featured image (helps with accessibility and SEO)')
      return
    }

    if (formData.tags.length === 0) {
      toast.error('Please add at least one tag')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        status
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = status === 'draft' 
          ? 'Post saved as draft successfully'
          : session?.user.role === 'admin' 
            ? 'Post published successfully'
            : 'Post submitted for review successfully'
        
        toast.success(successMessage)
        router.push('/dashboard/posts')
      } else {
        toast.error(data.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  // Get category name for preview
  const getCategoryName = () => {
    const category = categories.find(cat => cat._id === formData.category)
    return category?.name || ''
  }

  // Prepare preview data
  const previewData = {
    ...formData,
    categoryName: getCategoryName()
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/posts">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
              <p className="text-muted-foreground">Write and publish a new blog post</p>
            </div>
          </div>
          
          {/* Preview Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={!formData.title && !formData.content}
          >
            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
            Preview Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Image Section - Above Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" aria-hidden="true" />
                  Featured Image
                </CardTitle>
                <CardDescription>
                  Upload a high-quality image (auto-converts to WebP, supports Google Drive)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeaturedImageUploader
                  value={formData.featuredImageUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, featuredImageUrl: url }))}
                  onAltTextChange={(alt) => setFormData(prev => ({ ...prev, featuredImageAlt: alt }))}
                  altText={formData.featuredImageAlt}
                  maxSizeInMB={10}
                  allowedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                  placeholder="Upload featured image for your blog post..."
                  enableCropping={true}
                  aspectRatio={16 / 9}
                  enableWebPConversion={true}
                  enableOptimization={true}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  Post Content
                </CardTitle>
                <CardDescription>
                  Enter the main content for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">
                    Post Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter an engaging post title..."
                    className="mt-1 text-lg"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/100 characters • Make it compelling and clear
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Write a brief summary of your post (will be auto-generated if left empty)"
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This appears in post previews and search results (recommended: 120-160 characters)
                  </p>
                </div>

                {/* Content Editor */}
                <div>
                  <Label htmlFor="content">
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Write with rich formatting • Images auto-convert to WebP • Supports Google Drive URLs • Embed YouTube videos
                  </p>
                  <div className="mt-1">
                    <EnhancedRichTextEditor
                      content={formData.content}
                      onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                      placeholder="Start writing your amazing content here... 

You can:
• Format text with bold, italic, underline
• Add all 6 heading levels (H1-H6)
• Insert images (drag & drop or URL) - auto-converts to WebP!
• Embed YouTube videos
• Use Google Drive image links
• Create code blocks with syntax highlighting
• Align text (left, center, right, justify)
• Add lists, quotes, and more!

Just start typing and use the toolbar above!"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" aria-hidden="true" />
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Optimize your post for search engines (optional but recommended)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="Custom title for search results"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to use the post title • Ideal length: 50-60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="Description for search results"
                    className="mt-1"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to use the excerpt • Ideal length: 120-160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
                <CardDescription>
                  Save your post or submit for publication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleSubmit('draft')} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  Save as Draft
                </Button>
                
                <Button 
                  onClick={() => handleSubmit('pending_review')} 
                  className="w-full"
                  disabled={loading}
                >
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  {session?.user.role === 'admin' ? 'Publish Now' : 'Submit for Review'}
                </Button>

                {loading && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Saving...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" aria-hidden="true" />
                  Category
                </CardTitle>
                <CardDescription>
                  Choose a category for your post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategorySelector
                  value={formData.category}
                  onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                  label=""
                  required={true}
                  allowCreate={session?.user.role === 'admin'}
                />
              </CardContent>
            </Card>

            {/* Tags Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" aria-hidden="true" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Add relevant tags to help readers find your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlexibleTagInput
                  tags={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  maxTags={10}
                  label=""
                  placeholder="Type tags and press Enter, use commas, or #hashtags"
                  description="Add 3-5 relevant tags for best results"
                />
              </CardContent>
            </Card>

            {/* Comment Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Discussion Settings</CardTitle>
                <CardDescription>
                  Control how readers can interact with your post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="allowComments" className="flex flex-col space-y-1">
                    <span>Allow Comments</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Let readers comment on this post
                    </span>
                  </Label>
                  <Switch
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, allowComments: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-sm">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>✓ Use a compelling featured image</li>
                  <li>✓ Images auto-convert to WebP for faster loading</li>
                  <li>✓ Write a clear, engaging title</li>
                  <li>✓ Break content into sections with headings</li>
                  <li>✓ Add images and YouTube videos</li>
                  <li>✓ Use code blocks for technical content</li>
                  <li>✓ Add 3-5 relevant tags</li>
                  <li>✓ Write alt text for all images</li>
                  <li>✓ Preview before publishing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <BlogPostPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        postData={previewData}
        author={session?.user}
      />
    </>
  )
}
