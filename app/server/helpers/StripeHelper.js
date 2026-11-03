import Stripe from 'stripe'

/*
 * Stripe Checkout of the "Pay me" page (server/controllers/StripeController.js), with STRIPE_SECRET_KEY:
 *   StripeHelper.validateCheckout(body) / validateSubscription(body) / validateSessionId(id)   400 errors (createError)
 *   StripeHelper.createCheckout({...}) / createSubscription({...})                           Checkout sessions
 *   StripeHelper.paymentStatus(sessionId) / subscriptionStatus(sessionId)                     result once the popup is closed
 * The client pays exactly the amount asked: no card fee is added (forbidden for consumer cards, art. L.112-12 of the French monetary code).
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

// Allowed currencies
const VALID_CURRENCIES = ['eur', 'usd']

// Validates and sanitize currency — fallback to 'eur' if unknown
const validateCurrency = (currency = 'eur') => {
    return VALID_CURRENCIES.includes(currency?.toLowerCase()) ? currency.toLowerCase() : 'eur'
}

// Validates checkout form data
const validateCheckoutData = ({ amount, currency, email }) => {
    validateRequired({ amount, currency, email }, ['amount', 'currency', 'email'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { amount, currency: validateCurrency(currency), email }
}

// Validates subscription form data
const validateSubscriptionData = ({ email, name, amount, currency }) => {
    validateRequired({ email, name, amount }, ['email', 'name', 'amount'])
    validateEmail(email)
    validatePositiveNumber(amount, 'Amount')
    return { email, name, amount: parseFloat(amount), currency: validateCurrency(currency) }
}

// Ensures session ID exists
const validateSessionId = sessionId => {
    if (!sessionId) throw createError({ statusCode: 400, message: 'Session ID is required' })
    return sessionId
}

/*
 * Look of the Stripe payment pages, the one of the site: its ink, the mint button, no rounded corners, a condensed font
 * (Barlow Condensed is not offered by Stripe: Titillium Web is the closest), the name of the owner, the light logo of the site.
 * Stripe reads the images from the Internet: locally (localhost) the logo of the site online is used, and no icon.
 */
const PUBLIC_SITE = 'https://djason-chery.dev'
const branding = displayName => {
    const site = String(useRuntimeConfig().public.frontendDomain || '').replace(/\/$/, '')
    const online = site.startsWith('https://')
    return {
        background_color: '#111417', button_color: '#7ee6a8', border_style: 'rectangular', font_family: 'titillium_web',
        ...(displayName ? { display_name: displayName.slice(0, 100) } : {}),
        logo: { type: 'url', url: `${online ? site : PUBLIC_SITE}/images/main_logo_light.png` },
        ...(online ? { icon: { type: 'url', url: `${site}/favicon.png` } } : {}),
    }
}

// Creates a Stripe checkout session for a one-time payment
// A document of the admin (payment link): its name on the Stripe page, and its link in the metadata (saved once paid)
// saveCard: the client agreed to the automatic debit of the next steps: the card is kept by Stripe for payments without them
const createStripeSession = async ({ amount, currency, email, successUrl, cancelUrl, productName = 'Djason CHERY - Video and Web Services', metadata = {}, saveCard = false, displayName = '', locale = 'auto' }) => {
    const stripe = getStripeInstance()

    // Amount in cents from the frontend, charged as it is
    const totalCents = Math.round(Number(amount))

    return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency,
                product_data: { name: productName },
                unit_amount: totalCents
            },
            quantity: 1
        }],
        mode: 'payment',
        metadata,
        ...(saveCard ? {
            customer_creation: 'always', payment_intent_data: { setup_future_usage: 'off_session', metadata },
            // Stripe shows its own agreement to the reuse of the card, under the button
            consent_collection: { payment_method_reuse_agreement: { position: 'auto' } },
        } : {}),
        branding_settings: branding(displayName),
        locale,
        customer_email: email,
        success_url: successUrl,
        cancel_url: cancelUrl
    })
}

// Creates a Stripe checkout session for a subscription (12 months, web development)
const createStripeSubscriptionSession = async ({ amount, email, name, currency = 'eur', successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()

    // Calculates monthly net amount from total (divided by 12)
    const monthlyAmount = amount / 12

    // What Stripe bills each month, in cents (no fee added)
    const monthlyTotalCents = Math.round(monthlyAmount * 100)

    // Finds existing customer or creates a new one
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0] || await stripe.customers.create({ email, name })

    // Creates a dedicated product per subscription
    const product = await stripe.products.create({
        name: `Développement Web - Abonnement 12 mois - ${email}`,
        description: 'Site web sur mesure avec maintenance incluse',
    })

    // Creates a monthly recurring price: a twelfth of the total
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
        branding_settings: branding(),
        subscription_data: {
            metadata: {
                type: 'web_development',
                email,
                total_amount: amount.toString(),
                monthly_amount: monthlyAmount.toString(),
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

// An event sent by Stripe to the webhook, checked with its signature (STRIPE_WEBHOOK_SECRET): a forged call is refused
const verifyWebhook = (rawBody, signature) => {
    const secret = useRuntimeConfig().stripeWebhookSecret
    if (!secret) throw createError({ statusCode: 503, message: 'STRIPE_WEBHOOK_SECRET is not set' })
    try {
        return getStripeInstance().webhooks.constructEvent(rawBody, signature, secret)
    } catch {
        throw createError({ statusCode: 400, message: 'Invalid Stripe signature' })
    }
}

// The card kept by a paid Checkout session (automatic debit): its customer, its payment method and what can be shown of it
const getSavedCard = async session => {
    const intent = await getStripeInstance().paymentIntents.retrieve(session.payment_intent, { expand: ['payment_method'] })
    const method = intent.payment_method
    if (!method?.id) return null
    const card = method.card ? `${method.card.brand} •••• ${method.card.last4}` : method.type
    return { customer: session.customer || intent.customer, paymentMethod: method.id, card, email: session.customer_details?.email || session.customer_email || '' }
}

// A payment without the client (automatic debit) with the card kept; the same key never charges twice.
// Answer: { ok: true, intent } or { ok: false, code, message } (card refused, an authentication asked by the bank...)
const chargeSavedCard = async ({ customer, paymentMethod, amount, currency, email, description, metadata, idempotencyKey }) => {
    try {
        const intent = await getStripeInstance().paymentIntents.create({
            amount: Math.round(amount * 100), currency: currency.toLowerCase(), customer, payment_method: paymentMethod,
            off_session: true, confirm: true, receipt_email: email || undefined, description, metadata,
        }, { idempotencyKey })
        return intent.status === 'succeeded' ? { ok: true, intent } : { ok: false, code: intent.status, message: intent.status }
    } catch (error) {
        return { ok: false, code: error.code || error.type || 'error', message: error.message }
    }
}

// A Stripe session as it is (its metadata included)
const getCheckoutSession = sessionId => getStripeInstance().checkout.sessions.retrieve(sessionId)

// Retrieves one-time payment status from a Stripe session (or from a session already retrieved)
const getPaymentStatus = async sessionOrId => {
    const session = typeof sessionOrId === 'string' ? await getCheckoutSession(sessionOrId) : sessionOrId
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
    checkoutSession: getCheckoutSession,
    savedCard: getSavedCard,
    chargeSaved: chargeSavedCard,
    verifyWebhook,
    subscriptionStatus: getSubscriptionStatus,
}
