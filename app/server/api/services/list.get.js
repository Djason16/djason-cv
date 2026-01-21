export default defineEventHandler(async event => {
    const db = event.context.db

    try {
        // Retrieve all services, newest first
        const services = await db.sql`
            SELECT id, client_id, name, description, date_start, date_end, hours, quantity, unit_price, vat_applicable
            FROM dc_services
            ORDER BY created_at DESC 
        `

        return { success: true, services: services }
    } catch (err) {
        console.error(err)
        return { success: false, error: err.message || 'Failed to fetch services' }
    }
})