export default defineEventHandler(async event => {
    try {
        // Read and validate checkout data from request body
        const { amount, currency, email } = validateCheckoutData(await readBody(event))

        // Access runtime config for frontend URLs
        const config = useRuntimeConfig(event)
        const frontend = config.public.frontendDomain

        // Create Stripe checkout session
        const session = await createStripeSession({
            amount,
            currency,
            email,
            successUrl: `${frontend}/api/stripe/payment-result?type=success`,
            cancelUrl: `${frontend}/api/stripe/payment-result?type=cancel`,
        })

        return { success: true, sessionId: session.id, url: session.url }

    } catch (err) {
        console.error('Stripe Error:', err)

        // Re-throw known errors or wrap unknown errors as 500
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to create Stripe session.' })
    }
})