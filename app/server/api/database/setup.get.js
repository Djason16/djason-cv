export default defineEventHandler(async event => {
    const db = useDatabase()
    const { adminEmail, adminPassword, adminName } = useRuntimeConfig(event)

    try {
        // Ensure necessary tables exist
        await createUsersTable(db)
        await createSessionsTable(db)

        // Check if admin user already exists
        const { rows: existingAdmin } = await db.sql`
      SELECT id, email, name FROM dc_users WHERE id = 'user_admin' LIMIT 1
    `
        if (existingAdmin.length) return {
            success: true,
            message: 'Admin already exists, skipped creation',
            admin: { email: existingAdmin[0].email, name: existingAdmin[0].name, status: 'already_exists' }
        }

        // Validate admin credentials
        if (!adminEmail || !adminPassword || !adminName) throw new Error('Admin credentials missing in environment variables')

        // Hash password and insert new admin user
        const hashedPassword = await hashPassword(adminPassword)
        await db.sql`
      INSERT INTO dc_users (id, email, password, name, role)
      VALUES ('user_admin', ${adminEmail}, ${hashedPassword}, ${adminName}, 'admin')
    `

        return {
            success: true,
            message: 'Admin user created successfully',
            admin: { email: adminEmail, name: adminName, status: 'created' }
        }

    } catch (error) {
        // Return error in case of failure
        return { success: false, error: error.message }
    }
})