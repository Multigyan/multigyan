"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus, ExternalLink } from "lucide-react"

export default function AffiliateLinkManager({ links = [], onChange }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: ""
  })

  const handleAdd = () => {
    if (formData.name.trim() && formData.url.trim()) {
      onChange([...links, { ...formData }])
      setFormData({ name: "", url: "", description: "" })
      setShowForm(false)
    }
  }

  const handleRemove = (index) => {
    onChange(links.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <Label>
        Affiliate Links (Optional)
      </Label>
      <p className="text-xs text-muted-foreground">
        Add links to products you recommend (Amazon, etc.)
      </p>

      {/* Display existing links */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => (
            <Card key={index} className="group">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{link.name}</span>
                    </div>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {link.url}
                    </a>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new link form */}
      {showForm ? (
        <Card className="border-2 border-primary">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label htmlFor="linkName">Product Name *</Label>
              <Input
                id="linkName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Professional Paint Brush Set"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="linkUrl">Product URL *</Label>
              <Input
                id="linkUrl"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://amazon.in/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="linkDescription">Description (Optional)</Label>
              <Textarea
                id="linkDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Why you recommend this product..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={handleAdd}
                size="sm"
                disabled={!formData.name.trim() || !formData.url.trim()}
              >
                Add Link
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setShowForm(false)
                  setFormData({ name: "", url: "", description: "" })
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          type="button" 
          onClick={() => setShowForm(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Affiliate Link
        </Button>
      )}

      {links.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground italic">
          No affiliate links added yet. Click the button above to add one.
        </p>
      )}
    </div>
  )
}
