import { useDatabase } from '#imports'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    // Resolve database and target id
    const db = event.context.db || useDatabase()
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID parameter is required'
        })
    }

    // Extract and validate payload
    const { startDate, endDate } = await readBody(event)

    if (!startDate || !endDate) {
        throw createError({
            statusCode: 400,
            message: 'Start date and end date are required'
        })
    }

    try {
        // Update the unavailability record
        await db.sql`
            UPDATE dc_unavailability
            SET
                start_date = ${startDate},
                end_date = ${endDate},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `

        return {
            success: true,
            message: 'Unavailability period updated'
        }
    } catch (error) {
        console.error('Error updating unavailability period:', error)
        throw createError({
            statusCode: 500,
            message: 'Error updating unavailability period'
        })
    }
})