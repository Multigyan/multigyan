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
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react"
import { toast } from "sonner"

export default function EditPostPage({ params }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [categories, setCategories] = useState([])
  const [postId, setPostId] = useState(null)
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

  useEffect(() => {
    async function init() {
      const resolvedParams = await params
      setPostId(resolvedParams.id)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!postId) return
    
    async function loadData() {
      try {
        const [categoriesRes, postRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/posts/${postId}`)
        ])

        const categoriesData = await categoriesRes.json()
        const postData = await postRes.json()

        if (categoriesRes.ok) {
          setCategories(categoriesData.categories || [])
        }

        if (postRes.ok) {
          const post = postData.post || postData
          setFormData({
            title: post.title || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            featuredImageUrl: post.featuredImageUrl || "",
            featuredImageAlt: post.featuredImageAlt || "",
            category: post.category?._id || "",
            tags: post.tags || [],
            seoTitle: post.seoTitle || "",
            seoDescription: post.seoDescription || "",
            allowComments: post.allowComments !== false
          })
        } else {
          toast.error(postData.error || 'Failed to load post')
          router.push('/dashboard/posts')
        }
      } catch (error) {
        toast.error('Failed to load post')
        router.push('/dashboard/posts')
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [postId, router])

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSubmit() {
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
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Post updated successfully')
        router.push('/dashboard/posts')
      } else {
        toast.error(data.error || 'Failed to update post')
      }
    } catch (error) {
      toast.error('Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  function getCategoryName() {
    const category = categories.find(cat => cat._id === formData.category)
    return category?.name || ''
  }

  const previewData = {
    ...formData,
    categoryName: getCategoryName()
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/posts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Post</h1>
              <p className="text-muted-foreground">Update your blog post</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={!formData.title && !formData.content}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FeaturedImageUploader
                  value={formData.featuredImageUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, featuredImageUrl: url }))}
                  onAltTextChange={(alt) => setFormData(prev => ({ ...prev, featuredImageAlt: alt }))}
                  altText={formData.featuredImageAlt}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
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
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <div className="mt-1">
                    <EnhancedRichTextEditor
                      content={formData.content}
                      onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className="mt-1"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    className="mt-1"
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Post</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategorySelector
                  value={formData.category}
                  onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                  required={true}
                  allowCreate={session?.user.role === 'admin'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <FlexibleTagInput
                  tags={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  maxTags={10}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowComments">Allow Comments</Label>
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
          </div>
        </div>
      </div>

      <BlogPostPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        postData={previewData}
        author={session?.user}
      />
    </>
  )
}
