"use client"

import { Check } from "lucide-react"

export default function WizardProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isCurrent = step.number === currentStep
        const Icon = step.icon

        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                isCompleted ? "bg-green-600 border-green-600 text-white" :
                isCurrent ? "bg-primary border-primary text-primary-foreground" :
                "bg-background border-muted-foreground/30 text-muted-foreground"
              }`}>
                {isCompleted ? <Check className="h-5 w-5" /> : Icon ? <Icon className="h-5 w-5" /> : step.number}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"}`}>
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition-colors ${
                isCompleted ? "bg-green-600" : "bg-muted-foreground/20"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
