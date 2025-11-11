"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus, Lightbulb, Target, DollarSign, AlertTriangle } from 'lucide-react'

export default function ProjectOverview({ formData, setFormData }) {
  const [newSkill, setNewSkill] = useState('')
  const [newPrereq, setNewPrereq] = useState('')
  const [newWarning, setNewWarning] = useState('')

  // Add learning outcome
  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        whatYouWillLearn: [...(formData.whatYouWillLearn || []), newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  // Remove learning outcome
  const removeSkill = (index) => {
    const updated = formData.whatYouWillLearn.filter((_, i) => i !== index)
    setFormData({ ...formData, whatYouWillLearn: updated })
  }

  // Add prerequisite
  const addPrereq = () => {
    if (newPrereq.trim()) {
      setFormData({
        ...formData,
        prerequisites: [...(formData.prerequisites || []), newPrereq.trim()]
      })
      setNewPrereq('')
    }
  }

  // Remove prerequisite
  const removePrereq = (index) => {
    const updated = formData.prerequisites.filter((_, i) => i !== index)
    setFormData({ ...formData, prerequisites: updated })
  }

  // Add safety warning
  const addWarning = () => {
    if (newWarning.trim()) {
      setFormData({
        ...formData,
        safetyWarnings: [...(formData.safetyWarnings || []), newWarning.trim()]
      })
      setNewWarning('')
    }
  }

  // Remove safety warning
  const removeWarning = (index) => {
    const updated = formData.safetyWarnings.filter((_, i) => i !== index)
    setFormData({ ...formData, safetyWarnings: updated })
  }

  const projectTypes = [
    'electronics', 'woodworking', 'crafts', '3dprinting', 
    'programming', 'robotics', 'iot', 'home-improvement', 'other'
  ]

  const audiences = [
    'kids', 'teens', 'adults', 'professionals', 
    'beginners', 'intermediate', 'advanced'
  ]

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']

  return (
    <Card className="border-2 border-orange-500/30 bg-orange-50/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Project Overview
        </CardTitle>
        <CardDescription>
          Tell readers what they'll learn and what to expect from this DIY project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Type */}
        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Select
            value={formData.projectType || 'other'}
            onValueChange={(value) => setFormData({ ...formData, projectType: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1').replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Helps readers find projects in their area of interest
          </p>
        </div>

        {/* Inspiration Story */}
        <div>
          <Label htmlFor="inspirationStory">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-orange-600" />
              Inspiration Story (Optional)
            </div>
          </Label>
          <Textarea
            id="inspirationStory"
            placeholder="What inspired you to create this project? Share your story to connect with readers..."
            value={formData.inspirationStory || ''}
            onChange={(e) => setFormData({ ...formData, inspirationStory: e.target.value })}
            rows={4}
            maxLength={1000}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {(formData.inspirationStory?.length || 0)}/1000 characters
          </p>
        </div>

        {/* What You'll Learn */}
        <div>
          <Label>
            What You'll Learn (Optional but Recommended)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            List key skills or knowledge readers will gain from this project
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Arduino programming, Circuit design, 3D modeling"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.whatYouWillLearn || []).map((skill, index) => (
              <Badge key={index} variant="secondary" className="gap-2">
                {skill}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeSkill(index)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Prerequisites */}
        <div>
          <Label>Prerequisites (Optional)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            What skills or knowledge should readers have before starting?
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Basic soldering skills, Familiarity with Arduino IDE"
              value={newPrereq}
              onChange={(e) => setNewPrereq(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrereq())}
            />
            <Button type="button" onClick={addPrereq} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.prerequisites || []).map((prereq, index) => (
              <Badge key={index} variant="outline" className="gap-2">
                {prereq}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removePrereq(index)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Safety Warnings */}
        <div>
          <Label>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Safety Warnings (Optional but Important)
            </div>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Add important safety precautions readers should follow
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Use safety goggles, Work in ventilated area, Adult supervision required"
              value={newWarning}
              onChange={(e) => setNewWarning(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWarning())}
            />
            <Button type="button" onClick={addWarning} size="icon" variant="destructive">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.safetyWarnings || []).map((warning, index) => (
              <Badge key={index} variant="destructive" className="gap-2">
                ⚠️ {warning}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeWarning(index)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Estimated Cost */}
        <div>
          <Label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Estimated Cost (Optional)
            </div>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Give readers a budget range for this project
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={formData.estimatedCost?.min || ''}
              onChange={(e) => setFormData({
                ...formData,
                estimatedCost: { 
                  ...(formData.estimatedCost || {}), 
                  min: parseFloat(e.target.value) || 0 
                }
              })}
              min="0"
              step="1"
            />
            <Input
              type="number"
              placeholder="Max"
              value={formData.estimatedCost?.max || ''}
              onChange={(e) => setFormData({
                ...formData,
                estimatedCost: { 
                  ...(formData.estimatedCost || {}), 
                  max: parseFloat(e.target.value) || 0 
                }
              })}
              min="0"
              step="1"
            />
            <Select
              value={formData.estimatedCost?.currency || 'USD'}
              onValueChange={(value) => setFormData({
                ...formData,
                estimatedCost: { ...(formData.estimatedCost || {}), currency: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.estimatedCost?.min && formData.estimatedCost?.max && (
            <p className="text-sm text-muted-foreground mt-2">
              💰 Budget Range: {formData.estimatedCost.currency} {formData.estimatedCost.min} - {formData.estimatedCost.max}
            </p>
          )}
        </div>

        {/* Target Audience */}
        <div>
          <Label>Target Audience (Optional)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Who is this project best suited for? Select all that apply
          </p>
          <div className="flex flex-wrap gap-2">
            {audiences.map(audience => (
              <Badge
                key={audience}
                variant={(formData.targetAudience || []).includes(audience) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => {
                  const current = formData.targetAudience || []
                  const updated = current.includes(audience)
                    ? current.filter(a => a !== audience)
                    : [...current, audience]
                  setFormData({ ...formData, targetAudience: updated })
                }}
              >
                {audience.charAt(0).toUpperCase() + audience.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
