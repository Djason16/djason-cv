// Create a Stripe checkout session for a payment
export const createStripeSession = async ({ amount, currency, email, successUrl, cancelUrl }) => {
    const stripe = getStripeInstance()
    const total = calculateStripeTotal(amount)

    return stripe.checkout.sessions.create({
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
        cancel_url: cancelUrl
    })
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