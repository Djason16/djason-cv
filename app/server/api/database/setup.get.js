export default defineEventHandler(async event => {
    const db = useDatabase()
    const { adminEmail, adminPassword, adminName } = useRuntimeConfig(event)

    try {
        // Ensure tables exist
        await createUsersTable(db)
        await createSessionsTable(db)
        await createClientsTable(db)
        await createServicesTable(db)
        await createQuotesTable(db)
        await createContractsTable(db)
        await createInvoicesTable(db)
        await createQuoteServicesTable(db)
        await createInvoiceServicesTable(db)

        // --- Seed default services ---
        await seedDefaultServices(db)

        // Check if admin already exists
        const { rows } = await db.sql`
      SELECT id, email, name FROM dc_users WHERE id = 'user_admin' LIMIT 1
    `
        if (rows.length) {
            if (process.env.NODE_ENV === 'development')
                console.log('[DEV] Admin already exists:', rows[0])

            return {
                success: true,
                message: 'Admin already exists, skipped creation',
                admin: { email: rows[0].email, name: rows[0].name, status: 'already_exists' }
            }
        }

        // Ensure credentials are provided
        if (!adminEmail || !adminPassword || !adminName)
            throw new Error('Admin credentials missing in environment variables')

        // Create admin user
        const hashed = await hashPassword(adminPassword)
        await db.sql`
      INSERT INTO dc_users (id, email, password, name, role)
      VALUES ('user_admin', ${adminEmail}, ${hashed}, ${adminName}, 'admin')
    `
        if (process.env.NODE_ENV === 'development')
            console.log('[DEV] Admin created:', { email: adminEmail, name: adminName })

        return {
            success: true,
            message: 'Admin user created successfully',
            admin: { email: adminEmail, name: adminName, status: 'created' }
        }
    } catch (err) {
        if (process.env.NODE_ENV === 'development')
            console.error('[DEV] DB setup error:', err)

        return { success: false, error: err.message }
    }
})