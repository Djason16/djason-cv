// Creates the missing tables, the default rows and the admin account at server startup
export default defineNitroPlugin(async () => {
    try {
        await DatabaseSchema.init()
        console.log('✅ Database tables verified')

        const admin = await DatabaseSchema.ensureAdmin(useRuntimeConfig())
        if (admin === 'created') console.log('🎉 Admin account created')
        if (admin === 'missing-credentials') console.warn('⚠️ No admin account: set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME')
    } catch (error) {
        // Keeps the server running: the public pages do not need the database
        console.error('💥 Database setup failed:', error)
    }
})
