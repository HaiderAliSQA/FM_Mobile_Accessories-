export const cloudinaryUrl = (
  url: string,
  options: {
    width?: number
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg'
  } = {}
): string => {
  if (!url || !url.includes('cloudinary.com')) return url

  const { width = 600, quality = 'auto', format = 'auto' } = options

  const transformation = `f_${format},q_${quality},w_${width},c_limit`

  // Insert transformation after /upload/
  return url.replace('/upload/', `/upload/${transformation}/`)
}
