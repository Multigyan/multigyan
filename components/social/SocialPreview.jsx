"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Link2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

/**
 * SocialPreview Component
 * 
 * Preview how post will appear on social media platforms
 * Customize Open Graph and Twitter Card metadata
 */

export default function SocialPreview({
    title,
    excerpt,
    featuredImage,
    ogTitle,
    ogDescription,
    ogImage,
    onUpdate
}) {
    const [customOgTitle, setCustomOgTitle] = useState(ogTitle || title)
    const [customOgDescription, setCustomOgDescription] = useState(ogDescription || excerpt)
    const [customOgImage, setCustomOgImage] = useState(ogImage || featuredImage)
    const [copied, setCopied] = useState(false)

    // Auto-update when props change
    useEffect(() => {
        if (!ogTitle) setCustomOgTitle(title)
        if (!ogDescription) setCustomOgDescription(excerpt)
        if (!ogImage) setCustomOgImage(featuredImage)
    }, [title, excerpt, featuredImage, ogTitle, ogDescription, ogImage])

    // Handle save
    const handleSave = () => {
        if (onUpdate) {
            onUpdate({
                ogTitle: customOgTitle,
                ogDescription: customOgDescription,
                ogImage: customOgImage
            })
        }
        toast.success('Social media preview updated!')
    }

    // Copy URL
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.origin + '/blog/' + title.toLowerCase().replace(/\s+/g, '-'))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success('URL copied to clipboard!')
    }

    // Truncate text
    const truncate = (text, length) => {
        if (!text) return ''
        return text.length > length ? text.substring(0, length) + '...' : text
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Social Media Preview
                </CardTitle>
                <CardDescription>
                    Customize how your post appears when shared on social media
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Customization Fields */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="ogTitle">Social Media Title</Label>
                        <Input
                            id="ogTitle"
                            value={customOgTitle}
                            onChange={(e) => setCustomOgTitle(e.target.value)}
                            placeholder="Leave blank to use post title"
                            maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {customOgTitle?.length || 0}/60 characters (optimal: 40-60)
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="ogDescription">Social Media Description</Label>
                        <Textarea
                            id="ogDescription"
                            value={customOgDescription}
                            onChange={(e) => setCustomOgDescription(e.target.value)}
                            placeholder="Leave blank to use excerpt"
                            rows={3}
                            maxLength={155}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {customOgDescription?.length || 0}/155 characters (optimal: 120-155)
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="ogImage">Social Media Image URL</Label>
                        <Input
                            id="ogImage"
                            value={customOgImage}
                            onChange={(e) => setCustomOgImage(e.target.value)}
                            placeholder="Leave blank to use featured image"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Recommended: 1200x630px for best results
                        </p>
                    </div>

                    <Button onClick={handleSave} className="w-full">
                        Save Social Media Settings
                    </Button>
                </div>

                {/* Platform Previews */}
                <Tabs defaultValue="facebook" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="facebook">
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                        </TabsTrigger>
                        <TabsTrigger value="twitter">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                        </TabsTrigger>
                        <TabsTrigger value="linkedin">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                        </TabsTrigger>
                    </TabsList>

                    {/* Facebook Preview */}
                    <TabsContent value="facebook" className="space-y-4">
                        <div className="border rounded-lg overflow-hidden bg-white">
                            {customOgImage && (
                                <div className="relative w-full h-64">
                                    <Image
                                        src={customOgImage}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-4 bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase mb-1">
                                    {window.location.hostname}
                                </p>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {truncate(customOgTitle, 60)}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {truncate(customOgDescription, 155)}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Twitter Preview */}
                    <TabsContent value="twitter" className="space-y-4">
                        <div className="border rounded-2xl overflow-hidden bg-white">
                            {customOgImage && (
                                <div className="relative w-full h-64">
                                    <Image
                                        src={customOgImage}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <p className="text-xs text-gray-500 mb-1">
                                    {window.location.hostname}
                                </p>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {truncate(customOgTitle, 70)}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {truncate(customOgDescription, 200)}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* LinkedIn Preview */}
                    <TabsContent value="linkedin" className="space-y-4">
                        <div className="border rounded-lg overflow-hidden bg-white">
                            {customOgImage && (
                                <div className="relative w-full h-64">
                                    <Image
                                        src={customOgImage}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {truncate(customOgTitle, 60)}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {truncate(customOgDescription, 155)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {window.location.hostname}
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Copy URL Button */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyUrl}
                >
                    {copied ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Post URL
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
