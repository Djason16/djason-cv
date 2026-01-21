import { useDatabase } from '#imports'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { createError, readBody } from 'h3'
import { join } from 'path'

export default defineEventHandler(async event => {
    const db = useDatabase()

    // Read request body to get project ID
    const { id } = await readBody(event)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Project ID required' })

    try {
        // Retrieve project image path before deletion
        const { rows } = await db.sql`SELECT img FROM dc_projects WHERE id = ${id}`

        if (rows.length && rows[0].img && rows[0].img.startsWith('/upload/images/')) {
            const imagePath = join(process.cwd(), 'public', rows[0].img)
            try {
                // Remove associated image file if it exists
                if (existsSync(imagePath)) {
                    await unlink(imagePath)
                    console.log('Deleted image:', imagePath)
                }
            } catch (e) {
                console.warn('Could not delete image:', e)
            }
        }

        // Delete project from database
        await db.sql`DELETE FROM dc_projects WHERE id = ${id}`

        return { success: true, projectId: id }
    } catch (err) {
        console.error('Failed to delete project:', err)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete project'
        })
    }
})