/**
 * Image Utility Functions
 * 
 * Provides utilities for:
 * - Converting images to WebP format
 * - Optimizing image quality
 * - Handling Google Drive URLs
 */

/**
 * Convert image file to WebP format
 * @param {File} file - Original image file
 * @param {number} quality - Quality (0-1, default 0.9)
 * @returns {Promise<File>} - WebP file
 */
export async function convertToWebP(file, quality = 0.9) {
  return new Promise((resolve, reject) => {
    // Check if browser supports WebP
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
      console.warn('Browser does not support WebP, using original format')
      resolve(file)
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0)
        
        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to WebP'))
              return
            }
            
            // Create new File object from blob
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'),
              { type: 'image/webp' }
            )
            
            console.log(`Image converted: ${(file.size / 1024).toFixed(2)}KB → ${(webpFile.size / 1024).toFixed(2)}KB WebP`)
            resolve(webpFile)
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Convert Google Drive share URL to direct image URL
 * @param {string} url - Google Drive share URL
 * @returns {string} - Direct image URL or original URL
 */
export function convertGoogleDriveUrl(url) {
  if (!url) return url
  
  // Check if it's a Google Drive URL
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    let fileId = null
    
    // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const match1 = url.match(/\/file\/d\/([^/]+)/)
    if (match1) {
      fileId = match1[1]
    }
    
    // Format 2: https://drive.google.com/open?id=FILE_ID
    const match2 = url.match(/[?&]id=([^&]+)/)
    if (match2) {
      fileId = match2[1]
    }
    
    // If we found a file ID, convert to direct URL
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
  }
  
  return url
}

/**
 * Optimize image by resizing if too large
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<File>} - Optimized file
 */
export async function optimizeImage(file, maxWidth = 1920, maxHeight = 1080) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        let width = img.width
        let height = img.height
        
        // Check if resize is needed
        if (width <= maxWidth && height <= maxHeight) {
          resolve(file)
          return
        }
        
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = width / height
        
        if (width > maxWidth) {
          width = maxWidth
          height = Math.round(width / aspectRatio)
        }
        
        if (height > maxHeight) {
          height = maxHeight
          width = Math.round(height * aspectRatio)
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'))
              return
            }
            
            const optimizedFile = new File([blob], file.name, { type: file.type })
            console.log(`Image optimized: ${img.width}x${img.height} → ${width}x${height}`)
            resolve(optimizedFile)
          },
          file.type,
          0.92
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Validate if URL is a valid image URL
 * @param {string} url - URL to validate
 * @returns {Promise<boolean>} - True if valid image URL
 */
export async function isValidImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    // Set timeout to prevent hanging
    setTimeout(() => resolve(false), 5000)
    
    img.src = url
  })
}
