import { useDatabase } from '#imports'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { createError, readBody } from 'h3'
import { getAbsolutePath } from '~/server/utils/projects-utils/upload-path'

export default defineEventHandler(async event => {
    const db = useDatabase()
    const { id } = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Project ID required' })
    }

    try {
        const { rows } = await db.sql`SELECT img FROM dc_projects WHERE id = ${id}`

        // Remove associated uploaded image when present
        if (rows[0]?.img?.startsWith('/upload/images/')) {
            const imagePath = getAbsolutePath(rows[0].img)
            try {
                if (existsSync(imagePath)) {
                    await unlink(imagePath)
                    console.log('Deleted image:', imagePath)
                }
            } catch (e) {
                console.warn('Could not delete image:', e)
            }
        }

        await db.sql`DELETE FROM dc_projects WHERE id = ${id}`

        return { success: true, projectId: id }
    } catch (err) {
        console.error('Failed to delete project:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete project' })
    }
})