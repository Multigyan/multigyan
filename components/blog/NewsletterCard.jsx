"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import NewsletterSubscribe from '@/components/newsletter/NewsletterSubscribe'
import { Mail } from 'lucide-react'

/**
 * Newsletter Card for Sidebar
 * Compact newsletter subscription component
 */
export default function NewsletterCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Stay Updated
                </CardTitle>
                <CardDescription>
                    Get the latest articles delivered to your inbox
                </CardDescription>
            </CardHeader>
            <CardContent>
                <NewsletterSubscribe
                    source="sidebar"
                    showTitle={false}
                    compact={true}
                />
            </CardContent>
        </Card>
    )
}
