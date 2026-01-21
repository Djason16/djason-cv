export default defineEventHandler(async event => {
    const db = event.context.db
    const now = new Date().toISOString().split('T')[0]

    try {
        // Query rates, prioritizing active ones first
        const rates = await db.sql`
      SELECT id, rate, valid_from, valid_until, created_at
      FROM dc_interest_rates
      ORDER BY 
        CASE WHEN valid_from <= ${now} AND valid_until >= ${now} THEN 0 ELSE 1 END,
        valid_from DESC
    `
        return { success: true, rates }
    } catch (err) {
        console.error('Error fetching interest rates:', err)
        return { success: false, error: 'Failed to fetch interest rates' }
    }
})