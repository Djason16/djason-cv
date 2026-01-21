import { useDatabase } from '#imports'
import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { join } from 'path'

export default defineEventHandler(async event => {
    // Ensure only POST requests are allowed
    if (event.node.req.method !== 'POST')
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })

    const db = useDatabase()
    try {
        // Parse uploaded form data
        const formData = await readMultipartFormData(event)
        if (!formData) throw createError({ statusCode: 400, statusMessage: 'No form data received' })

        let id, imageFile
        formData.forEach(f => {
            if (f.name === 'id') id = f.data.toString('utf-8')
            if (f.name === 'image' && f.filename) imageFile = f
        })

        // Validate required fields
        if (!id) throw createError({ statusCode: 400, statusMessage: 'Project ID required' })
        if (!imageFile) throw createError({ statusCode: 400, statusMessage: 'No image provided' })

        // Fetch current project to remove old image
        const { rows } = await db.sql`SELECT img FROM dc_projects WHERE id = ${id}`
        if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'upload', 'images')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

        // Remove previous image if exists
        const oldImg = rows[0].img
        if (oldImg?.startsWith('/upload/images/')) {
            const oldPath = join(process.cwd(), 'public', oldImg)
            try { if (existsSync(oldPath)) await unlink(oldPath) } catch { }
        }

        // Save new image with a unique filename
        const ext = imageFile.filename.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const filePath = join(uploadDir, filename)
        await writeFile(filePath, imageFile.data)

        // Update project record with new image path
        const imgPath = `/upload/images/${filename}`
        await db.sql`UPDATE dc_projects SET img = ${imgPath} WHERE id = ${id}`

        return { success: true, projectId: id, imagePath: imgPath }
    } catch (err) {
        console.error('Failed to update project image:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update project image' })
    }
})