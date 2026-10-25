import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'

/*
 * Uploaded images of the projects.
 *   Files:  upload/images/ in development, .output/public/upload/images/ in production
 *   URL:    /upload/images/<file> stored in the database, served by /api/upload/images/<file>
 */

// Accepted and served types: raster images only (an SVG can carry scripts)
const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
}

const PUBLIC_PREFIX = '/upload/images/'

// Root folder of the uploads for the current runtime
const uploadRoot = () => process.env.NODE_ENV === 'production'
    ? join(process.cwd(), '.output', 'public', 'upload')
    : join(process.cwd(), 'upload')

const imagesDir = () => join(uploadRoot(), 'images')

export const UploadHelper = {
    /** True when the uploaded file has an accepted image extension. */
    isAcceptedImage: file => Boolean(MIME_TYPES[extname(file?.filename || '').toLowerCase()]),

    /** Saves an uploaded image under a random name and returns its public path (/upload/images/...). */
    async saveImage(file) {
        await mkdir(imagesDir(), { recursive: true })
        const filename = `${Date.now()}-${randomBytes(4).toString('hex')}${extname(file.filename).toLowerCase()}`
        await writeFile(join(imagesDir(), filename), file.data)
        return `${PUBLIC_PREFIX}${filename}`
    },

    /** Removes a previously uploaded image (ignored for static images and missing files). */
    async removeImage(publicPath) {
        if (!publicPath?.startsWith(PUBLIC_PREFIX)) return
        const file = UploadHelper.resolveFile(publicPath.slice('/upload/'.length))
        if (file && existsSync(file)) await unlink(file).catch(error => console.warn('Could not delete image:', error))
    },

    /** Absolute path of an uploaded file, or null when the path leaves the upload folder. */
    resolveFile(path) {
        const root = resolve(uploadRoot())
        const file = resolve(root, path)
        return file.startsWith(root + sep) ? file : null
    },

    /** Content and type of an uploaded image, or null when it does not exist or is not an accepted image. */
    async read(path) {
        const file = UploadHelper.resolveFile(path)
        if (!file) return { forbidden: true }
        const mimeType = MIME_TYPES[extname(file).toLowerCase()]
        if (!mimeType || !existsSync(file)) return null
        return { file: await readFile(file), mimeType }
    },
}
