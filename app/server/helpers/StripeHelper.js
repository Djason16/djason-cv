import Stripe from 'stripe'
import { calculateStripeFees } from '~/utils/stripeFees.js'

/*
 * Stripe Checkout of the "Pay me" page (server/controllers/StripeController.js), with STRIPE_SECRET_KEY:
 *   StripeHelper.validateCheckout(body) / validateSubscription(body) / validateSessionId(id)   400 errors (createError)
 *   StripeHelper.createCheckout({...}) / createSubscription({...})                           Checkout sessions
 *   StripeHelper.paymentStatus(sessionId) / subscriptionStatus(sessionId)                     result once the popup is closed
 * Card fees added to the amount: utils/stripeFees.js (shared with the front).
 */

let stripeInstance = null

// Returns a singleton Stripe instance
const getStripeInstance = () => {
    if (!stripeInstance) stripeInstance = new Stripe(useRuntimeConfig().stripeSecretKey)
    return stripeInstance
}

// Validates email format
const validateEmail = email => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw createError({ statusCode: 400, message: 'Invalid email format' })
    return true
}

// Ensures required fields are present and non-empty
const validateRequired = (data, fields) => {
    const missing = fields.filter(f => !data[f]?.toString().trim())
    if (missing.length)
        throw createError({ statusCode: 400, message: `Required fields missing: ${missing.join(', ')}` })
    return true
}

// Validates a positive number
const validatePositiveNumber = (value, name = 'Value') => {
    if (value <= 0)
        throw createError({ statusCode: 400, message: `${name} must be greater than 0` })
    return true
}

// Allowed Stripe card types — must match STRIPE_RATES keys in stripe-fees.js
const VALID_CARD_TYPES = ['european', 'europeanPremium', 'uk', 'nonEuropean']

// Allowed currencies
const VALID_CURRENCIES = ['eur', 'usd']

// Validates and sanitize card type — fallback to 'european' if unknown
const validateCardType = (cardType = 'european') => {
    return VALID_CARD_TYPES.includes(cardType) ? cardType : 'european'
}

// Validates and sanitize currency — fallback to 'eur' if unknown
const validateCurrency = (currency = 'eur') => {
    return VALID_CURRENCIES.includes(currency?.toLowerCase()) ? currency.toLowerCase() : 'eur'
}

// Validates checkout form data
const validateCheckoutData = ({ amount, currency, email, cardType }) => {
    validateRequired({ amount, currency, email }, ['amount', 'currency', 'email'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { amount, currency: validateCurrency(currency), email, cardType: validateCardType(cardType) }
}

// Validates subscription form data
const validateSubscriptionData = ({ email, name, amount, currency, cardType }) => {
    validateRequired({ email, name, amount }, ['email', 'name', 'amount'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { email, name, amount: parseFloat(amount), currency: validateCurrency(currency), cardType: validateCardType(cardType) }
}

// Ensures session ID exists
const validateSessionId = sessionId => {
    if (!sessionId) throw createError({ statusCode: 400, message: 'Session ID is required' })
    return sessionId
}

// Creates a Stripe checkout session for a one-time payment
const createStripeSession = async ({ amount, currency, email, cardType = 'european', successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()

    // Amount arrives in cents from the frontend — convert to euros before fee calculation
    const amountInEuros = amount / 100
    const { totalCents } = calculateStripeFees(amountInEuros, cardType)

    return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency,
                product_data: { name: 'Djason CHERY - Video and Web Services' },
                unit_amount: totalCents
            },
            quantity: 1
        }],
        mode: 'payment',
        customer_email: email,
        success_url: successUrl,
        cancel_url: cancelUrl
    })
}

// Creates a Stripe checkout session for a subscription (12 months, web development)
const createStripeSubscriptionSession = async ({ amount, email, name, cardType = 'european', currency = 'eur', successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()

    // Calculates monthly net amount from total (divided by 12)
    const monthlyAmount = amount / 12

    // Applies Stripe fees to monthly amount — totalCents is what Stripe will bill each month
    const { totalCents: monthlyTotalCents } = calculateStripeFees(monthlyAmount, cardType)

    // Finds existing customer or creates a new one
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0] || await stripe.customers.create({ email, name })

    // Creates a dedicated product per subscription
    const product = await stripe.products.create({
        name: `Développement Web - Abonnement 12 mois - ${email}`,
        description: 'Site web sur mesure avec maintenance incluse',
    })

    // Creates a monthly recurring price based on the fee-inclusive amount
    const price = await stripe.prices.create({
        unit_amount: monthlyTotalCents,
        currency,
        recurring: {
            interval: 'month',
            interval_count: 1
        },
        product: product.id,
    })

    // Calculates automatic cancellation date: 12 months from today
    const cancelDate = new Date()
    cancelDate.setMonth(cancelDate.getMonth() + 12)
    const cancelAt = Math.floor(cancelDate.getTime() / 1000)

    // Creates the checkout session — subscription auto-cancels after 12 months
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customer.id,
        line_items: [{
            price: price.id,
            quantity: 1,
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
            metadata: {
                type: 'web_development',
                email,
                total_amount: amount.toString(),
                monthly_amount: monthlyAmount.toString(),
                card_type: cardType,
                currency,
                max_payments: '12',
                cancel_at_timestamp: cancelAt.toString(),
                cancel_at_date: new Date(cancelAt * 1000).toISOString().split('T')[0]
            }
        },
        metadata: {
            service_type: 'web_development',
            total_project_cost: amount.toString(),
        }
    })

    return session
}

// Retrieves one-time payment status from a Stripe session
const getPaymentStatus = async sessionId => {
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
        paid: session.payment_status === 'paid',
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency
    }
}

// Retrieves subscription status and applies cancel_at if not already set
const getSubscriptionStatus = async sessionId => {
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription']
    })

    // Applies cancellation timestamp from metadata if not yet scheduled
    if (session.subscription?.id && session.subscription?.metadata?.cancel_at_timestamp) {
        const cancelTimestamp = parseInt(session.subscription.metadata.cancel_at_timestamp)

        if (!session.subscription.cancel_at) {
            await stripe.subscriptions.update(session.subscription.id, {
                cancel_at: cancelTimestamp
            })
        }
    }

    const isActive = ['active', 'trialing'].includes(session.subscription?.status)

    return {
        active: isActive,
        status: session.subscription?.status || 'unknown',
        subscription_id: session.subscription?.id,
        customer_id: session.customer,
        cancel_at: session.subscription?.cancel_at,
    }
}

export const StripeHelper = {
    validateCheckout: validateCheckoutData,
    validateSubscription: validateSubscriptionData,
    validateSessionId,
    createCheckout: createStripeSession,
    createSubscription: createStripeSubscriptionSession,
    paymentStatus: getPaymentStatus,
    subscriptionStatus: getSubscriptionStatus,
}
