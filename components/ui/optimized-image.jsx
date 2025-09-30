"use client"

import Image from 'next/image'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'

/**
 * Optimized Image component with lazy loading, error handling, and performance optimizations
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  fallbackIcon: FallbackIcon = BookOpen,
  quality = 80,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) {
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleError = () => {
    setImageError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  // If image failed to load or no src provided, show fallback
  if (imageError || !src) {
    return (
      <div 
        className={`bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <FallbackIcon className="h-8 w-8 text-primary/60" />
      </div>
    )
  }

  const imageProps = {
    src,
    alt: alt || 'Image',
    onError: handleError,
    onLoad: handleLoad,
    quality,
    placeholder,
    sizes,
    className: `${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    ...props
  }

  // Add blur data URL for better loading experience
  if (placeholder === 'blur' && !imageProps.blurDataURL) {
    imageProps.blurDataURL = blurDataURL
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        priority={priority}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      priority={priority}
    />
  )
}