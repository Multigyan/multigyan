"use client"

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2, FolderPlus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

/**
 * CategorySelector Component
 * 
 * Features:
 * - Select from existing categories
 * - Add new categories on the fly
 * - Refresh categories list
 * - Shows category count
 */

export default function CategorySelector({ 
  value, 
  onChange, 
  label = "Category",
  required = true,
  allowCreate = true  // Allow creating new categories (admin only)
}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true)
    try {
      // ✅ FIX: Add includeCounts=true to get accurate post counts
      const response = await fetch('/api/categories?includeCounts=true')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        toast.error('Failed to load categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  // Handle name change and auto-generate slug
  const handleNameChange = (e) => {
    const name = e.target.value
    setNewCategoryName(name)
    
    // Auto-generate slug
    if (name) {
      setNewCategorySlug(generateSlug(name))
    } else {
      setNewCategorySlug('')
    }
  }

  // Create new category
  const handleCreateCategory = async () => {
    // Validation
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    if (!newCategorySlug.trim()) {
      toast.error('Category slug is required')
      return
    }

    // Check for duplicate names
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast.error('A category with this name already exists')
      return
    }

    // Check for duplicate slugs
    if (categories.some(cat => cat.slug === newCategorySlug)) {
      toast.error('A category with this slug already exists')
      return
    }

    setCreating(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategorySlug,
          description: newCategoryDescription || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Category created successfully!')
        
        // Refresh categories list
        await fetchCategories()
        
        // Auto-select the newly created category
        onChange(data.category._id)
        
        // Close dialog and reset form
        setIsDialogOpen(false)
        setNewCategoryName('')
        setNewCategorySlug('')
        setNewCategoryDescription('')
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      {/* Category Selector */}
      <div className="flex gap-2">
        <Select 
          value={value} 
          onValueChange={onChange}
          disabled={loading || categories.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? "Loading categories..." : "Select a category"} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({category.postCount || category.postsCount || 0} posts)
                  </span>
                </div>
              </SelectItem>
            ))}
            
            {categories.length === 0 && !loading && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No categories available
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={fetchCategories}
          disabled={loading}
          title="Refresh categories"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        {/* Add Category Button */}
        {allowCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Create new category"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  Create New Category
                </DialogTitle>
                <DialogDescription>
                  Add a new category for organizing your blog posts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Category Name */}
                <div>
                  <Label htmlFor="categoryName">
                    Category Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="categoryName"
                    placeholder="e.g., Technology, Travel, Cooking"
                    value={newCategoryName}
                    onChange={handleNameChange}
                    disabled={creating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose a clear, descriptive name for your category
                  </p>
                </div>

                {/* Category Slug */}
                <div>
                  <Label htmlFor="categorySlug">
                    Category Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="categorySlug"
                    placeholder="e.g., technology, travel, cooking"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    disabled={creating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL-friendly version (auto-generated, but you can edit)
                  </p>
                </div>

                {/* Category Description */}
                <div>
                  <Label htmlFor="categoryDescription">Description (Optional)</Label>
                  <Input
                    id="categoryDescription"
                    placeholder="Brief description of this category"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    disabled={creating}
                  />
                </div>

                {/* Preview */}
                {newCategoryName && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
                    <p className="text-sm font-semibold">{newCategoryName}</p>
                    <p className="text-xs text-muted-foreground">URL: /category/{newCategorySlug}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleCreateCategory}
                    disabled={creating || !newCategoryName.trim()}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Category
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setNewCategoryName('')
                      setNewCategorySlug('')
                      setNewCategoryDescription('')
                    }}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        {categories.length > 0 
          ? `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} available`
          : 'No categories yet - create your first one!'}
      </p>
    </div>
  )
}
