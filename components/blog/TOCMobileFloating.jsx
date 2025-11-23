"use client"

import { useState } from "react"
import { List, X, ArrowUp, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import TOCList from "./TOCList"

export default function TOCMobileFloating({ headings, activeId, readingProgress, onItemClick, scrollToTop }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!headings || headings.length === 0) return null

    const handleItemClick = (id) => {
        onItemClick(id)
        setIsOpen(false)
    }

    return (
        <>
            {/* Floating Button */}
            <div className="lg:hidden fixed bottom-24 right-6" style={{ zIndex: 9999 }}>
                <div className="relative">
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="lg"
                        className="rounded-full shadow-lg h-14 w-14 p-0 transition-all hover:scale-110 hover:shadow-xl"
                        aria-label="Open Table of Contents"
                    >
                        <List className="h-6 w-6" />
                    </Button>

                    {/* Progress Circle */}
                    <svg className="absolute inset-0 pointer-events-none -rotate-90" width="56" height="56" viewBox="0 0 56 56">
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-primary/20"
                        />
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - readingProgress / 100)}`}
                            className="text-primary transition-all duration-300"
                            style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
                        />
                    </svg>
                </div>
            </div>

            {/* Drawer */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm"
                        style={{ zIndex: 10000 }}
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer Content */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden" style={{ zIndex: 10001 }}>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Table of Contents
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {headings.length} sections • {Math.round(readingProgress)}% completed
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="transition-all hover:scale-110 min-h-[44px] min-w-[44px]"
                                aria-label="Close Table of Contents"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-4 py-3 bg-muted/30">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                                    style={{ width: `${readingProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* TOC List */}
                        <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-4 custom-scrollbar">
                            <TOCList
                                headings={headings}
                                activeId={activeId}
                                onItemClick={handleItemClick}
                                variant="mobile"
                            />

                            {/* Back to Top Button */}
                            <div className="mt-4 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        scrollToTop()
                                        setIsOpen(false)
                                    }}
                                    className="w-full transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 min-h-[44px]"
                                >
                                    <ArrowUp className="h-4 w-4 mr-2" />
                                    Back to Top
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
