"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, Loader2, Globe } from "lucide-react"
import { toast } from "sonner"

export default function IndexNowManager() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const submitAllPosts = async () => {
        try {
            setLoading(true)
            setResult(null)

            const response = await fetch('/api/indexnow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'all-posts'
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: data.message,
                    submitted: data.submitted
                })
                toast.success(`Successfully submitted ${data.submitted} posts to IndexNow!`)
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Failed to submit posts'
                })
                toast.error(data.error || 'Failed to submit posts')
            }
        } catch (error) {
            console.error('IndexNow submission error:', error)
            setResult({
                success: false,
                message: error.message
            })
            toast.error('Error submitting to IndexNow')
        } finally {
            setLoading(false)
        }
    }

    const submitStaticPages = async () => {
        try {
            setLoading(true)
            setResult(null)

            const response = await fetch('/api/indexnow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'static'
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: data.message,
                    submitted: data.submitted
                })
                toast.success(`Successfully submitted ${data.submitted} static pages to IndexNow!`)
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Failed to submit pages'
                })
                toast.error(data.error || 'Failed to submit pages')
            }
        } catch (error) {
            console.error('IndexNow submission error:', error)
            setResult({
                success: false,
                message: error.message
            })
            toast.error('Error submitting to IndexNow')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-500/30 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    IndexNow - Bing Indexing
                </CardTitle>
                <CardDescription>
                    Instantly notify Bing, Yahoo, Yandex, and other search engines about your content
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Bing
                    </Badge>
                    <Badge variant="outline" className="border-purple-500 text-purple-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yahoo
                    </Badge>
                    <Badge variant="outline" className="border-green-500 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yandex
                    </Badge>
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Naver
                    </Badge>
                </div>

                <div className="space-y-2">
                    <Button
                        onClick={submitAllPosts}
                        disabled={loading}
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="mr-2 h-4 w-4" />
                        )}
                        Submit All Published Posts
                    </Button>

                    <Button
                        onClick={submitStaticPages}
                        disabled={loading}
                        variant="outline"
                        className="w-full justify-start border-blue-200 hover:bg-blue-50"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Globe className="mr-2 h-4 w-4" />
                        )}
                        Submit Static Pages
                    </Button>
                </div>

                {result && (
                    <div className={`p-3 rounded-lg border ${result.success
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                            : 'bg-red-50 border-red-200 dark:bg-red-950/20'
                        }`}>
                        <div className="flex items-start gap-2">
                            {result.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    {result.message}
                                </p>
                                {result.submitted && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {result.submitted} URLs submitted successfully
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <p>💡 <strong>Tip:</strong> New posts are automatically submitted when published</p>
                    <p>⚡ <strong>Fast Indexing:</strong> URLs typically appear in Bing within 24-48 hours</p>
                    <p>🔄 <strong>One-time Setup:</strong> Use this for existing content. New content auto-submits.</p>
                </div>
            </CardContent>
        </Card>
    )
}
