"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Minus, 
  AlertCircle, 
  FileText,
  Image as ImageIcon,
  Tag,
  Type
} from 'lucide-react'

/**
 * Custom Diff Viewer Component
 * Shows differences between original and revised content
 * No external dependencies - pure React
 */
export default function DiffViewer({ original, revised, title = "Content Comparison" }) {
  // Generate word-level diff
  const generateWordDiff = (oldText = '', newText = '') => {
    const oldWords = oldText.split(/(\s+)/)
    const newWords = newText.split(/(\s+)/)
    
    const result = []
    let i = 0, j = 0
    
    while (i < oldWords.length || j < newWords.length) {
      if (i >= oldWords.length) {
        result.push({ type: 'added', text: newWords[j] })
        j++
      } else if (j >= newWords.length) {
        result.push({ type: 'removed', text: oldWords[i] })
        i++
      } else if (oldWords[i] === newWords[j]) {
        result.push({ type: 'unchanged', text: oldWords[i] })
        i++
        j++
      } else {
        // Check if word exists later in the other array
        const oldInNew = newWords.indexOf(oldWords[i], j)
        const newInOld = oldWords.indexOf(newWords[j], i)
        
        if (oldInNew > j && oldInNew < j + 5) {
          // Word was added
          result.push({ type: 'added', text: newWords[j] })
          j++
        } else if (newInOld > i && newInOld < i + 5) {
          // Word was removed
          result.push({ type: 'removed', text: oldWords[i] })
          i++
        } else {
          // Both changed
          result.push({ type: 'removed', text: oldWords[i] })
          result.push({ type: 'added', text: newWords[j] })
          i++
          j++
        }
      }
    }
    
    return result
  }
  
  // Compare two strings
  const hasChanges = (oldVal = '', newVal = '') => {
    return oldVal?.toString().trim() !== newVal?.toString().trim()
  }
  
  // Render diff for simple fields
  const renderFieldDiff = (label, oldValue, newValue, icon: any) => {
    const Icon = icon
    const changed = hasChanges(oldValue, newValue)
    
    if (!changed && !oldValue && !newValue) return null
    
    return (
      <div className={`rounded-lg border p-4 ${changed ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{label}</span>
          {changed && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Modified
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <Minus className="h-3 w-3" />
              Original
            </div>
            <div className={`p-3 rounded border ${changed ? 'bg-red-50 border-red-200 line-through decoration-red-500' : 'bg-white'}`}>
              <p className="text-sm whitespace-pre-wrap break-words">
                {oldValue || <span className="text-gray-400 italic">Empty</span>}
              </p>
            </div>
          </div>
          
          {/* Revised */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <Plus className="h-3 w-3" />
              Revised
            </div>
            <div className={`p-3 rounded border ${changed ? 'bg-green-50 border-green-200 font-medium' : 'bg-white'}`}>
              <p className="text-sm whitespace-pre-wrap break-words">
                {newValue || <span className="text-gray-400 italic">Empty</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Render inline diff with word highlighting
  const renderInlineDiff = (oldText = '', newText = '') => {
    const diff = generateWordDiff(oldText, newText)
    
    return (
      <div className="space-y-1">
        {diff.map((part, idx) => (
          <span
            key={idx}
            className={
              part.type === 'added'
                ? 'bg-green-200 text-green-900 px-1 rounded'
                : part.type === 'removed'
                ? 'bg-red-200 text-red-900 line-through px-1 rounded'
                : ''
            }
          >
            {part.text}
          </span>
        ))}
      </div>
    )
  }
  
  // Count total changes
  const changesSummary = useMemo(() => {
    let count = 0
    if (hasChanges(original?.title, revised?.title)) count++
    if (hasChanges(original?.content, revised?.content)) count++
    if (hasChanges(original?.excerpt, revised?.excerpt)) count++
    if (hasChanges(original?.featuredImageUrl, revised?.featuredImageUrl)) count++
    if (hasChanges(original?.category?.toString(), revised?.category?.toString())) count++
    if (JSON.stringify(original?.tags || []) !== JSON.stringify(revised?.tags || [])) count++
    return count
  }, [original, revised])
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant={changesSummary > 0 ? "default" : "secondary"}>
            {changesSummary} {changesSummary === 1 ? 'Change' : 'Changes'}
          </Badge>
        </div>
        {changesSummary > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>Review the changes below before approving</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {changesSummary === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No changes detected</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Changes</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            {/* All Changes */}
            <TabsContent value="all" className="space-y-4 mt-4">
              {renderFieldDiff('Title', original?.title, revised?.title, Type)}
              
              {hasChanges(original?.content, revised?.content) && (
                <div className="rounded-lg border p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Content</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Modified
                    </Badge>
                  </div>
                  
                  <div className="h-[300px] w-full rounded border bg-white p-4 overflow-auto">
                    {renderInlineDiff(original?.content, revised?.content)}
                  </div>
                </div>
              )}
              
              {renderFieldDiff('Excerpt', original?.excerpt, revised?.excerpt, FileText)}
              {renderFieldDiff('Featured Image', original?.featuredImageUrl, revised?.featuredImageUrl, ImageIcon)}
              
              {hasChanges(JSON.stringify(original?.tags || []), JSON.stringify(revised?.tags || [])) && (
                <div className="rounded-lg border p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Tags</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Modified
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
                      <div className="flex flex-wrap gap-1">
                        {(original?.tags || []).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-red-50 border-red-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Revised</div>
                      <div className="flex flex-wrap gap-1">
                        {(revised?.tags || []).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 border-green-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              {renderFieldDiff('Title', original?.title, revised?.title, Type)}
              
              {hasChanges(original?.content, revised?.content) && (
                <div className="rounded-lg border p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Content</span>
                  </div>
                  
                  <div className="h-[400px] w-full rounded border bg-white p-4 overflow-auto">
                    {renderInlineDiff(original?.content, revised?.content)}
                  </div>
                </div>
              )}
              
              {renderFieldDiff('Excerpt', original?.excerpt, revised?.excerpt, FileText)}
            </TabsContent>
            
            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4 mt-4">
              {renderFieldDiff('Featured Image', original?.featuredImageUrl, revised?.featuredImageUrl, ImageIcon)}
              
              {hasChanges(JSON.stringify(original?.tags || []), JSON.stringify(revised?.tags || [])) && (
                <div className="rounded-lg border p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Tags</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
                      <div className="flex flex-wrap gap-1">
                        {(original?.tags || []).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-red-50 border-red-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Revised</div>
                      <div className="flex flex-wrap gap-1">
                        {(revised?.tags || []).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 border-green-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
