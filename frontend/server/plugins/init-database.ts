// Creates the missing tables, the default rows and the admin account at server startup

// MySQL can still be starting (Docker in development): new tries before giving up
const TRIES = 10
const DELAY_MS = 3000
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const setUp = async () => {
    await DatabaseSchema.init()
    console.log('✅ Database tables verified')

    const admin = await DatabaseSchema.ensureAdmin(useRuntimeConfig())
    if (admin === 'created') console.log('🎉 Admin account created')
    if (admin === 'missing-credentials') console.warn('⚠️ No admin account: set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME')
}

export default defineNitroPlugin(async () => {
    // Build: the pages are written without waiting for the database (the projects are loaded again in the browser)
    const tries = import.meta.prerender ? 1 : TRIES
    for (let attempt = 1; attempt <= tries; attempt++) {
        try {
            return await setUp()
        } catch (error) {
            // Keeps the server running: the public pages do not need the database
            if (attempt === tries) return console.error('💥 Database setup failed:', (error as Error).message)
            console.warn(`⏳ Database not reachable yet (${(error as { code?: string }).code || (error as Error).message}), new try in ${DELAY_MS / 1000} s`)
            await wait(DELAY_MS)
        }
    }
})
