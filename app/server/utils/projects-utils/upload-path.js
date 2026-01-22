import { existsSync } from 'fs'
import { mkdir, readFile } from 'fs/promises'
import { extname, join } from 'path'

// Supported MIME types for served files
const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain'
}

// Environment helpers
export const isProduction = () => process.env.NODE_ENV === 'production'

// Resolve absolute upload directory based on runtime
// * Dev: /project-root/upload/images
// * Prod: /project-root/.output/public/upload/images
export const getUploadDir = () => {
    const root = process.cwd()
    return isProduction()
        ? join(root, '.output', 'public', 'upload', 'images')
        : join(root, 'upload', 'images')
}

// Ensure upload directory exists and return its path
export const ensureUploadDir = async () => {
    const dir = getUploadDir()
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
        console.log(`📁 Created upload directory: ${dir}`)
    }
    return dir
}

// Create a collision-resistant filename
export const generateUniqueFilename = originalFilename => {
    const ext = originalFilename.split('.').pop()
    return `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
}

// Map filename to public URL
export const getPublicPath = filename => `/upload/images/${filename}`

// Convert public URL to absolute filesystem path
export const getAbsolutePath = publicPath => {
    const root = process.cwd()
    return isProduction()
        ? join(root, '.output', 'public', publicPath)
        : join(root, publicPath.replace(/^\//, ''))
}

// Read and serve an uploaded file with basic path hardening
export const serveUploadFile = async path => {
    // Block traversal and home expansion
    if (path.includes('..') || path.includes('~')) {
        throw new Error('Forbidden path')
    }

    const root = process.cwd()
    const filePath = isProduction()
        ? join(root, '.output', 'public', 'upload', path)
        : join(root, 'upload', path)

    console.log('🔍 Serving file:', filePath)
    console.log('📁 File exists?', existsSync(filePath))

    if (!existsSync(filePath)) {
        throw new Error('File not found')
    }

    const file = await readFile(filePath)
    const mimeType = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'

    return { file, mimeType }
}