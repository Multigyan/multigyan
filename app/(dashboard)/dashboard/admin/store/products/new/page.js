"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { CldUploadWidget } from "next-cloudinary"

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [brands, setBrands] = useState([])
    const [categories, setCategories] = useState([])

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        shortDescription: "",
        price: "",
        originalPrice: "",
        brand: "",
        category: "",
        affiliateLink: "",
        affiliateNetwork: "Amazon",
        featuredImage: null,
        images: [],
        tags: "",
        isActive: true,
        isFeatured: false,
        inStock: true,
        metaTitle: "",
        metaDescription: "",
    })

    // Set page title
    useEffect(() => {
        document.title = "Add New Product | Multigyan"
    }, [])

    useEffect(() => {
        fetchBrandsAndCategories()
    }, [])

    const fetchBrandsAndCategories = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                fetch('/api/store/brands?active=true'),
                fetch('/api/store/categories')
            ])

            const brandsData = await brandsRes.json()
            const categoriesData = await categoriesRes.json()

            setBrands(brandsData.brands || [])
            setCategories(categoriesData.categories || [])
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load brands and categories')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.title || !formData.price || !formData.brand || !formData.category || !formData.affiliateLink) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
            }

            const response = await fetch('/api/store/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create product')
            }

            toast.success('Product created successfully!')
            router.push('/dashboard/admin/store/products')
        } catch (error) {
            console.error('Error creating product:', error)
            toast.error(error.message || 'Failed to create product')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (result, isFeatured = false) => {
        const imageData = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
            alt: formData.title || 'Product image'
        }

        if (isFeatured) {
            setFormData(prev => ({ ...prev, featuredImage: imageData }))
        } else {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, imageData]
            }))
        }
    }

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new product for your affiliate store
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential product details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Product Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter product title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Textarea
                                id="shortDescription"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                placeholder="Brief product description (max 500 characters)"
                                rows={3}
                                maxLength={500}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description"
                                rows={6}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand *</Label>
                                <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="electronics, gadgets, tech"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Set product prices</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Current Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                                <Input
                                    id="originalPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-muted-foreground">
                                    For showing discount (optional)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Affiliate Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Affiliate Information</CardTitle>
                        <CardDescription>Affiliate link and network details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="affiliateLink">Affiliate Link *</Label>
                            <Input
                                id="affiliateLink"
                                type="url"
                                value={formData.affiliateLink}
                                onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                                placeholder="https://..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="affiliateNetwork">Affiliate Network</Label>
                            <Select value={formData.affiliateNetwork} onValueChange={(value) => setFormData({ ...formData, affiliateNetwork: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Amazon">Amazon</SelectItem>
                                    <SelectItem value="Flipkart">Flipkart</SelectItem>
                                    <SelectItem value="Myntra">Myntra</SelectItem>
                                    <SelectItem value="Ajio">Ajio</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                        <CardDescription>Upload product images</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Featured Image */}
                        <div className="space-y-2">
                            <Label>Featured Image</Label>
                            {formData.featuredImage ? (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                    <Image
                                        src={formData.featuredImage.url}
                                        alt="Featured"
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => setFormData({ ...formData, featuredImage: null })}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <CldUploadWidget
                                    uploadPreset="multigyan_products"
                                    onSuccess={(result) => handleImageUpload(result, true)}
                                >
                                    {({ open }) => (
                                        <Button type="button" variant="outline" onClick={() => open()} className="w-full h-32">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Featured Image
                                        </Button>
                                    )}
                                </CldUploadWidget>
                            )}
                        </div>

                        {/* Additional Images */}
                        <div className="space-y-2">
                            <Label>Additional Images</Label>
                            <div className="grid grid-cols-4 gap-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <Image
                                            src={image.url}
                                            alt={`Product ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.images.length < 4 && (
                                    <CldUploadWidget
                                        uploadPreset="multigyan_products"
                                        onSuccess={(result) => handleImageUpload(result, false)}
                                    >
                                        {({ open }) => (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => open()}
                                                className="aspect-square"
                                            >
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </CldUploadWidget>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Product visibility and status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    Make this product visible in the store
                                </p>
                            </div>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Featured</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show this product on the homepage
                                </p>
                            </div>
                            <Switch
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>In Stock</Label>
                                <p className="text-sm text-muted-foreground">
                                    Product availability status
                                </p>
                            </div>
                            <Switch
                                checked={formData.inStock}
                                onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                    <CardHeader>
                        <CardTitle>SEO (Optional)</CardTitle>
                        <CardDescription>Search engine optimization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="metaTitle">Meta Title</Label>
                            <Input
                                id="metaTitle"
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                placeholder="Leave empty to use product title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metaDescription">Meta Description</Label>
                            <Textarea
                                id="metaDescription"
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                placeholder="Leave empty to use short description"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Product
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
