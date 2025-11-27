'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, TrendingUp, Clock, Flame } from 'lucide-react'

export default function SortDropdown() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentSort = searchParams.get('sort') || 'latest'

    const sortOptions = [
        { value: 'latest', label: 'Latest', icon: Clock },
        { value: 'popular', label: 'Popular', icon: TrendingUp },
        { value: 'trending', label: 'Trending', icon: Flame },
    ]

    const handleSort = (value) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'latest') {
            params.delete('sort')
        } else {
            params.set('sort', value)
        }
        params.delete('page') // Reset to page 1 when sorting

        const queryString = params.toString()
        router.push(`/blog${queryString ? `?${queryString}` : ''}`)
    }

    const currentOption = sortOptions.find(opt => opt.value === currentSort) || sortOptions[0]
    const CurrentIcon = currentOption.icon

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <CurrentIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort by:</span>
                    <span>{currentOption.label}</span>
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {sortOptions.map((option) => {
                    const Icon = option.icon
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSort(option.value)}
                            className={currentSort === option.value ? 'bg-accent' : ''}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {option.label}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
