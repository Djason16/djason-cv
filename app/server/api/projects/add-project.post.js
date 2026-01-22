import { useDatabase } from '#imports'
import { writeFile } from 'fs/promises'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { join } from 'path'
import { ensureUploadDir, generateUniqueFilename, getPublicPath } from '~/server/utils/projects-utils/upload-path'

export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()

    try {
        const formData = await readMultipartFormData(event)
        if (!formData) {
            throw createError({ statusCode: 400, statusMessage: 'No form data received' })
        }

        const fields = {}
        let imageFile

        for (const field of formData) {
            if (field.name === 'image' && field.filename) {
                imageFile = field
            } else if (field.data) {
                fields[field.name] = field.data.toString('utf-8')
            }
        }

        const { name, short_fr, short_en } = fields
        if (!name || !short_fr || !short_en) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: name, short_fr, short_en'
            })
        }

        // Persist uploaded image when provided
        let imgPath = null
        if (imageFile) {
            const uploadDir = await ensureUploadDir()
            const filename = generateUniqueFilename(imageFile.filename)
            await writeFile(join(uploadDir, filename), imageFile.data)
            imgPath = getPublicPath(filename)
        }

        // Normalize skills input
        let skills = []
        if (fields.skills) {
            try {
                skills = JSON.parse(fields.skills)
            } catch {
                skills = fields.skills
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
            }
        }

        const id = crypto.randomUUID()
        const projectDate = fields.date || new Date().toISOString().slice(0, 10)

        await db.sql`
            INSERT INTO dc_projects (id, name, short_fr, short_en, img, link, skills, date)
            VALUES (
                ${id},
                ${name},
                ${short_fr},
                ${short_en},
                ${imgPath},
                ${fields.link || null},
                ${JSON.stringify(skills)},
                ${projectDate}
            )
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