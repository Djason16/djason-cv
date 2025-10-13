export default defineEventHandler(async event => {
    const db = event.context.db

    try {
        // Fetch all clients with basic info
        const clients = await db.sql`
            SELECT id, firstname, lastname, company_name, email, phone, address, postal_code, city, type, siret
            FROM dc_clients
            ORDER BY created_at DESC NULLS LAST, company_name ASC
        `

        return { success: true, clients }
    } catch (err) {
        console.error('Error fetching clients:', err)
        return { success: false, error: 'Failed to fetch clients' }
    }
})