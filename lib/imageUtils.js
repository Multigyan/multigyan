// Convert image to WebP
export async function convertToWebP(file, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert'))
              return
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' })
            resolve(webpFile)
          },
          'image/webp',
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read'))
    reader.readAsDataURL(file)
  })
}

// Convert Google Drive URL
export function convertGoogleDriveUrl(url) {
  if (!url || !url.includes('drive.google.com')) return url
  
  let fileId = null
  const match1 = url.match(/\/file\/d\/([^/]+)/)
  if (match1) fileId = match1[1]
  
  const match2 = url.match(/[?&]id=([^&]+)/)
  if (match2) fileId = match2[1]
  
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
  return url
}

// Download via API (server-side, bypasses CORS)
export async function downloadImageViaAPI(url) {
  const response = await fetch('/api/download-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to download')
  }

  return await response.json()
}

// Convert data URL to File
export function dataUrlToFile(dataUrl, filename = 'image.jpg') {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// Optimize image
export async function optimizeImage(file, maxWidth = 1920, maxHeight = 1080) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        
        if (width <= maxWidth && height <= maxHeight) {
          resolve(file)
          return
        }
        
        const aspectRatio = width / height
        if (width > maxWidth) {
          width = maxWidth
          height = Math.round(width / aspectRatio)
        }
        if (height > maxHeight) {
          height = maxHeight
          width = Math.round(height * aspectRatio)
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize'))
              return
            }
            const optimizedFile = new File([blob], file.name, { type: file.type })
            resolve(optimizedFile)
          },
          file.type,
          0.92
        )
      }
      img.onerror = () => reject(new Error('Failed to load'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read'))
    reader.readAsDataURL(file)
  })
}

// Download from Google Drive
export async function googleDriveUrlToFile(url) {
  if (!url || !url.includes('drive.google.com')) return null
  
  try {
    const directUrl = convertGoogleDriveUrl(url)
    const imageData = await downloadImageViaAPI(directUrl)
    const file = dataUrlToFile(imageData.dataUrl, 'google-drive-image.jpg')
    return file
  } catch (error) {
    console.error('Google Drive download failed:', error)
    throw error
  }
}

export async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => reject(new Error('Failed to load'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read'))
    reader.readAsDataURL(file)
  })
}
