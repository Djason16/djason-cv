import { writeFile } from 'fs/promises'
import { createError, readMultipartFormData } from 'h3'
import { resolve } from 'path'

export default defineEventHandler(async event => {
    const dbPath = resolve('./.data/db.sqlite') // Resolve DB file path

    try {
        const files = await readMultipartFormData(event) // Parse uploaded file
        const file = files.find(f => f.filename)
        if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

        await writeFile(dbPath, file.data) // Overwrite database safely
        return { success: true, message: 'Database replaced successfully' }
    } catch (err) {
        console.error('DB replace error:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to replace database' })
    }
})