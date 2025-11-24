"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { convertToWebP } from "@/lib/imageUtils"

/**
 * Media Uploader Component
 * 
 * Drag & drop file uploader with progress tracking
 * 
 * @param {function} onUpload - Upload handler function
 */
export default function MediaUploader({ onUpload }) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadedFiles, setUploadedFiles] = useState([])

    const handleUpload = useCallback(async (files) => {
        setUploading(true)
        const results = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            try {
                // Convert to WebP if not already
                let processedFile = file
                if (file.type !== 'image/webp') {
                    toast.info(`Converting ${file.name} to WebP...`)
                    processedFile = await convertToWebP(file, 0.85)
                }

                // Upload
                const result = await onUpload(processedFile)
                results.push({ file: file.name, status: 'success', data: result })

                // Update progress
                setUploadProgress(((i + 1) / files.length) * 100)
            } catch (error) {
                results.push({ file: file.name, status: 'error', error: error.message })
            }
        }

        setUploadedFiles(results)
        setUploading(false)
        setUploadProgress(0)

        // Show summary
        const successCount = results.filter(r => r.status === 'success').length
        const errorCount = results.filter(r => r.status === 'error').length

        if (successCount > 0) {
            toast.success(`${successCount} image(s) uploaded successfully!`)
        }
        if (errorCount > 0) {
            toast.error(`${errorCount} image(s) failed to upload`)
        }
    }, [onUpload])

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length === 0) {
            toast.error('Please select valid image files')
            return
        }

        // Validate file sizes
        const oversizedFiles = acceptedFiles.filter(f => f.size > 10 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
            toast.error('Some files are larger than 10MB')
            return
        }

        handleUpload(acceptedFiles)
    }, [handleUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        multiple: true
    })

    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <Card
                {...getRootProps()}
                className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                        <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold mb-1">
                            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            or click to browse • Max 10MB per file
                        </p>
                    </div>
                    <Button type="button" variant="outline">
                        Choose Files
                    </Button>
                </div>
            </Card>

            {/* Upload Progress */}
            {uploading && (
                <Card className="p-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Uploading...</span>
                            <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                </Card>
            )}

            {/* Upload Results */}
            {uploadedFiles.length > 0 && !uploading && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Upload Results</h3>
                    <div className="space-y-2">
                        {uploadedFiles.map((result, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                                <div className="flex items-center gap-3">
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    <span className="text-sm">{result.file}</span>
                                </div>
                                {result.status === 'success' ? (
                                    <span className="text-xs text-green-600">Uploaded</span>
                                ) : (
                                    <span className="text-xs text-red-600">{result.error}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setUploadedFiles([])}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Clear Results
                    </Button>
                </Card>
            )}
        </div>
    )
}
