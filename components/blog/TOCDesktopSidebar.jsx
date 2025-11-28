"use client"

import { useState } from "react"
import { BookOpen, ChevronRight, ChevronDown, ArrowUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TOCList from "./TOCList"

export default function TOCDesktopSidebar({ headings, activeId, readingProgress, readingTime, onItemClick, scrollToTop }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    if (!headings || headings.length === 0) return null

    return (
        <Card className="shadow-xl border-2 border-primary/10 backdrop-blur-md bg-background/80 dark:bg-background/60">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Table of Contents
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-8 w-8 p-0 transition-all hover:scale-110"
                        aria-label={isCollapsed ? "Expand TOC" : "Collapse TOC"}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Reading Progress</span>
                        <span className="font-semibold">{Math.round(readingProgress)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 rounded-full"
                            style={{ width: `${readingProgress}%` }}
                        />
                    </div>
                </div>
            </CardHeader>

            {!isCollapsed && (
                <CardContent className="pt-0 pb-4">
                    <TOCList
                        headings={headings}
                        activeId={activeId}
                        onItemClick={onItemClick}
                        variant="default"
                    />

                    <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{headings.length} sections</span>
                            <Badge variant="outline" className="text-xs">
                                {readingTime ? `${readingTime} min` : `${Math.ceil(headings.length * 0.5)} min`}
                            </Badge>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={scrollToTop}
                            className="w-full hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                            <ArrowUp className="h-3.5 w-3.5 mr-2" />
                            Back to Top
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
