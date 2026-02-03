import { calculateStripeFees } from '~/utils/stripe-fees.js'

// Create a Stripe checkout session for a payment
export const createStripeSession = async ({ amount, currency, email, successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()

    const amountInEuros = amount / 100
    const { totalCents } = calculateStripeFees(amountInEuros)

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
export const createStripeSubscriptionSession = async ({ amount, email, name, successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()

    // Calculate monthly amount from total (divided by 12)
    const monthlyAmount = amount / 12

    // Apply Stripe fees calculation to monthly amount, then convert to cents
    const { totalCents: monthlyTotalCents } = calculateStripeFees(monthlyAmount)

    // Find or create customer
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0] || await stripe.customers.create({
        email,
        name,
    })

    // Create product
    const product = await stripe.products.create({
        name: `Développement Web - Abonnement 12 mois - ${email}`,
        description: 'Site web sur mesure avec maintenance incluse',
    })

    // Create price (monthly recurring)
    const price = await stripe.prices.create({
        unit_amount: monthlyTotalCents,
        currency: 'eur',
        recurring: {
            interval: 'month',
            interval_count: 1
        },
        product: product.id,
    })

    // Calculate cancellation date (12 months from now)
    const startDate = new Date()
    const cancelDate = new Date(startDate)
    cancelDate.setMonth(cancelDate.getMonth() + 12)
    const cancelAt = Math.floor(cancelDate.getTime() / 1000)

    // Create checkout session with metadata only
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
                email: email,
                total_amount: amount.toString(),
                monthly_amount: monthlyAmount.toString(),
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

// Retrieve payment status from Stripe session
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

// Retrieve subscription status from Stripe session
export const getSubscriptionStatus = async sessionId => {
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription']
    })

    if (session.subscription?.id && session.subscription?.metadata?.cancel_at_timestamp) {
        const cancelTimestamp = parseInt(session.subscription.metadata.cancel_at_timestamp)

        if (!session.subscription.cancel_at) {
            await stripe.subscriptions.update(session.subscription.id, {
                cancel_at: cancelTimestamp
            })
        }
    }

    const isActive = session.subscription?.status === 'active' || session.subscription?.status === 'trialing'

    return {
        success: isActive,
        status: session.subscription?.status || 'unknown',
        subscription_id: session.subscription?.id,
        customer_id: session.customer,
        cancel_at: session.subscription?.cancel_at,
    }
}