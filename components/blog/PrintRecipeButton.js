"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

/**
 * PrintRecipeButton - Triggers print dialog with print-friendly styles
 * The print styles are defined in globals.css
 */
export default function PrintRecipeButton({ className = "" }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <Printer className="h-4 w-4" />
      Print Recipe
    </Button>
  )
}
