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

    // Set page title
    useEffect(() => {
        document.title = "Bulk Upload Products | Multigyan"
    }, [])

    const downloadTemplate = () => {
        const template = [
            {
                title: "Example Product 1",
                description: "Full product description here",
                shortDescription: "Brief description",
                price: "999.99",
                originalPrice: "1299.99",
                brandId: "BRAND_ID_HERE",
                categoryId: "CATEGORY_ID_HERE",
                affiliateLink: "https://example.com/product1",
                affiliateNetwork: "Amazon",
                tags: "electronics,gadgets,tech",
                isActive: "true",
                isFeatured: "false",
                inStock: "true",
                metaTitle: "SEO Title",
                metaDescription: "SEO Description"
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

    const validateData = (data) => {
        const results = data.map((row, index) => {
            const errors = []

            if (!row.title || row.title.trim() === '') {
                errors.push('Title is required')
            }

            if (!row.price || isNaN(parseFloat(row.price))) {
                errors.push('Valid price is required')
            }

            if (!row.brandId || row.brandId.trim() === '') {
                errors.push('Brand ID is required')
            }

            if (!row.categoryId || row.categoryId.trim() === '') {
                errors.push('Category ID is required')
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
                const payload = {
                    title: row.title,
                    description: row.description || '',
                    shortDescription: row.shortDescription || '',
                    price: parseFloat(row.price),
                    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
                    brand: row.brandId,
                    category: row.categoryId,
                    affiliateLink: row.affiliateLink,
                    affiliateNetwork: row.affiliateNetwork || 'Amazon',
                    tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
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
                    Upload multiple products at once using CSV or Excel files
                </p>
            </div>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use</CardTitle>
                    <CardDescription>Follow these steps to bulk upload products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">1</span>
                            </div>
                            <div>
                                <h4 className="font-medium">Download Template</h4>
                                <p className="text-sm text-muted-foreground">
                                    Download the CSV template with all required columns
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">2</span>
                            </div>
                            <div>
                                <h4 className="font-medium">Fill Product Data</h4>
                                <p className="text-sm text-muted-foreground">
                                    Add your product information. Get Brand IDs and Category IDs from the respective management pages
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">3</span>
                            </div>
                            <div>
                                <h4 className="font-medium">Upload & Validate</h4>
                                <p className="text-sm text-muted-foreground">
                                    Upload your CSV file. The system will validate all entries
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">4</span>
                            </div>
                            <div>
                                <h4 className="font-medium">Import Products</h4>
                                <p className="text-sm text-muted-foreground">
                                    Review validation results and import valid products
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV Template
                    </Button>
                </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>Select a CSV or Excel file to upload</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        {file ? file.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        CSV or Excel files only
                                    </p>
                                </div>
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".csv,.xlsx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                onClick={() => document.getElementById('file-upload').click()}
                                className="mt-4"
                                disabled={parsing}
                            >
                                {parsing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Parsing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Select File
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Validation Results */}
            {validationResults.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Validation Results</CardTitle>
                            <CardDescription>
                                {validCount} valid, {invalidCount} invalid products
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-sm">
                                            <span className="font-bold text-green-600">{validCount}</span> Valid Products
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <span className="text-sm">
                                            <span className="font-bold text-red-600">{invalidCount}</span> Invalid Products
                                        </span>
                                    </div>
                                </div>

                                {validCount > 0 && (
                                    <Button
                                        onClick={handleBulkUpload}
                                        disabled={uploading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading... {uploadProgress}%
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Import {validCount} Valid Products
                                            </>
                                        )}
                                    </Button>
                                )}

                                {uploading && (
                                    <Progress value={uploadProgress} className="w-full" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Validation Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Errors</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {validationResults.map((result) => (
                                        <TableRow key={result.index}>
                                            <TableCell>{result.index + 1}</TableCell>
                                            <TableCell className="font-medium">{result.row.title || 'N/A'}</TableCell>
                                            <TableCell>₹{result.row.price || 'N/A'}</TableCell>
                                            <TableCell>
                                                {result.valid ? (
                                                    <Badge variant="default" className="bg-green-500">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Valid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Invalid
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {result.errors.length > 0 && (
                                                    <div className="text-xs text-red-600">
                                                        {result.errors.join(', ')}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Upload Results */}
            {uploadResults && (
                <Card className={uploadResults.failed > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {uploadResults.failed > 0 ? (
                                <>
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    Upload Complete with Errors
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Upload Successful
                                </>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{uploadResults.total}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Success</p>
                                    <p className="text-2xl font-bold text-green-600">{uploadResults.success}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                    <p className="text-2xl font-bold text-red-600">{uploadResults.failed}</p>
                                </div>
                            </div>

                            {uploadResults.errors.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Errors:</h4>
                                    {uploadResults.errors.map((error, index) => (
                                        <div key={index} className="text-xs bg-white p-2 rounded border">
                                            Row {error.row}: {error.title} - {error.error}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button onClick={() => router.push('/dashboard/admin/store/products')} className="w-full">
                                View All Products
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
