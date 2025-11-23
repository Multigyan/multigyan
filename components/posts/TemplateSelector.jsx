"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BookOpen, List, GraduationCap, Star, Scale, FileText, Sparkles } from "lucide-react"
import { getAllTemplates } from "@/lib/contentTemplates"

const iconMap = {
    BookOpen,
    List,
    GraduationCap,
    Star,
    Scale
}

/**
 * Template Selector Component
 * 
 * Allows users to choose and insert pre-structured content templates
 * 
 * @param {function} onTemplateSelected - Callback with template content when selected
 */
export default function TemplateSelector({ onTemplateSelected }) {
    const [open, setOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const templates = getAllTemplates()

    const handleApplyTemplate = (templateId) => {
        const template = templates.find(t => t.id === templateId)

        if (template && onTemplateSelected) {
            onTemplateSelected(template.content)
            setOpen(false)
        }
    }

    const handlePreview = (template) => {
        setSelectedTemplate(template)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start with a Template
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Choose a Content Template
                    </DialogTitle>
                    <DialogDescription>
                        Start with a pre-structured template to make writing easier
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {templates.map((template) => {
                        const Icon = iconMap[template.icon] || FileText
                        const isSelected = selectedTemplate?.id === template.id

                        return (
                            <Card
                                key={template.id}
                                className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${isSelected ? 'ring-2 ring-primary border-primary' : ''
                                    }`}
                                onClick={() => handlePreview(template)}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="p-2.5 bg-primary/10 rounded-lg">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        {template.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2">{template.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleApplyTemplate(template.id)
                                            }}
                                        >
                                            Use Template
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Template Preview */}
                {selectedTemplate && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-3">Preview: {selectedTemplate.name}</h3>
                        <div
                            className="prose prose-sm max-w-none bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                                Close Preview
                            </Button>
                            <Button onClick={() => handleApplyTemplate(selectedTemplate.id)}>
                                Use This Template
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
