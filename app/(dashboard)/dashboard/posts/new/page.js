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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import EnhancedRichTextEditor from "@/components/editor/EnhancedRichTextEditor"
import FeaturedImageUploader from "@/components/blog/FeaturedImageUploader"
import FlexibleTagInput from "@/components/blog/FlexibleTagInput"
import CategorySelector from "@/components/blog/CategorySelector"
import BlogPostPreview from "@/components/blog/BlogPostPreview"
import DynamicListInput from "@/components/blog/DynamicListInput"
import AffiliateLinkManager from "@/components/blog/AffiliateLinkManager"
import { ArrowLeft, Save, Send, FileText, Image, Tag, Settings, Eye, Wrench, ChefHat, BookOpen, Globe, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { generateSlug } from "@/lib/helpers"

export default function NewPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [categories, setCategories] = useState([])
  const [allPosts, setAllPosts] = useState([]) // For translation linking
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
    
    // ✨ Content Settings
    contentType: "blog", // blog, diy, recipe
    lang: "en", // en, hi
    translationOf: "", // Link to alternate language version
    
    // ✨ DIY-specific fields
    diyDifficulty: "medium", // easy, medium, hard
    diyMaterials: [], // Array of material strings
    diyTools: [], // Array of tool strings
    diyEstimatedTime: "", // e.g., "2 hours"
    
    // ✨ Recipe-specific fields
    recipePrepTime: "", // e.g., "15 mins"
    recipeCookTime: "", // e.g., "30 mins"
    recipeServings: "", // e.g., "4 servings"
    recipeIngredients: [], // Array of ingredient strings
    recipeCuisine: "", // e.g., "Indian", "Italian"
    recipeDiet: [], // e.g., ["vegetarian", "gluten-free"]
    
    // ✨ Common fields (for both DIY & Recipe)
    affiliateLinks: [], // Array of {name, url, description}
  })

  // Fetch categories and posts on mount
  useEffect(() => {
    fetchCategories()
    fetchAllPosts()
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

  const fetchAllPosts = async () => {
    try {
      const response = await fetch('/api/posts?status=published&limit=1000')
      const data = await response.json()
      
      if (response.ok) {
        setAllPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  // ✨ Auto-add content type tag when content type changes
  useEffect(() => {
    if (formData.contentType === 'diy') {
      // Ensure "diy" tag is present
      if (!formData.tags.includes('diy')) {
        setFormData(prev => ({
          ...prev,
          tags: ['diy', ...prev.tags.filter(t => t !== 'recipe')]
        }))
      }
    } else if (formData.contentType === 'recipe') {
      // Ensure "recipe" tag is present
      if (!formData.tags.includes('recipe')) {
        setFormData(prev => ({
          ...prev,
          tags: ['recipe', ...prev.tags.filter(t => t !== 'diy')]
        }))
      }
    } else {
      // Remove diy and recipe tags for regular blog posts
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== 'diy' && t !== 'recipe')
      }))
    }
  }, [formData.contentType])

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

    // ✨ DIY-specific validation
    if (formData.contentType === 'diy') {
      if (!formData.diyEstimatedTime.trim()) {
        toast.error('Estimated time is required for DIY projects')
        return
      }
      if (formData.diyMaterials.length === 0) {
        toast.error('Please add at least one material for your DIY project')
        return
      }
    }

    // ✨ Recipe-specific validation
    if (formData.contentType === 'recipe') {
      if (!formData.recipePrepTime.trim()) {
        toast.error('Prep time is required for recipes')
        return
      }
      if (!formData.recipeCookTime.trim()) {
        toast.error('Cook time is required for recipes')
        return
      }
      if (!formData.recipeServings.trim()) {
        toast.error('Servings is required for recipes')
        return
      }
      if (formData.recipeIngredients.length === 0) {
        toast.error('Please add at least one ingredient for your recipe')
        return
      }
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
        const contentTypeLabel = formData.contentType === 'diy' ? 'DIY tutorial' : formData.contentType === 'recipe' ? 'Recipe' : 'Post'
        
        // ✅ Show appropriate message based on status and user role
        if (status === 'draft') {
          // Saved as draft
          toast.success(`${contentTypeLabel} saved as draft! 💾`, {
            description: 'You can continue editing and publish it later.',
            duration: 4000
          })
        } else if (session?.user.role === 'admin') {
          // Admin: Direct publish
          toast.success(`${contentTypeLabel} published successfully! 🎉`, {
            description: 'Your post is now live and visible to all readers.',
            duration: 4000
          })
        } else {
          // Regular user: Pending review
          toast.success(`${contentTypeLabel} submitted successfully! 📝`, {
            description: 'Your post is now waiting for admin review and approval. This typically takes up to 24 hours. You\'ll be notified once it\'s approved.',
            duration: 6000
          })
        }
        
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

  // Filter posts for translation linking (opposite language only)
  const translationPosts = allPosts.filter(post => post.lang !== formData.lang)

  // Get content type icon
  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'diy': return <Wrench className="h-4 w-4" />
      case 'recipe': return <ChefHat className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  // Get content type label
  const getContentTypeLabel = (type) => {
    switch(type) {
      case 'diy': return 'DIY Tutorial'
      case 'recipe': return 'Recipe'
      default: return 'Blog Post'
    }
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
              <p className="text-muted-foreground">Write and publish a new blog post, DIY tutorial, or recipe</p>
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
            {/* ✨ NEW: Content Type & Language Selection */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Content Settings
                </CardTitle>
                <CardDescription>
                  Choose the type of content and language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Type Selector */}
                <div>
                  <Label htmlFor="contentType">
                    Content Type <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.contentType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Blog Post (Regular Article)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="diy">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-orange-600" />
                          <span>DIY Tutorial (Creative Project)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recipe">
                        <div className="flex items-center gap-2">
                          <ChefHat className="h-4 w-4 text-green-600" />
                          <span>Recipe (Cooking Guide)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm">
                    {formData.contentType === 'blog' && (
                      <p>📝 Regular blog posts appear in the main blog section</p>
                    )}
                    {formData.contentType === 'diy' && (
                      <p>🎨 DIY tutorials appear in both blog and <strong className="text-orange-600">/diy</strong> section</p>
                    )}
                    {formData.contentType === 'recipe' && (
                      <p>🍳 Recipes appear in both blog and <strong className="text-green-600">/recipe</strong> section</p>
                    )}
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <Label htmlFor="language">
                    Language <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.lang} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, lang: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hi">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Hindi (हिंदी)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose the primary language of this content
                  </p>
                </div>

                {/* Translation Link */}
                <div>
                  <Label htmlFor="translationOf">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Link to Translation (Optional)
                    </div>
                  </Label>
                  <Select 
                    value={formData.translationOf || "none"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, translationOf: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select the alternate language version..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No translation link</span>
                      </SelectItem>
                      {translationPosts.map(post => (
                        <SelectItem key={post._id} value={post._id}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {post.lang === 'en' ? '🇬🇧 EN' : '🇮🇳 HI'}
                            </span>
                            <span className="truncate max-w-xs">{post.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    If this is a translation of an existing post, link them together. 
                    This enables the language switcher on your posts.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" aria-hidden="true" alt="" />
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
                  Enter the main content for your {getContentTypeLabel(formData.contentType).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">
                    {getContentTypeLabel(formData.contentType)} Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={
                      formData.contentType === 'diy' 
                        ? "e.g., How to Make Beautiful Paper Flowers" 
                        : formData.contentType === 'recipe'
                        ? "e.g., Easy Butter Chicken Recipe"
                        : "Enter an engaging post title..."
                    }
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
                    placeholder={
                      formData.contentType === 'diy'
                        ? "Brief description of what readers will learn to make..."
                        : formData.contentType === 'recipe'
                        ? "Brief description of the dish and what makes it special..."
                        : "Write a brief summary of your post (will be auto-generated if left empty)"
                    }
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
                      placeholder={
                        formData.contentType === 'diy'
                          ? "Start writing your DIY tutorial...\n\nSuggested structure:\n• Materials needed\n• Tools required\n• Step-by-step instructions\n• Tips and tricks\n• Final result"
                          : formData.contentType === 'recipe'
                          ? "Start writing your recipe...\n\nSuggested structure:\n• Ingredients list\n• Preparation time\n• Cooking time\n• Step-by-step instructions\n• Serving suggestions"
                          : "Start writing your amazing content here..."
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✨ DIY-SPECIFIC FIELDS */}
            {formData.contentType === 'diy' && (
              <Card className="border-2 border-orange-500/30 bg-orange-50/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    DIY Project Details
                  </CardTitle>
                  <CardDescription>
                    Add specific details about your DIY project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Difficulty Level */}
                  <div>
                    <Label htmlFor="diyDifficulty">
                      Difficulty Level <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.diyDifficulty} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, diyDifficulty: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">●</span>
                            <span>Easy - Beginner Friendly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">●</span>
                            <span>Medium - Some Experience Needed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hard">
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">●</span>
                            <span>Hard - Advanced Skills Required</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Help readers assess if this project is right for their skill level
                    </p>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <Label htmlFor="diyEstimatedTime">
                      Estimated Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="diyEstimatedTime"
                      name="diyEstimatedTime"
                      value={formData.diyEstimatedTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 hours, 30 minutes, 1-2 days"
                      className="mt-1"
                      required={formData.contentType === 'diy'}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Include setup and drying/curing time if applicable
                    </p>
                  </div>

                  {/* Materials List */}
                  <DynamicListInput
                    label="Materials Needed *"
                    items={formData.diyMaterials}
                    onChange={(items) => setFormData(prev => ({ ...prev, diyMaterials: items }))}
                    placeholder="e.g., Acrylic paint (blue, white), Canvas 12x16, Paint brushes"
                    description="List all materials needed for this project. Be specific with quantities and sizes."
                  />

                  {/* Tools List */}
                  <DynamicListInput
                    label="Tools Required"
                    items={formData.diyTools}
                    onChange={(items) => setFormData(prev => ({ ...prev, diyTools: items }))}
                    placeholder="e.g., Scissors, Hot glue gun, Ruler, Pencil"
                    description="List tools readers will need. Include alternatives if possible."
                  />

                  {/* Affiliate Links */}
                  <AffiliateLinkManager
                    links={formData.affiliateLinks}
                    onChange={(links) => setFormData(prev => ({ ...prev, affiliateLinks: links }))}
                  />
                </CardContent>
              </Card>
            )}

            {/* ✨ RECIPE-SPECIFIC FIELDS */}
            {formData.contentType === 'recipe' && (
              <Card className="border-2 border-green-500/30 bg-green-50/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-green-600" />
                    Recipe Details
                  </CardTitle>
                  <CardDescription>
                    Add specific details about your recipe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Time Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Prep Time */}
                    <div>
                      <Label htmlFor="recipePrepTime">
                        Prep Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="recipePrepTime"
                        name="recipePrepTime"
                        value={formData.recipePrepTime}
                        onChange={handleInputChange}
                        placeholder="e.g., 15 mins"
                        className="mt-1"
                        required={formData.contentType === 'recipe'}
                      />
                    </div>

                    {/* Cook Time */}
                    <div>
                      <Label htmlFor="recipeCookTime">
                        Cook Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="recipeCookTime"
                        name="recipeCookTime"
                        value={formData.recipeCookTime}
                        onChange={handleInputChange}
                        placeholder="e.g., 30 mins"
                        className="mt-1"
                        required={formData.contentType === 'recipe'}
                      />
                    </div>

                    {/* Servings */}
                    <div>
                      <Label htmlFor="recipeServings">
                        Servings <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="recipeServings"
                        name="recipeServings"
                        value={formData.recipeServings}
                        onChange={handleInputChange}
                        placeholder="e.g., 4 servings"
                        className="mt-1"
                        required={formData.contentType === 'recipe'}
                      />
                    </div>
                  </div>

                  {/* Ingredients List */}
                  <DynamicListInput
                    label="Ingredients *"
                    items={formData.recipeIngredients}
                    onChange={(items) => setFormData(prev => ({ ...prev, recipeIngredients: items }))}
                    placeholder="e.g., 2 cups all-purpose flour, 1 tsp salt, 3 eggs"
                    description="List all ingredients with precise measurements. Add each ingredient separately."
                  />

                  {/* Cuisine Type */}
                  <div>
                    <Label htmlFor="recipeCuisine">
                      Cuisine Type
                    </Label>
                    <Select 
                      value={formData.recipeCuisine || "none"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, recipeCuisine: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select cuisine type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">Not specified</span>
                        </SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="thai">Thai</SelectItem>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                        <SelectItem value="fusion">Fusion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Helps readers filter by their favorite cuisine
                    </p>
                  </div>

                  {/* Diet Tags */}
                  <div>
                    <Label>Diet & Dietary Restrictions</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select all that apply to this recipe
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'low-carb'].map(diet => (
                        <label
                          key={diet}
                          className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                            formData.recipeDiet.includes(diet)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-input'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.recipeDiet.includes(diet)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  recipeDiet: [...prev.recipeDiet, diet]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  recipeDiet: prev.recipeDiet.filter(d => d !== diet)
                                }))
                              }
                            }}
                            className="sr-only"
                          />
                          <span className="text-sm capitalize">{diet.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Affiliate Links */}
                  <AffiliateLinkManager
                    links={formData.affiliateLinks}
                    onChange={(links) => setFormData(prev => ({ ...prev, affiliateLinks: links }))}
                  />
                </CardContent>
              </Card>
            )}

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
            {/* Current Selection Display */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getContentTypeIcon(formData.contentType)}
                  Current Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold">{getContentTypeLabel(formData.contentType)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-semibold">{formData.lang === 'en' ? '🇬🇧 English' : '🇮🇳 Hindi'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Will appear in:</span>
                  <span className="font-semibold">
                    {formData.contentType === 'blog' ? 'Blog' : formData.contentType === 'diy' ? 'Blog + DIY' : 'Blog + Recipe'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
                <CardDescription>
                  Save your {getContentTypeLabel(formData.contentType).toLowerCase()} or submit for publication
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
                {(formData.contentType === 'diy' || formData.contentType === 'recipe') && (
                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                    ℹ️ The "{formData.contentType}" tag is automatically added for {formData.contentType === 'diy' ? 'DIY tutorials' : 'recipes'}
                  </p>
                )}
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
                <CardTitle className="text-sm">
                  {formData.contentType === 'diy' && '🎨 DIY Tutorial Tips'}
                  {formData.contentType === 'recipe' && '🍳 Recipe Writing Tips'}
                  {formData.contentType === 'blog' && '✍️ Writing Tips'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-2">
                  {formData.contentType === 'diy' && (
                    <>
                      <li>✓ List all materials needed</li>
                      <li>✓ Include step-by-step photos</li>
                      <li>✓ Number each step clearly</li>
                      <li>✓ Add difficulty level in tags</li>
                      <li>✓ Estimate time required</li>
                      <li>✓ Include tips and tricks</li>
                      <li>✓ Show the final result</li>
                    </>
                  )}
                  {formData.contentType === 'recipe' && (
                    <>
                      <li>✓ List ingredients with quantities</li>
                      <li>✓ Include prep and cook time</li>
                      <li>✓ Number cooking steps</li>
                      <li>✓ Add serving size</li>
                      <li>✓ Include cooking tips</li>
                      <li>✓ Add nutrition info (optional)</li>
                      <li>✓ Show finished dish photo</li>
                    </>
                  )}
                  {formData.contentType === 'blog' && (
                    <>
                      <li>✓ Use a compelling featured image</li>
                      <li>✓ Write a clear, engaging title</li>
                      <li>✓ Break content into sections</li>
                      <li>✓ Add images and videos</li>
                      <li>✓ Use code blocks for technical content</li>
                      <li>✓ Add 3-5 relevant tags</li>
                      <li>✓ Preview before publishing</li>
                    </>
                  )}
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
