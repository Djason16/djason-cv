// Validate email format
export const validateEmail = email => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw createError({ statusCode: 400, message: 'Invalid email format' })
    return true
}

// Ensure required fields are present and non-empty
export const validateRequired = (data, fields) => {
    const missing = fields.filter(f => !data[f]?.toString().trim())
    if (missing.length)
        throw createError({ statusCode: 400, message: `Required fields missing: ${missing.join(', ')}` })
    return true
}

// Validate a positive number
export const validatePositiveNumber = (value, name = 'Value') => {
    if (value <= 0)
        throw createError({ statusCode: 400, message: `${name} must be greater than 0` })
    return true
}

// Validate checkout form data
export const validateCheckoutData = ({ amount, currency, email }) => {
    validateRequired({ amount, currency, email }, ['amount', 'currency', 'email'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { amount, currency, email }
}

// Ensure session ID exists
export const validateSessionId = sessionId => {
    if (!sessionId) throw createError({ statusCode: 400, message: 'Session ID is required' })
    return sessionId
}