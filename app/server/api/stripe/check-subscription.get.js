export default defineEventHandler(async event => {
    try {
        // Extract and validate sessionId from query
        const { sessionId } = getQuery(event)
        validateSessionId(sessionId)

        // Fetch subscription status from backend
        return await getSubscriptionStatus(sessionId)
    } catch (err) {
        console.error('Error checking subscription status:', err)

        if (err.statusCode) throw err
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Unable to check subscription status'
        })
    }
})