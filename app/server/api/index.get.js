export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event)

    return {
        environment: process.env.NODE_ENV || 'development',
        message: 'Welcome to the API!',
        serverTimeUTC: new Date().toISOString(),
        domain: config.public.frontendDomain || 'not set'
    }
})
