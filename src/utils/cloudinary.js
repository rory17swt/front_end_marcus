/**
 * Adds Cloudinary URL transformations for optimized image delivery.
 * Only transforms Cloudinary URLs — passes through other URLs unchanged.
 */
export function optimizeCloudinaryUrl(url, { width, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url

  const widthParam = width ? `w_${width},` : ''
  return url.replace('/upload/', `/upload/${widthParam}q_${quality},f_${format}/`)
}
