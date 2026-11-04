/**
 * Photo picked in the admin, made light before it is sent (recette T-024): at most MAX_SIDE pixels on its longest side,
 * saved in WebP. A GIF (maybe animated) or a file the browser can't read is sent as it is.
 *   const file = await compressImage(input.files[0])
 */
const MAX_SIDE = 1920
const QUALITY = 0.82

export const compressImage = async file => {
    if (!file || !/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file
    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close?.()
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', QUALITY))
        // Kept only when it is lighter than the original
        if (!blob || blob.size >= file.size) return file
        return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
    } catch {
        return file
    }
}
