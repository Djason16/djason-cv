import { useDatabase } from '#imports'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async event => {
    // Resolve database and target id
    const db = event.context.db || useDatabase()
    const id = event.context.params?.id

    // Extract and validate payload
    const { timezone, schedule } = await readBody(event)

    if (!timezone || !schedule) {
        throw createError({
            statusCode: 400,
            message: 'Timezone and schedule are required'
        })
    }

    // Validate schedule format
    if (typeof schedule !== 'object' || Array.isArray(schedule)) {
        throw createError({
            statusCode: 400,
            message: 'Schedule must be an object'
        })
    }

    try {
        // Update the calendar settings record
        await db.sql`
            UPDATE dc_calendar_settings
            SET
                timezone = ${timezone},
                schedule = ${JSON.stringify(schedule)},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `

        return {
            success: true,
            message: 'Calendar settings updated'
        }
    } catch (err) {
        console.error('[PUT] Calendar settings failed:', err)

        throw createError({
            statusCode: 500,
            message: 'Error updating calendar settings'
        })
    }
})