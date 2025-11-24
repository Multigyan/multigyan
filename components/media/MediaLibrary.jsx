"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Upload, Search, Grid3x3, List } from "lucide-react"
import MediaGrid from "./MediaGrid"
import MediaUploader from "./MediaUploader"
import { toast } from "sonner"

/**
 * Media Library Component
 * 
 * Browse, upload, and manage reusable media assets
 * Uses Cloudinary for storage with tags for organization
 * 
 * @param {function} onSelect - Callback when image is selected
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Dialog state change handler
 */
export default function MediaLibrary({ onSelect, open, onOpenChange }) {
    const [media, setMedia] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
    const [selectedImage, setSelectedImage] = useState(null)

    // Fetch media from Cloudinary
    const fetchMedia = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/media')
            const data = await response.json()

            if (data.resources) {
                setMedia(data.resources)
            }
        } catch (error) {
            console.error('Failed to fetch media:', error)
            toast.error('Failed to load media library')
        } finally {
            setLoading(false)
        }
    }, [])

    // Handle image upload
    const handleUpload = useCallback(async (file) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'multigyan_uploads')
            formData.append('folder', 'multigyan/media-library')
            formData.append('tags', 'media-library,reusable')

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()

            // Add to media list
            setMedia(prev => [data, ...prev])
            toast.success('Image uploaded successfully!')

            return data
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
            throw error
        }
    }, [])

    // Handle image selection
    const handleSelect = useCallback((image) => {
        setSelectedImage(image)
        if (onSelect) {
            onSelect(image.secure_url)
            onOpenChange(false)
        }
    }, [onSelect, onOpenChange])

    // Filter media by search query
    const filteredMedia = media.filter(item => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            item.public_id?.toLowerCase().includes(query) ||
            item.original_filename?.toLowerCase().includes(query) ||
            item.tags?.some(tag => tag.toLowerCase().includes(query))
        )
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Media Library
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Media Library
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="browse" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="browse" onClick={fetchMedia}>
                            <Grid3x3 className="mr-2 h-4 w-4" />
                            Browse
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload New
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="browse" className="flex-1 flex flex-col overflow-hidden mt-4">
                        {/* Search and View Controls */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by filename or tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Media Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                                </div>
                            ) : filteredMedia.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No images found</p>
                                    <p className="text-sm">Upload your first image to get started</p>
                                </div>
                            ) : (
                                <MediaGrid
                                    media={filteredMedia}
                                    viewMode={viewMode}
                                    selectedImage={selectedImage}
                                    onSelect={handleSelect}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 mt-4">
                        <MediaUploader onUpload={handleUpload} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
