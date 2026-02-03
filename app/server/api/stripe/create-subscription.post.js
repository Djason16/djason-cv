export default defineEventHandler(async event => {
    try {
        // Read and validate subscription data
        const { email, name, amount } = validateSubscriptionData(await readBody(event))

        // Access runtime config for frontend URLs
        const config = useRuntimeConfig(event)
        const frontend = config.public.frontendDomain

        // Create Stripe checkout session for subscription
        const session = await createStripeSubscriptionSession({
            email,
            name,
            amount,
            successUrl: `${frontend}/api/stripe/subscription-result?type=success`,
            cancelUrl: `${frontend}/api/stripe/subscription-result?type=cancel`,
        })

        return { success: true, sessionId: session.id, url: session.url }

    } catch (err) {
        console.error('Stripe Subscription Error:', err)

        if (err.statusCode) throw err
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to create Stripe subscription session.'
        })
    }
})