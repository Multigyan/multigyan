"use client"

/**
 * 🔍 FILTER & SORT COMPONENT
 * 
 * This component provides filtering and sorting options for post listings.
 * It's highly customizable based on content type (DIY, Recipe, Blog).
 * 
 * Features:
 * 1. Sort by: Latest, Popular, Top Rated, Most Viewed
 * 2. Filter by custom criteria (difficulty, time, cuisine, etc.)
 * 3. URL parameter updates for shareable links
 * 4. Clear filters option
 * 5. Active filter count badge
 * 
 * Usage:
 * <FilterSort 
 *   contentType="diy" 
 *   onFilterChange={(filters) => applyFilters(filters)}
 *   onSortChange={(sort) => applySorting(sort)}
 * />
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export default function FilterSort({ 
  contentType = 'blog', // 'blog', 'diy', 'recipe'
  initialSort = 'latest',
  onFilterChange,
  onSortChange
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [sortBy, setSortBy] = useState(initialSort)
  const [activeFilters, setActiveFilters] = useState({
    difficulty: [], // DIY only
    timeRange: '',
    cuisine: [],    // Recipe only
    diet: [],       // Recipe only
    rating: ''      // All types
  })
  
  // ========================================
  // FILTER OPTIONS BASED ON CONTENT TYPE
  // ========================================
  
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'topRated', label: 'Top Rated' },
    { value: 'mostViewed', label: 'Most Viewed' }
  ]
  
  const difficultyOptions = ['Easy', 'Medium', 'Hard'] // DIY only
  
  const timeRangeOptions = [
    { value: '0-30', label: 'Under 30 min' },
    { value: '30-60', label: '30-60 min' },
    { value: '60-120', label: '1-2 hours' },
    { value: '120+', label: 'Over 2 hours' }
  ]
  
  const cuisineOptions = [ // Recipe only
    'Indian', 'Italian', 'Chinese', 'Mexican', 
    'Thai', 'Japanese', 'American', 'Mediterranean'
  ]
  
  const dietOptions = [ // Recipe only
    'Vegetarian', 'Vegan', 'Gluten-Free', 
    'Dairy-Free', 'Keto', 'Paleo'
  ]
  
  const ratingOptions = [
    { value: '4+', label: '4+ Stars' },
    { value: '3+', label: '3+ Stars' },
    { value: '2+', label: '2+ Stars' }
  ]
  
  // ========================================
  // LOAD FILTERS FROM URL ON MOUNT
  // ========================================
  
  useEffect(() => {
    // Read filters from URL parameters
    const urlSort = searchParams.get('sort')
    const urlDifficulty = searchParams.get('difficulty')
    const urlTime = searchParams.get('time')
    const urlCuisine = searchParams.get('cuisine')
    const urlDiet = searchParams.get('diet')
    const urlRating = searchParams.get('rating')
    
    if (urlSort) setSortBy(urlSort)
    
    if (urlDifficulty) {
      setActiveFilters(prev => ({
        ...prev,
        difficulty: urlDifficulty.split(',')
      }))
    }
    
    if (urlTime) {
      setActiveFilters(prev => ({
        ...prev,
        timeRange: urlTime
      }))
    }
    
    if (urlCuisine) {
      setActiveFilters(prev => ({
        ...prev,
        cuisine: urlCuisine.split(',')
      }))
    }
    
    if (urlDiet) {
      setActiveFilters(prev => ({
        ...prev,
        diet: urlDiet.split(',')
      }))
    }
    
    if (urlRating) {
      setActiveFilters(prev => ({
        ...prev,
        rating: urlRating
      }))
    }
  }, [searchParams])
  
  // ========================================
  // HANDLE SORT CHANGE
  // ========================================
  
  const handleSortChange = (value) => {
    setSortBy(value)
    
    // Update URL
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    router.push(`?${params.toString()}`)
    
    // Notify parent component
    if (onSortChange) {
      onSortChange(value)
    }
  }
  
  // ========================================
  // HANDLE FILTER CHANGES
  // ========================================
  
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      let newFilters = { ...prev }
      
      if (filterType === 'difficulty' || filterType === 'cuisine' || filterType === 'diet') {
        // Toggle array filters
        const array = prev[filterType]
        if (array.includes(value)) {
          newFilters[filterType] = array.filter(item => item !== value)
        } else {
          newFilters[filterType] = [...array, value]
        }
      } else {
        // Single value filters
        newFilters[filterType] = prev[filterType] === value ? '' : value
      }
      
      return newFilters
    })
  }
  
  // Update URL and notify parent when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    // Add filters to URL
    if (activeFilters.difficulty.length > 0) {
      params.set('difficulty', activeFilters.difficulty.join(','))
    } else {
      params.delete('difficulty')
    }
    
    if (activeFilters.timeRange) {
      params.set('time', activeFilters.timeRange)
    } else {
      params.delete('time')
    }
    
    if (activeFilters.cuisine.length > 0) {
      params.set('cuisine', activeFilters.cuisine.join(','))
    } else {
      params.delete('cuisine')
    }
    
    if (activeFilters.diet.length > 0) {
      params.set('diet', activeFilters.diet.join(','))
    } else {
      params.delete('diet')
    }
    
    if (activeFilters.rating) {
      params.set('rating', activeFilters.rating)
    } else {
      params.delete('rating')
    }
    
    router.push(`?${params.toString()}`)
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(activeFilters)
    }
  }, [activeFilters])
  
  // ========================================
  // CLEAR ALL FILTERS
  // ========================================
  
  const clearFilters = () => {
    setActiveFilters({
      difficulty: [],
      timeRange: '',
      cuisine: [],
      diet: [],
      rating: ''
    })
    setSortBy('latest')
    
    // Clear URL parameters
    router.push(window.location.pathname)
  }
  
  // ========================================
  // COUNT ACTIVE FILTERS
  // ========================================
  
  const activeFilterCount = () => {
    let count = 0
    if (activeFilters.difficulty.length > 0) count += activeFilters.difficulty.length
    if (activeFilters.timeRange) count++
    if (activeFilters.cuisine.length > 0) count += activeFilters.cuisine.length
    if (activeFilters.diet.length > 0) count += activeFilters.diet.length
    if (activeFilters.rating) count++
    return count
  }
  
  const filterCount = activeFilterCount()
  
  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* ========================================
          SORT BY DROPDOWN
          ======================================== */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map(option => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={sortBy === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* ========================================
          FILTERS DROPDOWN
          ======================================== */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filters
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Filter By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* DIY: Difficulty Filter */}
          {contentType === 'diy' && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Difficulty
              </DropdownMenuLabel>
              {difficultyOptions.map(level => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={activeFilters.difficulty.includes(level)}
                  onCheckedChange={() => handleFilterChange('difficulty', level)}
                >
                  {level}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Recipe: Cuisine Filter */}
          {contentType === 'recipe' && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Cuisine
              </DropdownMenuLabel>
              {cuisineOptions.map(cuisine => (
                <DropdownMenuCheckboxItem
                  key={cuisine}
                  checked={activeFilters.cuisine.includes(cuisine)}
                  onCheckedChange={() => handleFilterChange('cuisine', cuisine)}
                >
                  {cuisine}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Diet
              </DropdownMenuLabel>
              {dietOptions.map(diet => (
                <DropdownMenuCheckboxItem
                  key={diet}
                  checked={activeFilters.diet.includes(diet)}
                  onCheckedChange={() => handleFilterChange('diet', diet)}
                >
                  {diet}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Time Range Filter (Both DIY and Recipe) */}
          {(contentType === 'diy' || contentType === 'recipe') && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Time Range
              </DropdownMenuLabel>
              {timeRangeOptions.map(range => (
                <DropdownMenuCheckboxItem
                  key={range.value}
                  checked={activeFilters.timeRange === range.value}
                  onCheckedChange={() => handleFilterChange('timeRange', range.value)}
                >
                  {range.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Rating Filter (All types) */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Minimum Rating
          </DropdownMenuLabel>
          {ratingOptions.map(rating => (
            <DropdownMenuCheckboxItem
              key={rating.value}
              checked={activeFilters.rating === rating.value}
              onCheckedChange={() => handleFilterChange('rating', rating.value)}
            >
              {rating.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* ========================================
          CLEAR FILTERS BUTTON
          ======================================== */}
      {filterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1"
        >
          <X size={16} />
          Clear Filters
        </Button>
      )}
      
      {/* ========================================
          ACTIVE FILTERS DISPLAY
          ======================================== */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-2 w-full">
          {activeFilters.difficulty.map(level => (
            <Badge key={level} variant="secondary" className="gap-1">
              Difficulty: {level}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => handleFilterChange('difficulty', level)}
              />
            </Badge>
          ))}
          
          {activeFilters.timeRange && (
            <Badge variant="secondary" className="gap-1">
              Time: {timeRangeOptions.find(r => r.value === activeFilters.timeRange)?.label}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => handleFilterChange('timeRange', activeFilters.timeRange)}
              />
            </Badge>
          )}
          
          {activeFilters.cuisine.map(cuisine => (
            <Badge key={cuisine} variant="secondary" className="gap-1">
              {cuisine}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => handleFilterChange('cuisine', cuisine)}
              />
            </Badge>
          ))}
          
          {activeFilters.diet.map(diet => (
            <Badge key={diet} variant="secondary" className="gap-1">
              {diet}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => handleFilterChange('diet', diet)}
              />
            </Badge>
          ))}
          
          {activeFilters.rating && (
            <Badge variant="secondary" className="gap-1">
              Rating: {activeFilters.rating}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => handleFilterChange('rating', activeFilters.rating)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * ========================================
 * USAGE EXAMPLE
 * ========================================
 * 
 * import FilterSort from '@/components/posts/FilterSort'
 * 
 * function DIYPage() {
 *   const [filteredPosts, setFilteredPosts] = useState(posts)
 * 
 *   const handleFilter = (filters) => {
 *     // Apply filters to posts
 *     let result = posts
 * 
 *     if (filters.difficulty.length > 0) {
 *       result = result.filter(post => 
 *         filters.difficulty.includes(post.difficulty)
 *       )
 *     }
 * 
 *     setFilteredPosts(result)
 *   }
 * 
 *   const handleSort = (sortBy) => {
 *     // Sort posts
 *     let sorted = [...filteredPosts]
 *     
 *     switch (sortBy) {
 *       case 'latest':
 *         sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
 *         break
 *       case 'popular':
 *         sorted.sort((a, b) => b.likes.length - a.likes.length)
 *         break
 *       case 'topRated':
 *         sorted.sort((a, b) => b.averageRating - a.averageRating)
 *         break
 *     }
 * 
 *     setFilteredPosts(sorted)
 *   }
 * 
 *   return (
 *     <div>
 *       <FilterSort 
 *         contentType="diy"
 *         onFilterChange={handleFilter}
 *         onSortChange={handleSort}
 *       />
 *       {filteredPosts.map(post => <PostCard key={post._id} post={post} />)}
 *     </div>
 *   )
 * }
 */
