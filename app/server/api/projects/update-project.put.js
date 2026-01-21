import { useDatabase } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async event => {
    // Ensure request uses PUT method
    if (event.node.req.method !== 'PUT') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    const db = useDatabase()
    let body

    try {
        // Parse JSON body of the request
        body = await readBody(event)
    } catch (err) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
    }

    // Extract project fields from request
    const { id, name, short_fr, short_en, link, skills, date } = body
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Project ID required' })

    try {
        // Update only the fields that are provided
        if (name !== undefined) await db.sql`UPDATE dc_projects SET name = ${name} WHERE id = ${id}`
        if (short_fr !== undefined) await db.sql`UPDATE dc_projects SET short_fr = ${short_fr} WHERE id = ${id}`
        if (short_en !== undefined) await db.sql`UPDATE dc_projects SET short_en = ${short_en} WHERE id = ${id}`
        if (link !== undefined) await db.sql`UPDATE dc_projects SET link = ${link} WHERE id = ${id}`
        if (date !== undefined) await db.sql`UPDATE dc_projects SET date = ${date} WHERE id = ${id}`
        if (skills !== undefined) await db.sql`UPDATE dc_projects SET skills = ${JSON.stringify(skills)} WHERE id = ${id}`

        // Return success response with project ID
        return { success: true, projectId: id }
    } catch (err) {
        console.error('Failed to update project fields:', err)
        // Return server error if update fails
        throw createError({ statusCode: 500, statusMessage: 'Failed to update project' })
    }
})