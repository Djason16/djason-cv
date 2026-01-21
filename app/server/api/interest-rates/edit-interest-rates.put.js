import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db
    const body = await readBody(event)

    // Ensure ID is provided
    if (!body.id) return { success: false, error: 'ID is required' }

    try {
        // Update interest rate fields if provided
        await db.sql`
      UPDATE dc_interest_rates
      SET
        rate = ${body.rate || null},
        valid_from = ${body.valid_from || null},
        valid_until = ${body.valid_until || null}
      WHERE id = ${body.id}
    `
        return { success: true, id: body.id }
    } catch (err) {
        console.error('Error updating interest rate:', err)
        return { success: false, error: 'Failed to update interest rate' }
    }
})