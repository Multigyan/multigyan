"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import Papa from "papaparse"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function BulkUploadPage() {
    const router = useRouter()
    const [file, setFile] = useState(null)
    const [parsing, setParsing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [parsedData, setParsedData] = useState([])
    const [validationResults, setValidationResults] = useState([])
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadResults, setUploadResults] = useState(null)
    const [brands, setBrands] = useState([])
    const [categories, setCategories] = useState([])

    // Set page title
    useEffect(() => {
        document.title = "Bulk Upload Products | Multigyan"
    }, [])

    // Fetch brands and categories for lookup
    useEffect(() => {
        fetchBrandsAndCategories()
    }, [])

    const fetchBrandsAndCategories = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                fetch('/api/store/brands'),
                fetch('/api/categories')
            ])

            const brandsData = await brandsRes.json()
            const categoriesData = await categoriesRes.json()

            setBrands(brandsData.brands || [])
            setCategories(categoriesData.categories || [])
        } catch (error) {
            console.error('Error fetching brands/categories:', error)
            toast.error('Failed to load brands and categories')
        }
    }

    const downloadTemplate = () => {
        const template = [
            {
                title: "Honeywell HDMI Cable 2.1 with Ethernet, 8k@60Hz, 4K@120Hz UHD Resolution",
                description: "Experience ultra-high-definition viewing with this premium HDMI cable. Supports 8K resolution at 60Hz and 4K at 120Hz for crystal-clear picture quality. Features Ethernet connectivity for smart device integration. Gold-plated connectors ensure reliable signal transmission. Perfect for gaming consoles, streaming devices, and home theater systems.",
                shortDescription: "Premium HDMI 2.1 cable with 8K support and Ethernet connectivity",
                featuredImageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/hdmi-cable-main.jpg",
                imageUrls: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/hdmi-1.jpg,https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/hdmi-2.jpg",
                price: "1329",
                originalPrice: "2999",
                brand: "Generic",
                category: "Sports",
                subcategories: "Cables,HDMI Cables,Electronics",
                tags: "hdmi,cable,8k,4k,ethernet,gaming,home theater",
                affiliateLink: "https://www.amazon.in/dp/B08HRG6C1Z?tag=multigyan37-21",
                affiliateNetwork: "Amazon",
                rating: "4.5",
                reviewCount: "1250",
                isActive: "true",
                isFeatured: "false",
                inStock: "true",
                metaTitle: "Honeywell HDMI Cable 2.1 - 8K@60Hz, 4K@120Hz | Best Price",
                metaDescription: "Buy Honeywell HDMI 2.1 cable with 8K@60Hz and 4K@120Hz support. Premium quality with Ethernet connectivity."
            }
        ]

        const csv = Papa.unparse(template)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'product_upload_template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Template downloaded!')
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return

        if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
            toast.error('Please upload a CSV or Excel file')
            return
        }

        setFile(selectedFile)
        parseFile(selectedFile)
    }

    const parseFile = (file) => {
        setParsing(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setParsedData(results.data)
                validateData(results.data)
                setParsing(false)
                toast.success(`Parsed ${results.data.length} products`)
            },
            error: (error) => {
                console.error('Parse error:', error)
                toast.error('Failed to parse file')
                setParsing(false)
            }
        })
    }

    const findBrandId = (brandName) => {
        if (!brandName) return null
        const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase())
        return brand?._id || null
    }

    const findCategoryId = (categoryName) => {
        if (!categoryName) return null
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
        return category?._id || null
    }

    const validateData = (data) => {
        const results = data.map((row, index) => {
            const errors = []

            if (!row.title || row.title.trim() === '') {
                errors.push('Title is required')
            }

            if (!row.price || isNaN(parseFloat(row.price))) {
                errors.push('Valid price is required')
            }

            if (!row.brand || row.brand.trim() === '') {
                errors.push('Brand is required')
            } else if (!findBrandId(row.brand)) {
                errors.push(`Brand "${row.brand}" not found`)
            }

            if (!row.category || row.category.trim() === '') {
                errors.push('Category is required')
            } else if (!findCategoryId(row.category)) {
                errors.push(`Category "${row.category}" not found`)
            }

            if (!row.affiliateLink || !row.affiliateLink.startsWith('http')) {
                errors.push('Valid affiliate link is required')
            }

            return {
                index,
                row,
                valid: errors.length === 0,
                errors
            }
        })

        setValidationResults(results)
    }

    const handleBulkUpload = async () => {
        const validRows = validationResults.filter(r => r.valid)

        if (validRows.length === 0) {
            toast.error('No valid products to upload')
            return
        }

        setUploading(true)
        setUploadProgress(0)

        const results = {
            total: validRows.length,
            success: 0,
            failed: 0,
            errors: []
        }

        for (let i = 0; i < validRows.length; i++) {
            const { row } = validRows[i]

            try {
                const brandId = findBrandId(row.brand)
                const categoryId = findCategoryId(row.category)

                // Parse image URLs
                const featuredImage = row.featuredImageUrl ? {
                    url: row.featuredImageUrl.trim(),
                    alt: row.title,
                    publicId: ''
                } : undefined

                const images = row.imageUrls
                    ? row.imageUrls.split(',').map(url => ({
                        url: url.trim(),
                        alt: row.title,
                        publicId: ''
                    }))
                    : []

                // Parse subcategories
                const subcategories = row.subcategories
                    ? row.subcategories.split(',').map(s => s.trim())
                    : []

                const payload = {
                    title: row.title,
                    description: row.description || 'No description provided',
                    shortDescription: row.shortDescription || '',
                    featuredImage,
                    images,
                    price: parseFloat(row.price),
                    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
                    brand: brandId,
                    category: categoryId,
                    subcategories,
                    affiliateLink: row.affiliateLink,
                    affiliateNetwork: row.affiliateNetwork || 'Amazon',
                    tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
                    rating: row.rating ? parseFloat(row.rating) : 0,
                    reviewCount: row.reviewCount ? parseInt(row.reviewCount) : 0,
                    isActive: row.isActive === 'true',
                    isFeatured: row.isFeatured === 'true',
                    inStock: row.inStock !== 'false',
                    metaTitle: row.metaTitle || '',
                    metaDescription: row.metaDescription || ''
                }

                const response = await fetch('/api/store/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                if (response.ok) {
                    results.success++
                } else {
                    const error = await response.json()
                    results.failed++

                    // Build detailed error message
                    let errorMessage = error.error || 'Unknown error'
                    if (error.message) {
                        errorMessage += `: ${error.message}`
                    }
                    if (error.details) {
                        if (typeof error.details === 'object') {
                            errorMessage += ` (${JSON.stringify(error.details)})`
                        } else {
                            errorMessage += ` (${error.details})`
                        }
                    }

                    results.errors.push({
                        row: i + 1,
                        title: row.title,
                        error: errorMessage
                    })
                }
            } catch (error) {
                results.failed++
                results.errors.push({
                    row: i + 1,
                    title: row.title,
                    error: error.message
                })
            }

            setUploadProgress(Math.round(((i + 1) / validRows.length) * 100))
        }

        setUploadResults(results)
        setUploading(false)

        if (results.success > 0) {
            toast.success(`Successfully uploaded ${results.success} products!`)
        }
        if (results.failed > 0) {
            toast.error(`Failed to upload ${results.failed} products`)
        }
    }

    const validCount = validationResults.filter(r => r.valid).length
    const invalidCount = validationResults.filter(r => !r.valid).length

    return (
        <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Product Upload</h1>
                <p className="text-muted-foreground mt-2">
                    Upload multiple products at once using CSV files with complete product details
                </p>
            </div>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use</CardTitle>
                    <CardDescription>Follow these steps to bulk upload products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Download the CSV template below</li>
                        <li>Fill in your product details:
                            <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                                <li>Use brand/category <strong>names</strong>, not IDs</li>
                                <li>For images: provide direct URLs (Cloudinary, Amazon S3, etc.)</li>
                                <li>Separate multiple values with commas (tags, subcategories, image URLs)</li>
                                <li>Use "true" or "false" for boolean fields</li>
                            </ul>
                        </li>
                        <li>Upload the completed CSV file</li>
                        <li>Review validation results</li>
                        <li>Click "Upload Products" to complete the import</li>
                    </ol>

                    <div className="flex gap-2">
                        <Button onClick={downloadTemplate} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                    </div>

                    {brands.length > 0 && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Available Brands:</h4>
                            <div className="flex flex-wrap gap-2">
                                {brands.map(brand => (
                                    <Badge key={brand._id} variant="secondary">{brand.name}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {categories.length > 0 && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Available Categories:</h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <Badge key={category._id} variant="secondary">{category.name}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>Select a CSV file containing product data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="file">Product File</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={parsing || uploading}
                            />
                        </div>

                        {file && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileSpreadsheet className="h-4 w-4" />
                                <span>{file.name}</span>
                                {parsing && <Loader2 className="h-4 w-4 animate-spin" />}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Validation Results */}
            {validationResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Validation Results</CardTitle>
                        <CardDescription>
                            Review the validation status of your products
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">{validCount} Valid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span className="font-medium">{invalidCount} Invalid</span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {validationResults.map((result) => (
                                            <TableRow key={result.index}>
                                                <TableCell>{result.index + 1}</TableCell>
                                                <TableCell className="font-medium">
                                                    {result.row.title || '-'}
                                                </TableCell>
                                                <TableCell>{result.row.brand || '-'}</TableCell>
                                                <TableCell>{result.row.category || '-'}</TableCell>
                                                <TableCell>₹{result.row.price || '-'}</TableCell>
                                                <TableCell>
                                                    {result.valid ? (
                                                        <Badge variant="success" className="bg-green-500">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Valid
                                                        </Badge>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <Badge variant="destructive">
                                                                <XCircle className="mr-1 h-3 w-3" />
                                                                Invalid
                                                            </Badge>
                                                            <ul className="text-xs text-red-500 list-disc list-inside">
                                                                {result.errors.map((error, i) => (
                                                                    <li key={i}>{error}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Upload Button */}
                            {validCount > 0 && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleBulkUpload}
                                        disabled={uploading}
                                        size="lg"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload {validCount} Products
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload Progress */}
            {uploading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Progress value={uploadProgress} />
                            <p className="text-sm text-center text-muted-foreground">
                                {uploadProgress}% Complete
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload Results */}
            {uploadResults && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">{uploadResults.total}</div>
                                    <div className="text-sm text-muted-foreground">Total</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {uploadResults.success}
                                    </div>
                                    <div className="text-sm text-green-600">Success</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {uploadResults.failed}
                                    </div>
                                    <div className="text-sm text-red-600">Failed</div>
                                </div>
                            </div>

                            {/* Errors */}
                            {uploadResults.errors.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        Errors
                                    </h4>
                                    <div className="border rounded-lg divide-y">
                                        {uploadResults.errors.map((error, index) => (
                                            <div key={index} className="p-3 text-sm">
                                                <div className="font-medium">
                                                    Row {error.row}: {error.title}
                                                </div>
                                                <div className="text-red-500 text-xs mt-1">
                                                    {error.error}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setFile(null)
                                        setParsedData([])
                                        setValidationResults([])
                                        setUploadResults(null)
                                        setUploadProgress(0)
                                    }}
                                    variant="outline"
                                >
                                    Upload Another File
                                </Button>
                                <Button onClick={() => router.push('/dashboard/admin/store/products')}>
                                    View All Products
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
