export function validateCheckoutData(data) {
    const { amount, currency, email } = data

    if (!amount || !currency || !email) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Amount, currency, and email are required.'
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid email format.'
        })
    }

    if (amount <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Amount must be greater than 0.'
        })
    }

    return { amount, currency, email }
}

export function validateSessionId(sessionId) {
    if (!sessionId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Session ID is required'
        })
    }
    return sessionId
}