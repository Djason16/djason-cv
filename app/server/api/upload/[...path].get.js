import { createError, getRouterParam, setHeader } from 'h3'
import { serveUploadFile } from '~/server/utils/projects-utils/upload-path'

export default defineEventHandler(async event => {
    try {
        const path = getRouterParam(event, 'path') || ''
        const { file, mimeType } = await serveUploadFile(path)

        // Set proper headers for static-like file delivery
        setHeader(event, 'Content-Type', mimeType)
        setHeader(event, 'Cache-Control', 'public, max-age=604800')
        setHeader(event, 'X-Content-Type-Options', 'nosniff')

        return file
    } catch (err) {
        // Map known errors to HTTP status codes
        if (err?.message === 'Forbidden path') {
            throw createError({ statusCode: 403 })
        }

        if (err?.message === 'File not found') {
            throw createError({ statusCode: 404 })
        }

        // Fallback for unexpected failures
        throw createError({ statusCode: 500 })
    }
})