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

// Allowed Stripe card types — must match STRIPE_RATES keys in stripe-fees.js
const VALID_CARD_TYPES = ['european', 'europeanPremium', 'uk', 'nonEuropean']

// Allowed currencies
const VALID_CURRENCIES = ['eur', 'usd']

// Validate and sanitize card type — fallback to 'european' if unknown
export const validateCardType = (cardType = 'european') => {
    return VALID_CARD_TYPES.includes(cardType) ? cardType : 'european'
}

// Validate and sanitize currency — fallback to 'eur' if unknown
export const validateCurrency = (currency = 'eur') => {
    return VALID_CURRENCIES.includes(currency?.toLowerCase()) ? currency.toLowerCase() : 'eur'
}

// Validate checkout form data
export const validateCheckoutData = ({ amount, currency, email, cardType }) => {
    validateRequired({ amount, currency, email }, ['amount', 'currency', 'email'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { amount, currency: validateCurrency(currency), email, cardType: validateCardType(cardType) }
}

// Validate subscription form data
export const validateSubscriptionData = ({ email, name, amount, currency, cardType }) => {
    validateRequired({ email, name, amount }, ['email', 'name', 'amount'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { email, name, amount: parseFloat(amount), currency: validateCurrency(currency), cardType: validateCardType(cardType) }
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