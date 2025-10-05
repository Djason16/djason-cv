export default defineEventHandler(event => {
    // Access runtime configuration
    const { public: { frontendDomain } = {} } = useRuntimeConfig(event)

    // Return environment info and server metadata
    return {
        environment: process.env.NODE_ENV || 'development',
        message: 'Welcome to the API!',
        serverTimeUTC: new Date().toISOString(),
        domain: frontendDomain || 'not set'
    }
})