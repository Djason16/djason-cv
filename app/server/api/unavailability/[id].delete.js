import { useDatabase } from '#imports'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()
    const id = getRouterParam(event, 'id')

    // Validate ID parameter
    if (!id) throw createError({ statusCode: 400, message: 'ID parameter is required' })

    try {
        // Delete unavailability entry
        await db.sql`DELETE FROM dc_unavailability WHERE id = ${id}`

        return { success: true, message: 'Unavailability period deleted' }
    } catch (err) {
        console.error('Error deleting unavailability period:', err)
        throw createError({ statusCode: 500, message: 'Error deleting unavailability period' })
    }
})