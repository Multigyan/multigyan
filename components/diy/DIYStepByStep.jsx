"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react"

export default function DIYStepByStep({ steps = [], difficulty, estimatedTime, materials = [], tools = [] }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState(new Set())

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const toggleStepCompletion = (stepIndex) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev)
            if (newSet.has(stepIndex)) {
                newSet.delete(stepIndex)
            } else {
                newSet.add(stepIndex)
            }
            return newSet
        })
    }

    const progressPercentage = (completedSteps.size / steps.length) * 100

    if (steps.length === 0) return null

    return (
        <div className="space-y-6 mb-8">
            {/* Project Info */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {difficulty && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                                <Badge variant={
                                    difficulty === 'Easy' ? 'default' :
                                        difficulty === 'Medium' ? 'secondary' : 'destructive'
                                }>
                                    {difficulty}
                                </Badge>
                            </div>
                        )}
                        {estimatedTime && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Time</div>
                                <div className="font-semibold">{estimatedTime} min</div>
                            </div>
                        )}
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Steps</div>
                            <div className="font-semibold">{steps.length}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Progress</div>
                            <div className="font-semibold">{completedSteps.size}/{steps.length}</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Materials & Tools */}
            {(materials.length > 0 || tools.length > 0) && (
                <Card>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {materials.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Materials Needed</h3>
                                    <ul className="space-y-2">
                                        {materials.map((material, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <Circle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{material}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {tools.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Tools Required</h3>
                                    <ul className="space-y-2">
                                        {tools.map((tool, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <Circle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{tool}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step Navigation */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Step {currentStep + 1} of {steps.length}
                        </h3>
                        <Button
                            variant={completedSteps.has(currentStep) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleStepCompletion(currentStep)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {completedSteps.has(currentStep) ? "Completed" : "Mark Complete"}
                        </Button>
                    </div>

                    {/* Current Step Content */}
                    <div className="prose prose-sm max-w-none mb-6">
                        <div dangerouslySetInnerHTML={{ __html: steps[currentStep] }} />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={goToPreviousStep}
                            disabled={currentStep === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        {currentStep === steps.length - 1 ? (
                            <Button
                                variant="default"
                                onClick={() => toggleStepCompletion(currentStep)}
                                disabled={completedSteps.size === steps.length}
                            >
                                {completedSteps.size === steps.length ? "All Done! 🎉" : "Finish"}
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                onClick={goToNextStep}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Step Overview */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">All Steps</h3>
                    <div className="space-y-2">
                        {steps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${currentStep === index
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.has(index)
                                            ? "bg-primary text-primary-foreground"
                                            : "border-2 border-muted-foreground"
                                        }`}>
                                        {completedSteps.has(index) ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <span className="text-xs">{index + 1}</span>
                                        )}
                                    </div>
                                    <span className={`text-sm ${currentStep === index ? "font-semibold" : ""}`}>
                                        Step {index + 1}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
