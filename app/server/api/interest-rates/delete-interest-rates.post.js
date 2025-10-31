import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db
    const body = await readBody(event)

    // Validate required ID
    if (!body.id) return { success: false, error: 'ID is required' }

    try {
        // Remove record from database
        await db.sql`DELETE FROM dc_interest_rates WHERE id = ${body.id}`
        return { success: true, deletedId: body.id }
    } catch (err) {
        console.error('Error deleting interest rate:', err)
        return { success: false, error: 'Failed to delete interest rate' }
    }
})