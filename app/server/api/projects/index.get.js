import { useDatabase } from '#imports'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()

    try {
        // Retrieve all projects, sorted by date descending
        const { rows } = await db.sql`
            SELECT id, name, short_fr, short_en, img, link, skills, date, created_at
            FROM dc_projects
            ORDER BY date DESC
        `

        // Parse skills from JSON string to array
        const projects = rows.map(p => ({
            ...p,
            skills: p.skills ? JSON.parse(p.skills) : [],
        }))

        return { projects }
    } catch (err) {
        console.error('Failed to fetch projects:', err)
        // Return server error if query fails
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch projects' })
    }
})