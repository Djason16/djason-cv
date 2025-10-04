export default defineEventHandler(async (event) => {
    try {
        const { sessionId } = getQuery(event)
        validateSessionId(sessionId)

        const paymentStatus = await getPaymentStatus(sessionId)
        return paymentStatus
    } catch (err) {
        console.error('Error checking payment status:', err)

        if (err.statusCode) throw err

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Unable to check payment status'
        })
    }
})
