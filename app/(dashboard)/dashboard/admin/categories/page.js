"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Folder,
  Plus,
  Trash2,
  Edit,
  Merge,
  BookOpen,
  AlertTriangle,
  Loader2,
  Save,
  X,
  Info
} from "lucide-react"
import { toast } from "sonner"

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  })

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)

  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [mergedCategoryName, setMergedCategoryName] = useState("")
  const [mergedCategoryDescription, setMergedCategoryDescription] = useState("")
  const [mergedCategoryColor, setMergedCategoryColor] = useState("#3b82f6")

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchCategories()
  }, [status, session, router])

  async function fetchCategories() {
    try {
      setLoading(true)
      // Fetch with real-time post counts
      const response = await fetch('/api/categories?includeCounts=true')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        toast.error('Failed to load categories')
      }
    } catch (error) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCategory() {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Category created successfully')
        setShowCreateDialog(false)
        setNewCategory({ name: "", description: "", color: "#3b82f6" })
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      toast.error('Failed to create category')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUpdateCategory() {
    if (!editingCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategory.name,
          description: editingCategory.description,
          color: editingCategory.color
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Category updated successfully')
        setShowEditDialog(false)
        setEditingCategory(null)
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      toast.error('Failed to update category')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteCategory() {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/categories/${deletingCategory._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        if (data.movedPosts > 0) {
          toast.success(`Category deleted. ${data.movedPosts} post(s) moved to Uncategorized.`)
        } else {
          toast.success('Category deleted successfully')
        }
        setShowDeleteDialog(false)
        setDeletingCategory(null)
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch (error) {
      toast.error('Failed to delete category')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleMergeCategories() {
    if (selectedCategories.length < 2) {
      toast.error('Select at least 2 categories to merge')
      return
    }

    if (!mergedCategoryName.trim()) {
      toast.error('New category name is required')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/categories/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryIds: selectedCategories,
          newName: mergedCategoryName,
          newDescription: mergedCategoryDescription,
          newColor: mergedCategoryColor
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Merged ${selectedCategories.length} categories successfully`)
        setShowMergeDialog(false)
        setSelectedCategories([])
        setMergedCategoryName("")
        setMergedCategoryDescription("")
        setMergedCategoryColor("#3b82f6")
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to merge categories')
      }
    } catch (error) {
      toast.error('Failed to merge categories')
    } finally {
      setActionLoading(false)
    }
  }

  function toggleCategorySelection(categoryId) {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  function openEditDialog(category) {
    setEditingCategory({ ...category })
    setShowEditDialog(true)
  }

  function openDeleteDialog(category) {
    setDeletingCategory(category)
    setShowDeleteDialog(true)
  }

  function getTotalPosts() {
    return categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange/5 via-transparent to-orange/5 rounded-lg -z-10"></div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">Category Management</span>
        </h1>
        <p className="text-muted-foreground/80">
          Create, edit, delete, and merge blog categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-orange-500/30 bg-gradient-to-br from-background to-orange-50/30 dark:to-orange-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Folder className="h-5 w-5 text-white" />
              </div>
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{categories.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{getTotalPosts()}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-500/30 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Merge className="h-5 w-5 text-white" />
              </div>
              Selected for Merge
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{selectedCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowMergeDialog(true)}
          disabled={selectedCategories.length < 2}
        >
          <Merge className="h-4 w-4 mr-2" />
          Merge Selected ({selectedCategories.length})
        </Button>

        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setSelectedCategories([])}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category._id}
            className={`relative hover:shadow-2xl transition-all duration-500 border-2 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm ${selectedCategories.includes(category._id)
                ? 'ring-2 ring-primary border-primary/50'
                : 'border-transparent hover:border-primary/20'
              }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {category.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {category.postCount || 0} posts
                    </Badge>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => toggleCategorySelection(category._id)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              {category.description && (
                <CardDescription className="mt-2 line-clamp-2">
                  {category.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(category)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openDeleteDialog(category)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first category to organize blog posts
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your blog posts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Technology"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="color">Category Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{newCategory.color}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details
            </DialogDescription>
          </DialogHeader>

          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-color">Category Color</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="edit-color"
                    type="color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <span className="text-sm text-muted-foreground">{editingCategory.color}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog - Enhanced with Post Count Warning */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Post Count Warning */}
            {deletingCategory?.postCount > 0 ? (
              <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive mb-2">
                      Warning: This category contains {deletingCategory.postCount} {deletingCategory.postCount === 1 ? 'post' : 'posts'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All posts in this category will be automatically moved to the <strong>&quot;Uncategorized&quot;</strong> category.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      This category has no posts and can be safely deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Summary */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2">What will happen:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>Category &quot;{deletingCategory?.name}&quot; will be permanently deleted</span>
                </li>
                {deletingCategory?.postCount > 0 && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{deletingCategory.postCount} {deletingCategory.postCount === 1 ? 'post' : 'posts'} will be moved to &quot;Uncategorized&quot;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Posts will remain published and accessible</span>
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>This action cannot be undone</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletingCategory?.postCount > 0
                    ? `Delete & Move ${deletingCategory.postCount} Post${deletingCategory.postCount === 1 ? '' : 's'}`
                    : 'Delete Category'
                  }
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Merge Categories</DialogTitle>
            <DialogDescription>
              Merge {selectedCategories.length} categories into a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2">Categories to Merge</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(id => {
                  const cat = categories.find(c => c._id === id)
                  return cat ? (
                    <Badge key={id} variant="secondary" className="text-sm">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name} ({cat.postCount} posts)
                    </Badge>
                  ) : null
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total posts: {selectedCategories.reduce((sum, id) => {
                  const cat = categories.find(c => c._id === id)
                  return sum + (cat?.postCount || 0)
                }, 0)}
              </p>
            </div>

            <div>
              <Label htmlFor="merge-name">New Category Name *</Label>
              <Input
                id="merge-name"
                value={mergedCategoryName}
                onChange={(e) => setMergedCategoryName(e.target.value)}
                placeholder="e.g., Web Development"
              />
            </div>

            <div>
              <Label htmlFor="merge-description">Description</Label>
              <Textarea
                id="merge-description"
                value={mergedCategoryDescription}
                onChange={(e) => setMergedCategoryDescription(e.target.value)}
                placeholder="Description for the merged category"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="merge-color">Category Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="merge-color"
                  type="color"
                  value={mergedCategoryColor}
                  onChange={(e) => setMergedCategoryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{mergedCategoryColor}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                ℹ️ All posts from selected categories will be moved to the new category.
                The old categories will be deleted.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMergeCategories} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Merge className="h-4 w-4 mr-2" />
                  Merge Categories
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
