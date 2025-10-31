import crypto from 'crypto'
import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db
    const body = await readBody(event)

    // Basic input validation
    if (!body.rate || !body.valid_from || !body.valid_until)
        return { success: false, error: 'Rate, valid_from, and valid_until are required' }

    const id = crypto.randomUUID()

    try {
        // Insert new interest rate into database
        await db.sql`
      INSERT INTO dc_interest_rates (id, rate, valid_from, valid_until)
      VALUES (${id}, ${body.rate}, ${body.valid_from}, ${body.valid_until})
    `
        return { success: true, id }
    } catch (err) {
        console.error('Error creating interest rate:', err)
        return { success: false, error: 'Failed to create interest rate' }
    }
})