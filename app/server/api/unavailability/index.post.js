import { useDatabase } from '#imports'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async event => {
    // Resolve database connection
    const db = event.context.db || useDatabase()

    // Read and validate request payload
    const { startDate, endDate } = await readBody(event)
    if (!startDate || !endDate) {
        throw createError({
            statusCode: 400,
            message: 'Start date and end date are required'
        })
    }

    try {
        // Create a new unavailability entry
        const id = crypto.randomUUID()

        await db.sql`
            INSERT INTO dc_unavailability (id, start_date, end_date)
            VALUES (${id}, ${startDate}, ${endDate})
        `

        return {
            success: true,
            id,
            message: 'Unavailability period created'
        }
    } catch (err) {
        throw createError({
            statusCode: 500,
            message: 'Error creating unavailability period'
        })
    }
})