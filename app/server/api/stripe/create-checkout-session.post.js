export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { amount, currency, email } = validateCheckoutData(body)

        const config = useRuntimeConfig(event)

        const session = await createStripeSession({
            amount,
            currency,
            email,
            successUrl: `${config.public.frontendDomain}/api/stripe/payment-result?type=success`,
            cancelUrl: `${config.public.frontendDomain}/api/stripe/payment-result?type=cancel`,
        })

        return { sessionId: session.id, url: session.url }
    } catch (err) {
        console.error('Stripe Error:', err)

        if (err.statusCode) throw err

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to create Stripe session.'
        })
    }
})