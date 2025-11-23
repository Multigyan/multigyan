"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Zap, Settings } from "lucide-react"

/**
 * Quick Post Toggle Component
 * 
 * Allows users to switch between simplified "Quick Post" mode
 * and full-featured "Full Post" mode
 * 
 * @param {string} mode - Current mode: 'quick' or 'full'
 * @param {function} onModeChange - Callback when mode changes
 */
export default function QuickPostToggle({ mode, onModeChange }) {
    const isFullMode = mode === 'full'

    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isFullMode ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    {isFullMode ? (
                        <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                </div>

                <div>
                    <Label className="text-sm font-semibold cursor-pointer" htmlFor="mode-toggle">
                        Creation Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        {isFullMode
                            ? 'All features and advanced options'
                            : 'Essential fields only - perfect for quick posts'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Badge
                        variant={!isFullMode ? 'default' : 'outline'}
                        className={`${!isFullMode ? 'bg-blue-600 hover:bg-blue-700' : ''} cursor-pointer transition-all`}
                        onClick={() => onModeChange('quick')}
                    >
                        <Zap className="h-3 w-3 mr-1" />
                        Quick Post (6 fields)
                    </Badge>
                    <Badge
                        variant={isFullMode ? 'default' : 'outline'}
                        className={`${isFullMode ? 'bg-purple-600 hover:bg-purple-700' : ''} cursor-pointer transition-all`}
                        onClick={() => onModeChange('full')}
                    >
                        <Settings className="h-3 w-3 mr-1" />
                        Full Post (30+ fields)
                    </Badge>
                </div>

                <Switch
                    id="mode-toggle"
                    checked={isFullMode}
                    onCheckedChange={(checked) => onModeChange(checked ? 'full' : 'quick')}
                    className="data-[state=checked]:bg-purple-600"
                />
            </div>
        </div>
    )
}
