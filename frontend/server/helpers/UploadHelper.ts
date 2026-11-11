import { randomBytes } from 'node:crypto'
import { extname } from 'node:path'
import { DatabaseHelper } from '../utils/DatabaseHelper'

/*
 * Images uploaded from the admin: the photos of the projects and the photo of "About me".
 *   Stored in the database (dc_uploads): a new deployment of the site never loses them, and they are in the database backups.
 *   URL: /upload/images/<name> saved in dc_projects.img, served by /api/upload/images/<name>
 *   A project photo can have a small copy for the grid (640 px, made by the browser): /upload/images/thumb-<name>
 */

// Accepted and served types: raster images only (an SVG can carry scripts)
const MIME_TYPES: Record<string, string> = {
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
// A file of a form (readMultipartFormData): its name and its bytes
export type UploadedFile = { filename?: string, data: Buffer }

const startsWith = (data: Buffer, bytes: number[], offset = 0) => bytes.every((byte, i) => data[offset + i] === byte)
const SIGNATURES: Record<string, (data: Buffer) => boolean> = {
    jpeg: (data) => startsWith(data, [0xFF, 0xD8, 0xFF]),
    png: (data) => startsWith(data, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    gif: (data) => startsWith(data, [0x47, 0x49, 0x46, 0x38]),
    webp: (data) => startsWith(data, [0x52, 0x49, 0x46, 0x46]) && startsWith(data, [0x57, 0x45, 0x42, 0x50], 8),
    avif: (data) => startsWith(data, [0x66, 0x74, 0x79, 0x70], 4) && ['avif', 'avis'].includes(Buffer.from(data.subarray(8, 12)).toString('latin1')),
}

const PUBLIC_PREFIX = '/upload/images/'

// Name of an image in its public path ("/upload/images/abc.jpg" -> "abc.jpg"), null for anything else
const nameOf = (publicPath: string) => publicPath?.startsWith(PUBLIC_PREFIX) ? publicPath.slice(PUBLIC_PREFIX.length) : null
const THUMB = 'thumb-'

// One file in dc_uploads, its type read from its own extension
const insert = (name: string, file: UploadedFile) => DatabaseHelper.insert('INSERT INTO dc_uploads (name, mime_type, data) VALUES (?, ?, ?)',
    [name, MIME_TYPES[extname(file.filename ?? '').toLowerCase()], file.data])

export const UploadHelper = {
    /**
     * True when the uploaded file is really an accepted image: its extension, its first bytes (a PHP or HTML file
     * renamed in .png is refused) and its size (MAX_BYTES at most, the admin compresses photos before sending them).
     */
    isAcceptedImage(file: UploadedFile | null | undefined) {
        const extension = extname(file?.filename || '').toLowerCase()
        const data = file?.data
        if (!MIME_TYPES[extension] || !data?.length || data.length > MAX_BYTES) return false
        return Object.values(SIGNATURES).some(isOf => isOf(data))
    },
    MAX_BYTES,

    /**
     * Saves an uploaded image under a random name and returns its public path (/upload/images/...).
     * Its thumbnail, when there is one and it is a real image, is saved under the same name with "thumb-" before it.
     */
    async saveImage(file: UploadedFile, thumb: UploadedFile | null = null) {
        const name = `${Date.now()}-${randomBytes(4).toString('hex')}${extname(file.filename ?? '').toLowerCase()}`
        await insert(name, file)
        if (thumb && this.isAcceptedImage(thumb)) await insert(THUMB + name, thumb)
        return `${PUBLIC_PREFIX}${name}`
    },

    /** Public path of the thumbnail of an image ("/upload/images/a.webp" -> "/upload/images/thumb-a.webp"). */
    thumbOf: (publicPath: string) => nameOf(publicPath) ? `${PUBLIC_PREFIX}${THUMB}${nameOf(publicPath)}` : null,

    /** SQL test "this photo has a thumbnail", for a column holding its public path (no file content read). */
    hasThumbSql: (column: string) => `EXISTS (SELECT 1 FROM dc_uploads u WHERE u.name = CONCAT('${THUMB}', SUBSTRING_INDEX(${column}, '/', -1)))`,

    /** Removes a previously uploaded image and its thumbnail (ignored for static images). */
    async removeImage(publicPath: string) {
        const name = nameOf(publicPath)
        if (name) await DatabaseHelper.execute('DELETE FROM dc_uploads WHERE name IN (?, ?)', [name, THUMB + name])
    },

    /** Content and type of an uploaded image ("images/<name>"), or null when it does not exist. */
    async read(path: string) {
        const name = nameOf(`/upload/${path}`)
        if (!name || name.includes('/')) return { forbidden: true }
        const row = await DatabaseHelper.fetchOne('SELECT mime_type, data FROM dc_uploads WHERE name = ? LIMIT 1', [name])
        return row ? { file: row.data, mimeType: row.mime_type } : null
    },
}
