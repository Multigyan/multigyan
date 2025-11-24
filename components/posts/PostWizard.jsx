"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle2, FileText, Image as ImageIcon, Settings } from "lucide-react"
import WizardProgress from "@/components/posts/wizard/WizardProgress"
import FeaturedImageUploader from "@/components/blog/FeaturedImageUploader"
import EnhancedRichTextEditor from "@/components/editor/EnhancedRichTextEditor"
import CategorySelector from "@/components/blog/CategorySelector"
import FlexibleTagInput from "@/components/blog/FlexibleTagInput"
import TextCounter from "@/components/blog/TextCounter"

export default function PostWizard({ formData, setFormData, categories, wordCount, onSubmit, onSaveDraft, loading, postMode = 'quick' }) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Content", icon: ImageIcon },
    { number: 3, title: "Settings", icon: Settings }
  ]

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1) }
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

  const canProceedToStep2 = formData.title && formData.category
  const canProceedToStep3 = canProceedToStep2 && formData.content && wordCount >= 100
  const canSubmit = canProceedToStep3 && formData.featuredImageUrl

  return (
    <div className="space-y-6">
      <WizardProgress steps={steps} currentStep={currentStep} />
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = steps[currentStep - 1].icon
              return StepIcon ? <StepIcon className="h-5 w-5" /> : null
            })()}
            Step {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Let's start with the basics"}
            {currentStep === 2 && "Add your content and featured image"}
            {currentStep === 3 && "Final touches - tags and SEO"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="wizard-title">Post Title *</Label>
                <Input id="wizard-title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter an engaging post title..." className="mt-1 text-lg" />
                <TextCounter text={formData.title} type="characters" ideal={{ min: 40, max: 70 }} max={100} />
              </div>
              <div>
                <Label>Category *</Label>
                <CategorySelector value={formData.category} onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))} label="" required={true} />
              </div>
              <div>
                <Label htmlFor="wizard-excerpt">Excerpt (Optional)</Label>
                <Textarea id="wizard-excerpt" value={formData.excerpt} onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Write a brief summary of your post..." className="mt-1" rows={3} />
                <TextCounter text={formData.excerpt} type="characters" ideal={{ min: 120, max: 160 }} max={300} />
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Featured Image *</Label>
                <FeaturedImageUploader value={formData.featuredImageUrl} onChange={(url) => setFormData(prev => ({ ...prev, featuredImageUrl: url }))} onAltTextChange={(alt) => setFormData(prev => ({ ...prev, featuredImageAlt: alt }))} altText={formData.featuredImageAlt} />
              </div>
              <div>
                <Label>Content * ({wordCount} words)</Label>
                <EnhancedRichTextEditor content={formData.content} onChange={(html) => setFormData(prev => ({ ...prev, content: html }))} placeholder="Start writing..." />
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Tags</Label>
                <FlexibleTagInput tags={formData.tags} onChange={(tags) => setFormData(prev => ({ ...prev, tags }))} maxTags={10} label="" placeholder="Type tags and press Enter..." description="Add 3-5 relevant tags for best results" />
              </div>


              {/* SEO Settings - Only in Full Mode */}
              {postMode === 'full' ? (
                <>
                  <div>
                    <Label htmlFor="wizard-seo-title">SEO Title (Optional)</Label>
                    <Input id="wizard-seo-title" value={formData.seoTitle} onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))} placeholder="Custom title for search results" className="mt-1" />
                    <TextCounter text={formData.seoTitle} type="characters" ideal={{ min: 50, max: 60 }} max={70} />
                  </div>
                  <div>
                    <Label htmlFor="wizard-seo-desc">SEO Description (Optional)</Label>
                    <Textarea id="wizard-seo-desc" value={formData.seoDescription} onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))} placeholder="Description for search results" className="mt-1" rows={2} />
                    <TextCounter text={formData.seoDescription} type="characters" ideal={{ min: 120, max: 160 }} max={200} />
                  </div>
                </>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Switch to <strong>Full Post mode</strong> above to access advanced SEO settings (SEO Title & Description)
                  </p>
                </div>
              )}

              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Ready to Publish!</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>✓ Title: {formData.title}</p>
                  <p>✓ Category: Selected</p>
                  <p>✓ Content: {wordCount} words</p>
                  <p>✓ Featured Image: Added</p>
                  {formData.tags.length > 0 && <p>✓ Tags: {formData.tags.length} added</p>}
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onSaveDraft}><Save className="mr-2 h-4 w-4" />Save</Button>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={(currentStep === 1 && !canProceedToStep2) || (currentStep === 2 && !canProceedToStep3)}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button>
              ) : (
                <Button onClick={onSubmit} disabled={loading || !canSubmit}>{loading ? "Publishing..." : "Publish"}</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
