import Stripe from 'stripe'

let stripeInstance = null

export function getStripeInstance() {
    if (!stripeInstance) {
        const config = useRuntimeConfig()
        stripeInstance = new Stripe(config.stripeSecretKey)
    }
    return stripeInstance
}

export function calculateStripeTotal(amount) {
    return Math.ceil(amount * 1.029 + 30)
}

export async function createStripeSession({ amount, currency, email, successUrl, cancelUrl }) {
    const stripe = getStripeInstance()
    const total = calculateStripeTotal(amount)

    return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency,
                product_data: { name: 'Djason CHERY - Video and Web Services' },
                unit_amount: total
            },
            quantity: 1
        }],
        mode: 'payment',
        customer_email: email,
        success_url: successUrl,
        cancel_url: cancelUrl,
    })
}

export async function getPaymentStatus(sessionId) {
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
        success: session.payment_status === 'paid',
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency
    }
}