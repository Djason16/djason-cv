import { calculateStripeFees } from '~/utils/stripe-fees.js'

// Create a Stripe checkout session for a one-time payment
export const createStripeSession = async ({ amount, currency, email, cardType = 'european', successUrl, cancelUrl }) => {
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

// Create a Stripe checkout session for a subscription (12 months, web development)
export const createStripeSubscriptionSession = async ({ amount, email, name, cardType = 'european', currency = 'eur', successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()

    // Calculate monthly net amount from total (divided by 12)
    const monthlyAmount = amount / 12

    // Apply Stripe fees to monthly amount — totalCents is what Stripe will bill each month
    const { totalCents: monthlyTotalCents } = calculateStripeFees(monthlyAmount, cardType)

    // Find existing customer or create a new one
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0] || await stripe.customers.create({ email, name })

    // Create a dedicated product per subscription
    const product = await stripe.products.create({
        name: `Développement Web - Abonnement 12 mois - ${email}`,
        description: 'Site web sur mesure avec maintenance incluse',
    })

    // Create a monthly recurring price based on the fee-inclusive amount
    const price = await stripe.prices.create({
        unit_amount: monthlyTotalCents,
        currency,
        recurring: {
            interval: 'month',
            interval_count: 1
        },
        product: product.id,
    })

    // Calculate automatic cancellation date: 12 months from today
    const cancelDate = new Date()
    cancelDate.setMonth(cancelDate.getMonth() + 12)
    const cancelAt = Math.floor(cancelDate.getTime() / 1000)

    // Create the checkout session — subscription auto-cancels after 12 months
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

// Retrieve one-time payment status from a Stripe session
export const getPaymentStatus = async sessionId => {
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
        success: session.payment_status === 'paid',
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency
    }
}

// Retrieve subscription status and apply cancel_at if not already set
export const getSubscriptionStatus = async sessionId => {
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription']
    })

    // Apply cancellation timestamp from metadata if not yet scheduled
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
        success: isActive,
        status: session.subscription?.status || 'unknown',
        subscription_id: session.subscription?.id,
        customer_id: session.customer,
        cancel_at: session.subscription?.cancel_at,
    }
}