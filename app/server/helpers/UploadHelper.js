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

// 5 MB at most per image
const MAX_BYTES = 5 * 1024 * 1024
// First bytes of each accepted type
const startsWith = (data, bytes, offset = 0) => bytes.every((byte, i) => data[offset + i] === byte)
const SIGNATURES = {
    jpeg: data => startsWith(data, [0xFF, 0xD8, 0xFF]),
    png: data => startsWith(data, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    gif: data => startsWith(data, [0x47, 0x49, 0x46, 0x38]),
    webp: data => startsWith(data, [0x52, 0x49, 0x46, 0x46]) && startsWith(data, [0x57, 0x45, 0x42, 0x50], 8),
    avif: data => startsWith(data, [0x66, 0x74, 0x79, 0x70], 4) && ['avif', 'avis'].includes(Buffer.from(data.subarray(8, 12)).toString('latin1')),
}

const PUBLIC_PREFIX = '/upload/images/'

// Name of an image in its public path ("/upload/images/abc.jpg" -> "abc.jpg"), null for anything else
const nameOf = publicPath => publicPath?.startsWith(PUBLIC_PREFIX) ? publicPath.slice(PUBLIC_PREFIX.length) : null

export const UploadHelper = {
    /**
     * True when the uploaded file is really an accepted image: its extension, its first bytes (a PHP or HTML file
     * renamed in .png is refused) and its size (MAX_BYTES at most, the admin compresses photos before sending them).
     */
    isAcceptedImage(file) {
        const extension = extname(file?.filename || '').toLowerCase()
        const data = file?.data
        if (!MIME_TYPES[extension] || !data?.length || data.length > MAX_BYTES) return false
        return Object.values(SIGNATURES).some(isOf => isOf(data))
    },
    MAX_BYTES,

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
