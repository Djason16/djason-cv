import { useDatabase } from '#imports'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { join } from 'path'

export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()

    try {
        // Parse multipart form data
        const formData = await readMultipartFormData(event)
        if (!formData) throw createError({ statusCode: 400, statusMessage: 'No form data received' })

        const fields = {}
        let imageFile = null

        // Separate file and text fields
        for (const field of formData) {
            if (field.name === 'image' && field.filename) imageFile = field
            else if (field.data) fields[field.name] = field.data.toString('utf-8')
        }

        // Validate required fields for API projects
        const { name, short_fr, short_en } = fields
        if (!name || !short_fr || !short_en) {
            throw createError({ statusCode: 400, statusMessage: 'Missing required fields: name, short_fr, short_en' })
        }

        // Handle image upload
        let imgPath = null
        if (imageFile) {
            const uploadDir = join(process.cwd(), 'public', 'upload', 'images')
            if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

            const ext = imageFile.filename.split('.').pop()
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
            const filePath = join(uploadDir, filename)
            await writeFile(filePath, imageFile.data)
            imgPath = `/upload/images/${filename}`
        }

        // Parse skills field as array
        let skills = []
        if (fields.skills) {
            try { skills = JSON.parse(fields.skills) }
            catch { skills = fields.skills.split(',').map(s => s.trim()).filter(Boolean) }
        }

        // Prepare database insert
        const id = crypto.randomUUID()
        const skillsJson = JSON.stringify(skills)
        const projectDate = fields.date || new Date().toISOString().slice(0, 10)
        const link = fields.link || null

        // Insert new project record
        await db.sql`
            INSERT INTO dc_projects (id, name, short_fr, short_en, img, link, skills, date)
            VALUES (${id}, ${name}, ${short_fr}, ${short_en}, ${imgPath}, ${link}, ${skillsJson}, ${projectDate})
        `

        return { success: true, projectId: id, imagePath: imgPath }
    } catch (err) {
        console.error('Failed to add project:', err)
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || 'Failed to add project'
        })
    }
})