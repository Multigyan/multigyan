"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Calendar, HardDrive, Image as ImageIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

/**
 * Media Grid Component
 * 
 * Displays media in grid or list view
 * 
 * @param {array} media - Array of media items
 * @param {string} viewMode - "grid" or "list"
 * @param {object} selectedImage - Currently selected image
 * @param {function} onSelect - Selection handler
 */
export default function MediaGrid({ media, viewMode, selectedImage, onSelect }) {
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => {
                    const isSelected = selectedImage?.public_id === item.public_id

                    return (
                        <Card
                            key={item.public_id}
                            className={`group relative cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''
                                }`}
                            onClick={() => onSelect(item)}
                        >
                            {/* Image */}
                            <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                                <img
                                    src={item.secure_url}
                                    alt={item.original_filename || 'Media'}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="bg-primary rounded-full p-2">
                                            <Check className="h-6 w-6 text-primary-foreground" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 space-y-2">
                                <p className="text-sm font-medium truncate">
                                    {item.original_filename || item.public_id}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{item.width} × {item.height}</span>
                                    <span>{formatFileSize(item.bytes)}</span>
                                </div>
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {item.tags.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>
        )
    }

    // List view
    return (
        <div className="space-y-2">
            {media.map((item) => {
                const isSelected = selectedImage?.public_id === item.public_id

                return (
                    <Card
                        key={item.public_id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                            }`}
                        onClick={() => onSelect(item)}
                    >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            <img
                                src={item.secure_url}
                                alt={item.original_filename || 'Media'}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">
                                    {item.original_filename || item.public_id}
                                </p>
                                {isSelected && (
                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <ImageIcon className="h-3 w-3" />
                                    {item.width} × {item.height}
                                </span>
                                <span className="flex items-center gap-1">
                                    <HardDrive className="h-3 w-3" />
                                    {formatFileSize(item.bytes)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {item.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Select Button */}
                        <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelect(item)
                            }}
                        >
                            {isSelected ? 'Selected' : 'Select'}
                        </Button>
                    </Card>
                )
            })}
        </div>
    )
}
