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
import RichTextEditor from "@/components/editor/RichTextEditor"
import ImageUploader from "@/components/upload/ImageUploader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Send, FileText, Image, Tag } from "lucide-react"
import { toast } from "sonner"
import { generateSlug } from "@/lib/helpers"

export default function NewPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImageUrl: "",
    featuredImageAlt: "",
    category: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    allowComments: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
      } else {
        toast.error('Failed to load categories')
      }
    } catch (error) {
      toast.error('Failed to load categories')
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

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
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
      toast.error('Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/posts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
          <p className="text-muted-foreground">Write and publish a new blog post</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Post Content
              </CardTitle>
              <CardDescription>
                Enter the main content for your blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging post title..."
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Write a brief summary of your post (optional - will be auto-generated if left empty)"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be shown in post previews and search results
                </p>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                    placeholder="Write your post content here..."
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rich text editor with formatting, links, and images
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your post for search engines (optional)
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
                  Leave empty to use the post title
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
                  Leave empty to use the excerpt
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
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
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              
              <Button 
                onClick={() => handleSubmit('pending_review')} 
                className="w-full"
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
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

          {/* Categories and Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categories & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Featured Image
              </CardTitle>
              <CardDescription>
                Upload an image or provide an image URL from any source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={formData.featuredImageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, featuredImageUrl: url }))}
                onAltTextChange={(alt) => setFormData(prev => ({ ...prev, featuredImageAlt: alt }))}
                altText={formData.featuredImageAlt}
                maxSizeInMB={10}
                allowedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
                placeholder="Upload or enter image URL for your post..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}