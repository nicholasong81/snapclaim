// Resize and compress image before sending to AI
// Reduces token cost by 70-80%
// Max 1000px wide is sufficient to read receipt text

export async function resizeImageForAI(
  dataUrl: string,
  maxWidth = 1000,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')

      let width = img.width
      let height = img.height

      // Only resize if wider than maxWidth
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width)
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      const resized = canvas.toDataURL(
        'image/jpeg', 
        quality
      )

      resolve(resized)
    }

    img.onerror = () => 
      reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

// Get approximate file size from base64
export function getBase64Size(base64: string): number {
  const base64Data = base64.includes('base64,')
    ? base64.split('base64,')[1]
    : base64
  return Math.round(base64Data.length * 0.75)
}

// Format bytes to human readable
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) 
    return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
