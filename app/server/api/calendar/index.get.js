import { useDatabase } from '#imports'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async event => {
    // Resolve database connection
    const db = event.context.db || useDatabase()

    try {
        // Fetch calendar settings (should return only one record)
        const { rows } = await db.sql`
            SELECT * 
            FROM dc_calendar_settings
            LIMIT 1
        `

        if (!rows.length) {
            throw createError({
                statusCode: 404,
                message: 'Calendar settings not found'
            })
        }

        const settings = rows[0]

        // Normalize database fields for the API response
        return {
            id: settings.id,
            userId: settings.user_id,
            timezone: settings.timezone,
            schedule: JSON.parse(settings.schedule),
            createdAt: settings.created_at,
            updatedAt: settings.updated_at
        }
    } catch (err) {
        console.error('[GET] Calendar settings failed:', err)

        throw createError({
            statusCode: 500,
            message: 'Error fetching calendar settings'
        })
    }
})