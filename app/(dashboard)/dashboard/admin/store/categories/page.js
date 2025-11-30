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
import { Folder, Plus, Trash2, Edit, Loader2, Save, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

export default function StoreCategoriesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
        color: "#3b82f6",
        type: "store"
    })

    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deletingCategory, setDeletingCategory] = useState(null)

    useEffect(() => {
        if (status === 'loading') return

        if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
            router.push('/dashboard')
            return
        }

        fetchCategories()
    }, [status, session, router])

    useEffect(() => {
        document.title = "Store Categories | Multigyan"
    }, [])

    async function fetchCategories() {
        try {
            setLoading(true)
            const response = await fetch('/api/store/categories')
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
                setNewCategory({ name: "", description: "", color: "#3b82f6", type: "store" })
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
                toast.success('Category deleted successfully')
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

    if (status === 'loading' || loading) {
        return (
            <div className="px-6 py-8 max-w-6xl mx-auto">
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
        <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Store Categories</h1>
                <p className="text-muted-foreground mt-2">
                    Manage product categories for your store
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            Total Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                </Button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Card key={category._id} className="hover:shadow-lg transition-shadow">
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
                                            {category.productCount || 0} products
                                        </Badge>
                                    </div>
                                </div>
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
                                    onClick={() => {
                                        setEditingCategory({ ...category })
                                        setShowEditDialog(true)
                                    }}
                                    className="flex-1"
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        setDeletingCategory(category)
                                        setShowDeleteDialog(true)
                                    }}
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
                            Create your first product category to organize your store
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
                            Add a new category to organize your products
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Electronics, Fashion, Sports"
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

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingCategory?.name}"?
                        </DialogDescription>
                    </DialogHeader>

                    {deletingCategory?.productCount > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p className="text-sm text-destructive">
                                Warning: This category contains {deletingCategory.productCount} product(s).
                                Deleting it may affect those products.
                            </p>
                        </div>
                    )}

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
                                    Delete Category
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
