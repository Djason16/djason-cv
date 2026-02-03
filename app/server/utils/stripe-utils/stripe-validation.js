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

// Validate subscription form data
export const validateSubscriptionData = ({ email, name, amount }) => {
    validateRequired({ email, name, amount }, ['email', 'name', 'amount'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { email, name, amount: parseFloat(amount) }
}

// Ensure session ID exists
export const validateSessionId = sessionId => {
    if (!sessionId) throw createError({ statusCode: 400, message: 'Session ID is required' })
    return sessionId
}

// Validate Stripe customer ID
export const validateCustomerId = customerId => {
    if (!customerId || !customerId.startsWith('cus_'))
        throw createError({ statusCode: 400, message: 'Invalid Stripe customer ID' })
    return customerId
}

// Validate Stripe subscription ID
export const validateSubscriptionId = subscriptionId => {
    if (!subscriptionId || !subscriptionId.startsWith('sub_'))
        throw createError({ statusCode: 400, message: 'Invalid Stripe subscription ID' })
    return subscriptionId
}

// Validate Stripe price ID
export const validatePriceId = priceId => {
    if (!priceId || !priceId.startsWith('price_'))
        throw createError({ statusCode: 400, message: 'Invalid Stripe price ID' })
    return priceId
}