"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchForm({ initialSearch = "" }) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState(initialSearch)

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchTerm.trim()) return

        // Navigate to blog page with search query
        router.push(`/blog?search=${encodeURIComponent(searchTerm)}`)
    }

    const clearSearch = () => {
        setSearchTerm("")
        router.push('/blog')
    }

    return (
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                />
            </div>
            <Button type="submit" className="h-11 sm:h-10 w-full sm:w-auto">Search</Button>
            {searchTerm && (
                <Button type="button" variant="outline" onClick={clearSearch} className="h-11 sm:h-10 w-full sm:w-auto">
                    Clear
                </Button>
            )}
        </form>
    )
}
