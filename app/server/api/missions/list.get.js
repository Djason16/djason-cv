export default defineEventHandler(async (event) => {
    const db = event.context.db

    try {
        // Fetch missions with client info
        const missions = await db.sql`
            SELECT m.id, m.client_id, c.firstname, c.lastname, c.company_name, m.title, m.service_id, m.date, m.duration, m.quantity, m.unit_price, m.vat_applicable
            FROM dc_missions m
            LEFT JOIN dc_clients c ON m.client_id = c.id
            ORDER BY m.date DESC 
        `

        return { success: true, missions: missions.rows || [] }

    } catch (err) {
        console.error('Error fetching missions:', err)
        return { success: false, error: err.message || 'Failed to fetch missions' }
    }
})