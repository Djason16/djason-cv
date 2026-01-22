import { useDatabase } from '#imports'
import { existsSync } from 'fs'
import { unlink, writeFile } from 'fs/promises'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { join } from 'path'
import { ensureUploadDir, generateUniqueFilename, getAbsolutePath, getPublicPath } from '~/server/utils/projects-utils/upload-path'

export default defineEventHandler(async event => {
    if (event.node.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    const db = useDatabase()

    try {
        const formData = await readMultipartFormData(event)
        if (!formData) {
            throw createError({ statusCode: 400, statusMessage: 'No form data received' })
        }

        let id, imageFile
        formData.forEach(f => {
            if (f.name === 'id') id = f.data.toString('utf-8')
            if (f.name === 'image' && f.filename) imageFile = f
        })

        if (!id) throw createError({ statusCode: 400, statusMessage: 'Project ID required' })
        if (!imageFile) throw createError({ statusCode: 400, statusMessage: 'No image provided' })

        const { rows } = await db.sql`SELECT img FROM dc_projects WHERE id = ${id}`
        if (!rows.length) {
            throw createError({ statusCode: 404, statusMessage: 'Project not found' })
        }

        // Ensure upload directory exists before writing
        const uploadDir = await ensureUploadDir()

        // Remove previous image if it was an uploaded asset
        const oldImg = rows[0].img
        if (oldImg?.startsWith('/upload/images/')) {
            const oldPath = getAbsolutePath(oldImg)
            try {
                if (existsSync(oldPath)) await unlink(oldPath)
            } catch { }
        }

        // Persist new image and update database reference
        const filename = generateUniqueFilename(imageFile.filename)
        await writeFile(join(uploadDir, filename), imageFile.data)

        const imgPath = getPublicPath(filename)
        await db.sql`UPDATE dc_projects SET img = ${imgPath} WHERE id = ${id}`

        return { success: true, projectId: id, imagePath: imgPath }
    } catch (err) {
        console.error('Failed to update project image:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update project image' })
    }
})