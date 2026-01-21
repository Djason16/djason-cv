export default defineEventHandler(async event => {
    try {
        // Extract and validate sessionId from query
        const { sessionId } = getQuery(event)
        validateSessionId(sessionId)

        // Fetch payment status from backend
        return await getPaymentStatus(sessionId)
    } catch (err) {
        console.error('Error checking payment status:', err)

        // Re-throw known errors, wrap unknown errors as 500
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Unable to check payment status' })
    }
})