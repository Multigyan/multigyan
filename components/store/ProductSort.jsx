"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

export default function ProductSort({ value, onChange }) {
    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "popular", label: "Most Popular" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "rating", label: "Highest Rated" },
    ]

    return (
        <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
