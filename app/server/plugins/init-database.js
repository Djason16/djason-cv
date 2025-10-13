export default defineNitroPlugin(async () => {
    const db = useDatabase()
    const config = useRuntimeConfig()

    console.log('🗄️ Verifying database and tables...')

    try {
        // Ensure all required tables exist
        await Promise.all([
            createUsersTable(db),
            createSessionsTable(db),
            createClientsTable(db),
            createServicesTable(db),
            createQuotesTable(db),
            createContractsTable(db),
            createInvoicesTable(db),
            createQuoteServicesTable(db),
            createInvoiceServicesTable(db),
        ])
        console.log('✅ All tables verified')

        // Seed base services if missing
        await seedDefaultServices(db)
        console.log('🌱 Default services checked')

        // Check if admin user exists
        const { rows } = await db.sql`
      SELECT id, email, name FROM dc_users WHERE id = 'user_admin' LIMIT 1
    `

        if (rows.length) {
            console.log(`👑 Admin found: ${rows[0].email}`)
            return
        }

        // Ensure admin credentials are provided in environment variables
        const { adminEmail, adminPassword, adminName } = config
        if (!adminEmail || !adminPassword || !adminName) {
            console.warn('⚠️ Missing admin credentials in environment variables')
            return
        }

        // Create admin user
        const hashed = await hashPassword(adminPassword)
        await db.sql`
      INSERT INTO dc_users (id, email, password, name, role)
      VALUES ('user_admin', ${adminEmail}, ${hashed}, ${adminName}, 'admin')
    `
        console.log(`🎉 Admin created: ${adminEmail}`)

    } catch (err) {
        console.error('💥 Database setup failed:', err)
        // Keep server running even if setup fails
    }
})