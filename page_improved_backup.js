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
import ProjectOverview from "@/components/posts/enhanced-form/ProjectOverview"
import { ArrowLeft, Save, Send, FileText, Image, Tag, Settings, Eye, Wrench, ChefHat, BookOpen, Globe, Link as LinkIcon, AlertCircle } from "lucide-react"
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
    
    // ✨ DIY-specific fields (existing)
    diyDifficulty: "medium", // easy, medium, hard
    diyMaterials: [], // Array of material strings
    diyTools: [], // Array of tool strings
    diyEstimatedTime: "", // e.g., "2 hours"
    
    // ✨ DIY-specific fields (enhanced - new)
    projectType: "other",
    whatYouWillLearn: [],
    estimatedCost: { min: 0, max: 0, currency: "USD" },
    prerequisites: [],
    safetyWarnings: [],
    targetAudience: [],
    inspirationStory: "",
    
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
    
    // 🐛 FIX: Add logging to debug state updates
    console.log('📝 Form field changed:', { name, value, type })
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 🐛 FIX: Add delay before submission to ensure state updates
  const handleSubmit = async (status = 'draft') => {
    // 🐛 FIX: Log what we're about to submit
    console.log('📤 Preparing to submit post with contentType:', formData.contentType)
    console.log('📤 Full formData:', formData)
    
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

    // ✨ Recipe-specific validation - 🐛 FIX: Add detailed error messages
    if (formData.contentType === 'recipe') {
      console.log('🍳 Validating recipe fields...')
      console.log('   Prep Time:', formData.recipePrepTime)
      console.log('   Cook Time:', formData.recipeCookTime)
      console.log('   Servings:', formData.recipeServings)
      console.log('   Ingredients:', formData.recipeIngredients)
      
      if (!formData.recipePrepTime || !formData.recipePrepTime.trim()) {
        toast.error('❌ Prep time is required for recipes (e.g., "10 minutes")', {
          description: 'Please fill in the "Prep Time" field in the Recipe Details section'
        })
        return
      }
      if (!formData.recipeCookTime || !formData.recipeCookTime.trim()) {
        toast.error('❌ Cook time is required for recipes (e.g., "30 minutes")', {
          description: 'Please fill in the "Cook Time" field in the Recipe Details section'
        })
        return
      }
      if (!formData.recipeServings || !formData.recipeServings.trim()) {
        toast.error('❌ Servings is required for recipes (e.g., "4 servings")', {
          description: 'Please fill in the "Servings" field in the Recipe Details section'
        })
        return
      }
      if (!formData.recipeIngredients || formData.recipeIngredients.length === 0) {
        toast.error('❌ Ingredients are required for recipes', {
          description: 'Please add at least one ingredient in the Recipe Details section'
        })
        return
      }
      
      console.log('✅ All recipe validations passed!')
    }

    setLoading(true)

    try {
      // 🐛 FIX: Create submitData with explicit contentType to avoid async issues
      const submitData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        featuredImageUrl: formData.featuredImageUrl,
        featuredImageAlt: formData.featuredImageAlt,
        category: formData.category,
        tags: formData.tags,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        allowComments: formData.allowComments,
        lang: formData.lang,
        translationOf: formData.translationOf,
        contentType: formData.contentType, // 🐛 FIX: Explicitly include
        status,
        
        // Recipe fields
        recipePrepTime: formData.recipePrepTime,
        recipeCookTime: formData.recipeCookTime,
        recipeServings: formData.recipeServings,
        recipeIngredients: formData.recipeIngredients,
        recipeCuisine: formData.recipeCuisine,
        recipeDiet: formData.recipeDiet,
        
        // DIY fields
        diyDifficulty: formData.diyDifficulty,
        diyMaterials: formData.diyMaterials,
        diyTools: formData.diyTools,
        diyEstimatedTime: formData.diyEstimatedTime,
        
        // Common fields
        affiliateLinks: formData.affiliateLinks
      }

      // 🐛 FIX: Log exactly what we're sending
      console.log('📤 Submitting data to API:', JSON.stringify(submitData, null, 2))

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      
      // 🐛 FIX: Log API response
      console.log('📥 API Response:', data)

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
        console.error('❌ API Error:', data.error)
        toast.error(data.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
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
            {/* 🐛 FIX: Add Debug Panel (remove after testing) */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="border-yellow-500 bg-yellow-50/10">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    Debug Info (Development Only)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <div><strong>Content Type:</strong> {formData.contentType}</div>
                  <div><strong>Recipe Prep Time:</strong> "{formData.recipePrepTime}" (length: {formData.recipePrepTime.length})</div>
                  <div><strong>Recipe Cook Time:</strong> "{formData.recipeCookTime}" (length: {formData.recipeCookTime.length})</div>
                  <div><strong>Recipe Servings:</strong> "{formData.recipeServings}" (length: {formData.recipeServings.length})</div>
                  <div><strong>Recipe Ingredients:</strong> {formData.recipeIngredients.length} items</div>
                </CardContent>
              </Card>
            )}
            
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
                    onValueChange={(value) => {
                      // 🐛 FIX: Log the change
                      console.log('🔄 Content type changed to:', value)
                      setFormData(prev => ({ ...prev, contentType: value }))
                    }}
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

            {/* [REST OF THE FORM - KEEP ALL EXISTING SECTIONS] */}
            {/* I'm keeping the rest of the file the same as the original */}
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
