"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, Users } from "lucide-react"

export default function RecipeScaler({ initialServings = 4, ingredients = [] }) {
    const [servings, setServings] = useState(initialServings)
    const scaleFactor = servings / initialServings

    const scaleIngredient = (ingredient) => {
        // Parse ingredient string to find numbers
        const numberRegex = /(\d+(?:\.\d+)?(?:\/\d+)?)/g

        return ingredient.replace(numberRegex, (match) => {
            // Handle fractions
            if (match.includes('/')) {
                const [num, denom] = match.split('/').map(Number)
                const scaled = (num / denom) * scaleFactor
                return formatNumber(scaled)
            }

            // Handle regular numbers
            const scaled = parseFloat(match) * scaleFactor
            return formatNumber(scaled)
        })
    }

    const formatNumber = (num) => {
        // Round to 2 decimal places
        const rounded = Math.round(num * 100) / 100

        // Convert to fraction if it's a common one
        const fractions = {
            0.25: '¼',
            0.33: '⅓',
            0.5: '½',
            0.67: '⅔',
            0.75: '¾'
        }

        const decimal = rounded % 1
        const whole = Math.floor(rounded)

        if (fractions[decimal.toFixed(2)]) {
            return whole > 0
                ? `${whole} ${fractions[decimal.toFixed(2)]}`
                : fractions[decimal.toFixed(2)]
        }

        // Return as is if not a common fraction
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)
    }

    const incrementServings = () => {
        setServings(prev => Math.min(prev + 1, 50)) // Max 50 servings
    }

    const decrementServings = () => {
        setServings(prev => Math.max(prev - 1, 1)) // Min 1 serving
    }

    const resetServings = () => {
        setServings(initialServings)
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Servings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={decrementServings}
                            disabled={servings <= 1}
                            aria-label="Decrease servings"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <div className="text-center min-w-[60px]">
                            <div className="text-2xl font-bold">{servings}</div>
                            <div className="text-xs text-muted-foreground">servings</div>
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={incrementServings}
                            disabled={servings >= 50}
                            aria-label="Increase servings"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {servings !== initialServings && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetServings}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                {servings !== initialServings && (
                    <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded-md">
                        Scaled from {initialServings} servings (×{scaleFactor.toFixed(2)})
                    </div>
                )}

                {ingredients.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Ingredients:</h4>
                        <ul className="space-y-2">
                            {ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span className={servings !== initialServings ? "font-medium" : ""}>
                                        {scaleIngredient(ingredient)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
