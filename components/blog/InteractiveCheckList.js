"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

/**
 * InteractiveCheckList - A checkable list component for ingredients or materials
 * Features:
 * - Users can check off items as they complete them
 * - Progress is saved to localStorage
 * - Reset button to clear all checks
 * - Visual progress indicator
 */
export default function InteractiveCheckList({ 
  title, 
  items = [], 
  icon: Icon,
  storageKey,
  className = ""
}) {
  const [checkedItems, setCheckedItems] = useState({})
  const [mounted, setMounted] = useState(false)

  // Load checked state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          setCheckedItems(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading checked items:', error)
      }
    }
  }, [storageKey])

  // Save checked state to localStorage whenever it changes
  useEffect(() => {
    if (mounted && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(checkedItems))
      } catch (error) {
        console.error('Error saving checked items:', error)
      }
    }
  }, [checkedItems, storageKey, mounted])

  const handleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleReset = () => {
    setCheckedItems({})
  }

  // Calculate progress
  const totalItems = items.length
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-md">
                <div className="h-5 w-5 rounded-sm border border-input bg-background" />
                <span className="flex-1 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </span>
          {checkedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </CardTitle>
        {totalItems > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{checkedCount} of {totalItems} completed</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No items listed</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-2 rounded-md transition-all ${
                  checkedItems[index] 
                    ? 'bg-green-50 border border-green-200' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={`item-${index}`}
                  checked={checkedItems[index] || false}
                  onCheckedChange={() => handleCheck(index)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`item-${index}`}
                  className={`flex-1 text-sm cursor-pointer transition-all ${
                    checkedItems[index] 
                      ? 'line-through text-muted-foreground' 
                      : ''
                  }`}
                >
                  {item}
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
