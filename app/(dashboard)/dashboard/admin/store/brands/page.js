"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CldUploadWidget } from "next-cloudinary"
import Image from "next/image"

export default function BrandsManagementPage() {
    const router = useRouter()
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [deleteBrand, setDeleteBrand] = useState(null)

    const [newBrand, setNewBrand] = useState({
        name: "",
        description: "",
        website: "",
        affiliateProgram: "",
        color: "#3B82F6",
        logo: null,
    })

    useEffect(() => {
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/store/brands')
            const data = await response.json()
            setBrands(data.brands || [])
        } catch (error) {
            console.error('Error fetching brands:', error)
            toast.error('Failed to load brands')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!newBrand.name) {
            toast.error('Brand name is required')
            return
        }

        try {
            const response = await fetch('/api/store/brands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBrand),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create brand')
            }

            const data = await response.json()
            toast.success('Brand created successfully!')
            setBrands([...brands, data.brand])
            setShowAddForm(false)
            setNewBrand({
                name: "",
                description: "",
                website: "",
                affiliateProgram: "",
                color: "#3B82F6",
                logo: null,
            })
        } catch (error) {
            console.error('Error creating brand:', error)
            toast.error(error.message || 'Failed to create brand')
        }
    }

    const handleDelete = async () => {
        if (!deleteBrand) return

        try {
            const response = await fetch(`/api/store/brands/${deleteBrand._id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete')

            toast.success('Brand deleted successfully')
            setBrands(brands.filter(b => b._id !== deleteBrand._id))
            setDeleteBrand(null)
        } catch (error) {
            console.error('Error deleting brand:', error)
            toast.error('Failed to delete brand')
        }
    }

    return (
        <div className="px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage affiliate partner brands
                    </p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Brand
                </Button>
            </div>

            {/* Add Brand Form */}
            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Brand</CardTitle>
                        <CardDescription>Create a new affiliate brand</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Brand Name *</Label>
                                    <Input
                                        id="name"
                                        value={newBrand.name}
                                        onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                        placeholder="e.g., Amazon"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="color">Brand Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={newBrand.color}
                                            onChange={(e) => setNewBrand({ ...newBrand, color: e.target.value })}
                                            className="w-20"
                                        />
                                        <Input
                                            value={newBrand.color}
                                            onChange={(e) => setNewBrand({ ...newBrand, color: e.target.value })}
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={newBrand.description}
                                    onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                                    placeholder="Brief description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={newBrand.website}
                                        onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="affiliateProgram">Affiliate Program</Label>
                                    <Input
                                        id="affiliateProgram"
                                        value={newBrand.affiliateProgram}
                                        onChange={(e) => setNewBrand({ ...newBrand, affiliateProgram: e.target.value })}
                                        placeholder="e.g., Amazon Associates"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Brand Logo</Label>
                                {newBrand.logo ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                        <Image
                                            src={newBrand.logo.url}
                                            alt="Brand logo"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                ) : (
                                    <CldUploadWidget
                                        uploadPreset="multigyan_products"
                                        onSuccess={(result) => {
                                            setNewBrand({
                                                ...newBrand,
                                                logo: {
                                                    url: result.info.secure_url,
                                                    publicId: result.info.public_id,
                                                }
                                            })
                                        }}
                                    >
                                        {({ open }) => (
                                            <Button type="button" variant="outline" onClick={() => open()}>
                                                Upload Logo
                                            </Button>
                                        )}
                                    </CldUploadWidget>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Create Brand</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Brands Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Logo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Loading brands...
                                    </TableCell>
                                </TableRow>
                            ) : brands.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No brands found. Add your first brand!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands.map((brand) => (
                                    <TableRow key={brand._id}>
                                        <TableCell>
                                            {brand.logo?.url && (
                                                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                    <Image
                                                        src={brand.logo.url}
                                                        alt={brand.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{brand.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border"
                                                    style={{ backgroundColor: brand.color }}
                                                />
                                                <span className="text-sm text-muted-foreground">{brand.color}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{brand.productCount || 0}</TableCell>
                                        <TableCell>
                                            <span className={brand.isActive ? "text-green-600" : "text-muted-foreground"}>
                                                {brand.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteBrand(brand)}
                                                disabled={brand.productCount > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteBrand} onOpenChange={() => setDeleteBrand(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &#34;{deleteBrand?.name}&#34;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
