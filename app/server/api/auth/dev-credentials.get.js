export default defineEventHandler(event => {
    // Block access in production environment
    if (process.env.NODE_ENV === 'production') {
        throw createError({ statusCode: 403, message: 'Not available in production' })
    }

    // Access runtime configuration
    const config = useRuntimeConfig(event)
    const { adminEmail: email, adminPassword: password } = config

    // Validate dev credentials
    if (!email || !password) {
        console.error('Runtime config values:', { adminEmail: email, adminPassword: password ? '[REDACTED]' : 'undefined' })
        throw createError({ statusCode: 500, message: 'Dev credentials not set on server' })
    }

    // Return dev credentials
    return { success: true, email, password }
})