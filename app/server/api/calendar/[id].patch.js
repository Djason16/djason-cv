import { useDatabase } from '#imports'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const db = event.context.db || useDatabase()
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, message: 'Calendar ID required' })
    }

    try {
        const { rows } = await db.sql`
            SELECT * FROM dc_calendar_settings WHERE id = ${id} LIMIT 1
        `

        if (!rows.length) {
            throw createError({ statusCode: 404, message: 'Calendar not found' })
        }

        const existing = rows[0]
        const existingSchedule = existing.schedule ? JSON.parse(existing.schedule) : {}

        const updatedTimezone = body.timezone !== undefined ? body.timezone : existing.timezone
        const updatedSchedule = body.schedule !== undefined ? body.schedule : existingSchedule

        console.log('📝 Updating with:', {
            timezone: updatedTimezone,
            schedule: updatedSchedule
        })

        await db.sql`
            UPDATE dc_calendar_settings
            SET timezone = ${updatedTimezone},
                schedule = ${JSON.stringify(updatedSchedule)},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `

        return {
            success: true,
            id,
            timezone: updatedTimezone,
            schedule: updatedSchedule,
            updatedAt: new Date().toISOString()
        }
    } catch (err) {
        console.error('Calendar update error:', err)
        throw createError({
            statusCode: 500,
            message: `Error updating calendar: ${err.message}`
        })
    }
})