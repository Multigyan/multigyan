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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EnhancedRichTextEditor from "@/components/editor/EnhancedRichTextEditor"
import FeaturedImageUploader from "@/components/blog/FeaturedImageUploader"
import FlexibleTagInput from "@/components/blog/FlexibleTagInput"
import CategorySelector from "@/components/blog/CategorySelector"
import BlogPostPreview from "@/components/blog/BlogPostPreview"
import { ArrowLeft, Save, Loader2, Eye, User, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function EditPostPage({ params }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([]) // ✅ NEW: Store all authors
  const [postId, setPostId] = useState(null)
  const [originalAuthor, setOriginalAuthor] = useState(null) // ✅ NEW: Track original author
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
    allowComments: true,
    isFeatured: false,
    author: "",
    editReason: ""
  })
  const [hasLongTags, setHasLongTags] = useState(false)
  const [removedTags, setRemovedTags] = useState([])

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
        const promises = [
          fetch('/api/categories?includeCounts=true'), // ✅ Get accurate post counts
          fetch(`/api/posts/${postId}`)
        ]

        // ✅ NEW: Fetch authors if user is admin
        if (session?.user?.role === 'admin') {
          promises.push(fetch('/api/admin/users'))
        }

        const responses = await Promise.all(promises)
        const [categoriesRes, postRes, authorsRes] = responses

        const categoriesData = await categoriesRes.json()
        const postData = await postRes.json()

        if (categoriesRes.ok) {
          setCategories(categoriesData.categories || [])
        }

        // ✅ NEW: Load authors for admin
        if (authorsRes && authorsRes.ok) {
          const authorsData = await authorsRes.json()
          setAuthors(authorsData.users || [])
        }

        if (postRes.ok) {
          const post = postData.post || postData
          setOriginalAuthor(post.author?._id || post.author)
          
          // Filter out tags longer than 30 characters
          const allTags = post.tags || []
          const validTags = allTags.filter(tag => tag.length <= 30)
          const longTags = allTags.filter(tag => tag.length > 30)
          
          if (longTags.length > 0) {
            setHasLongTags(true)
            setRemovedTags(longTags)
            console.log('Warning: Post has long tags that will be removed:', longTags)
          }
          
          setFormData({
            title: post.title || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            featuredImageUrl: post.featuredImageUrl || "",
            featuredImageAlt: post.featuredImageAlt || "",
            category: post.category?._id || "",
            tags: validTags,
            seoTitle: post.seoTitle || "",
            seoDescription: post.seoDescription || "",
            allowComments: post.allowComments !== false,
            isFeatured: post.isFeatured || false,
            author: post.author?._id || post.author || "",
            editReason: ""
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
  }, [postId, router, session])

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

    // ✅ Validate featured image URL if provided
    if (formData.featuredImageUrl && !formData.featuredImageUrl.startsWith('http')) {
      toast.error('Featured image URL must be a valid HTTP/HTTPS URL')
      return
    }

    // Check if admin is editing another author's post
    const isEditingOtherAuthor = session?.user?.role === 'admin' && 
                                  formData.author && 
                                  formData.author !== session.user.id
    
    if (isEditingOtherAuthor && !formData.editReason.trim()) {
      toast.error('Please provide a reason for editing this post')
      return
    }

    // ✅ SANITIZE DATA: Remove/fix invalid data before sending
    const longTags = formData.tags.filter(tag => tag && tag.length > 30)
    const sanitizedTags = formData.tags.filter(tag => tag && typeof tag === 'string' && tag.length > 0 && tag.length <= 30)
    
    if (longTags.length > 0) {
      console.log('Removed long tags:', longTags)
      toast.warning(`Removed ${longTags.length} long tag(s): ${longTags.join(', ')}`, {
        duration: 5000
      })
      
      // Update form state to reflect removed tags
      setFormData(prev => ({ ...prev, tags: sanitizedTags }))
    }

    // Prepare sanitized data
    const sanitizedData = {}
    
    // Only include fields that have values
    if (formData.title) sanitizedData.title = formData.title.trim()
    if (formData.excerpt) sanitizedData.excerpt = formData.excerpt.trim()
    if (formData.content) sanitizedData.content = formData.content.trim()
    if (formData.featuredImageUrl) sanitizedData.featuredImageUrl = formData.featuredImageUrl
    if (formData.featuredImageAlt) sanitizedData.featuredImageAlt = formData.featuredImageAlt
    if (formData.category) sanitizedData.category = formData.category
    if (formData.author) sanitizedData.author = formData.author
    if (formData.editReason) sanitizedData.editReason = formData.editReason.trim()
    
    // Add sanitized tags
    sanitizedData.tags = sanitizedTags
    
    // Add SEO fields (truncated)
    sanitizedData.seoTitle = formData.seoTitle.slice(0, 60)
    sanitizedData.seoDescription = formData.seoDescription.slice(0, 160)
    
    // Add boolean fields
    sanitizedData.allowComments = formData.allowComments
    sanitizedData.isFeatured = formData.isFeatured

    setLoading(true)

    try {
      console.log('Submitting sanitized data:', sanitizedData)
      console.log('Tags being sent:', sanitizedData.tags)
      console.log('Tag lengths:', sanitizedData.tags.map(tag => `${tag}: ${tag.length} chars`))
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      })

      console.log('Response status:', response.status, response.statusText)
      
      const data = await response.json()
      
      console.log('API Response:', data)
      console.log('Response OK?', response.ok)

      if (response.ok) {
        // ✅ Show detailed success message
        const updatedFields = []
        if (sanitizedData.title) updatedFields.push('title')
        if (sanitizedData.featuredImageUrl) updatedFields.push('featured image')
        if (sanitizedData.content) updatedFields.push('content')
        
        toast.success(`Post updated successfully!${updatedFields.length > 0 ? ` Updated: ${updatedFields.join(', ')}` : ''}`, {
          description: formData.featuredImageUrl ? 'Featured image has been updated ✅' : undefined
        })
        
        // ✅ Optional: Show the new featured image in a toast
        if (formData.featuredImageUrl && formData.featuredImageUrl !== data.post?.featuredImageUrl) {
          setTimeout(() => {
            toast.info('Featured image successfully updated! View it on the published post.', {
              duration: 5000
            })
          }, 1000)
        }
        
        router.push('/dashboard/posts')
      } else {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        
        // Show specific error message or generic one
        const errorMessage = data.error || data.message || `Server error: ${response.status}`
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Submit Error:', error)
      toast.error('Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  function getCategoryName() {
    const category = categories.find(cat => cat._id === formData.category)
    return category?.name || ''
  }

  function getAuthorName() {
    const author = authors.find(a => a._id === formData.author)
    return author?.name || session?.user?.name || ''
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

        {/* Warning for long tags from old database */}
        {hasLongTags && removedTags.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                <AlertTriangle className="h-5 w-5" />
                Invalid Tags Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                This post contains {removedTags.length} tag(s) longer than 30 characters that will be automatically removed when you save:
              </p>
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-md space-y-1">
                {removedTags.map((tag, i) => (
                  <div key={i} className="text-sm font-mono text-red-900 dark:text-red-100">
                    • {tag} <span className="text-red-600 dark:text-red-400">({tag.length} chars)</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-3">
                ⚠️ These tags exceed the 30-character limit and will be removed to allow saving.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                {formData.featuredImageUrl && (
                  <CardDescription className="mt-2">
                    ✅ Image uploaded successfully! Save your changes to update the post.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <FeaturedImageUploader
                  value={formData.featuredImageUrl}
                  onChange={(url) => {
                    setFormData(prev => ({ ...prev, featuredImageUrl: url }))
                    // Show immediate feedback
                    toast.success('Featured image updated! Click "Update" to save changes.', {
                      duration: 3000
                    })
                  }}
                  onAltTextChange={(alt) => setFormData(prev => ({ ...prev, featuredImageAlt: alt }))}
                  altText={formData.featuredImageAlt}
                />
                
                {/* ✅ Show current image preview */}
                {formData.featuredImageUrl && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      Featured image is ready
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Click &#34;Update&#34; button to save this image to your post
                    </p>
                  </div>
                )}
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
                <CardDescription>
                  Optimize your post for search engines
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
                    className="mt-1"
                    maxLength={60}
                    placeholder="Leave empty to use post title"
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
                    placeholder="Leave empty to use post excerpt"
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

            {/* ✅ NEW: Author Selector (Admin Only) */}
            {session?.user?.role === 'admin' && authors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Post Author
                  </CardTitle>
                  <CardDescription>
                    Change the author of this post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.author}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, author: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {authors.map((author) => (
                        <SelectItem key={author._id} value={author._id}>
                          <div className="flex items-center gap-2">
                            <span>{author.name}</span>
                            {author._id === originalAuthor && (
                              <span className="text-xs text-muted-foreground">(Original)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.author !== originalAuthor && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Changing author will transfer post ownership
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ✅ NEW: Edit Reason (Admin editing another author's post) */}
            {session?.user?.role === 'admin' && 
             formData.author && 
             formData.author !== session.user.id && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-100">Edit Reason Required</CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    Provide a reason for editing this author&apos;s post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="editReason"
                    name="editReason"
                    value={formData.editReason}
                    onChange={handleInputChange}
                    placeholder="e.g., Fixed typos, Updated outdated information, Improved SEO..."
                    rows={3}
                    maxLength={500}
                    className="bg-white dark:bg-gray-900"
                  />
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    The author will be notified of your changes and the reason provided.
                  </p>
                </CardContent>
              </Card>
            )}

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
                <CardDescription>
                  Add relevant tags to help readers find your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlexibleTagInput
                  label=""
                  tags={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  maxTags={10}
                  placeholder="Add tags (comma, space, or press Enter)"
                  description=""
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowComments">Allow Comments</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Let readers comment on this post
                    </p>
                  </div>
                  <Switch
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, allowComments: checked }))
                    }
                  />
                </div>

                {/* ✅ ADD: Featured Post Toggle (Admin Only) */}
                {session?.user?.role === 'admin' && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Label htmlFor="isFeatured" className="flex items-center gap-2">
                        <span className="text-amber-600">⭐</span>
                        Featured Post
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Show this post in featured section
                      </p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isFeatured: checked }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BlogPostPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        postData={previewData}
        author={{ name: getAuthorName() }}
      />
    </>
  )
}
