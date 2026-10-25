// Uploaded project images: /api/upload/images/<file> (public, see server/helpers/UploadHelper.js)
export default defineEventHandler(async event => {
    const result = await UploadHelper.read(getRouterParam(event, 'path') || '')
    if (result?.forbidden) return ResponseHelper.forbidden(event)
    if (!result) return ResponseHelper.notFound(event, 'File not found')

    setResponseHeader(event, 'Content-Type', result.mimeType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=604800')
    setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
    // A file opened directly cannot run scripts on the site
    setResponseHeader(event, 'Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox")
    return result.file
})
