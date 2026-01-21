export default defineEventHandler(async () => {
    const db = useDatabase()

    try {
        // Check if user table exists (ensures DB was initialized)
        const { rows: tables } = await db.sql`
      SELECT name FROM sqlite_master WHERE type='table' AND name='dc_users'
    `
        if (!tables.length)
            return { success: false, error: 'Database not initialized. Check server logs.' }

        // Retrieve admin info if available
        const { rows: admin } = await db.sql`
      SELECT id, email, name, role FROM dc_users WHERE id='user_admin' LIMIT 1
    `

        return {
            success: true,
            message: 'Database initialized via Nitro plugin',
            tables_exist: true,
            admin: admin.length
                ? { email: admin[0].email, name: admin[0].name, role: admin[0].role }
                : null
        }
    } catch (err) {
        return { success: false, error: err.message }
    }
})