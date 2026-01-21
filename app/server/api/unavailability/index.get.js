import { useDatabase } from '#imports'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async event => {
    // Resolve database connection
    const db = event.context.db || useDatabase()

    try {
        // Fetch unavailability periods, newest first
        const { rows } = await db.sql`
            SELECT * 
            FROM dc_unavailability
            ORDER BY start_date DESC
        `

        // Normalize database fields for the API response
        return rows.map(({
            id,
            start_date,
            end_date,
            created_at,
            updated_at
        }) => ({
            id,
            startDate: start_date,
            endDate: end_date,
            createdAt: created_at,
            updatedAt: updated_at
        }))
    } catch (err) {
        throw createError({
            statusCode: 500,
            message: 'Error fetching unavailability periods'
        })
    }
})