import { randomBytes } from 'node:crypto'
import { extname } from 'node:path'
import { DatabaseHelper } from './DatabaseHelper.js'

/*
 * Images uploaded from the admin: the photos of the projects and the photo of "About me".
 *   Stored in the database (dc_uploads): a new deployment of the site never loses them, and they are in the database backups.
 *   URL: /upload/images/<name> saved in dc_projects.img, served by /api/upload/images/<name>
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

// Name of an image in its public path ("/upload/images/abc.jpg" -> "abc.jpg"), null for anything else
const nameOf = publicPath => publicPath?.startsWith(PUBLIC_PREFIX) ? publicPath.slice(PUBLIC_PREFIX.length) : null

export const UploadHelper = {
    /** True when the uploaded file has an accepted image extension. */
    isAcceptedImage: file => Boolean(MIME_TYPES[extname(file?.filename || '').toLowerCase()]),

    /** Saves an uploaded image under a random name and returns its public path (/upload/images/...). */
    async saveImage(file) {
        const extension = extname(file.filename).toLowerCase()
        const name = `${Date.now()}-${randomBytes(4).toString('hex')}${extension}`
        await DatabaseHelper.insert('INSERT INTO dc_uploads (name, mime_type, data) VALUES (?, ?, ?)', [name, MIME_TYPES[extension], file.data])
        return `${PUBLIC_PREFIX}${name}`
    },

    /** Removes a previously uploaded image (ignored for static images). */
    async removeImage(publicPath) {
        const name = nameOf(publicPath)
        if (name) await DatabaseHelper.execute('DELETE FROM dc_uploads WHERE name = ?', [name])
    },

    /** Content and type of an uploaded image ("images/<name>"), or null when it does not exist. */
    async read(path) {
        const name = nameOf(`/upload/${path}`)
        if (!name || name.includes('/')) return { forbidden: true }
        const row = await DatabaseHelper.fetchOne('SELECT mime_type, data FROM dc_uploads WHERE name = ? LIMIT 1', [name])
        return row ? { file: row.data, mimeType: row.mime_type } : null
    },
}
