/*
 * Stripe Checkout of the "Pay me" page (public). The two result pages are the success / cancel URLs
 * given to Stripe: their addresses must not change.
 *   POST /api/stripe/create-checkout       one-time payment          -> { sessionId, url }
 *   POST /api/stripe/create-subscription   12-month subscription     -> { sessionId, url }
 *   GET  /api/stripe/check-payment?sessionId=...                     -> { paid, status, amount, currency }
 *   GET  /api/stripe/check-subscription?sessionId=...                -> { active, status, ... }
 *   GET  /api/stripe/payment-result?type=success|cancel              HTML page closing the popup
 *   GET  /api/stripe/subscription-result?type=success|cancel         HTML page closing the popup
 * Validation and Stripe calls: server/helpers/StripeHelper.js, result pages: server/templates/StripePages.js.
 */
const resultType = event => (RequestHelper.query(event, 'type') === 'cancel' ? 'cancel' : 'success')

// Sends a page of server/templates/StripePages.js
const html = (event, page) => {
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return page
}

export default class StripeController extends Controller {
    static publicActions = true

    static routes = {
        createCheckout: ['POST', '/create-checkout'],
        createSubscription: ['POST', '/create-subscription'],
        checkPayment: ['GET', '/check-payment'],
        checkSubscription: ['GET', '/check-subscription'],
        paymentResult: ['GET', '/payment-result'],
        subscriptionResult: ['GET', '/subscription-result'],
    }

    // One-time payment: creates the Stripe page and returns its address
    async createCheckout(event) {
        const data = StripeHelper.validateCheckout(await this.body(event))
        const frontend = useRuntimeConfig().public.frontendDomain
        const session = await StripeHelper.createCheckout({
            ...data,
            successUrl: `${frontend}/api/stripe/payment-result?type=success`,
            cancelUrl: `${frontend}/api/stripe/payment-result?type=cancel`,
        })
        return ResponseHelper.success(event, { sessionId: session.id, url: session.url })
    }

    // Monthly subscription: creates the Stripe page and returns its address
    async createSubscription(event) {
        const data = StripeHelper.validateSubscription(await this.body(event))
        const frontend = useRuntimeConfig().public.frontendDomain
        const session = await StripeHelper.createSubscription({
            ...data,
            successUrl: `${frontend}/api/stripe/subscription-result?type=success`,
            cancelUrl: `${frontend}/api/stripe/subscription-result?type=cancel`,
        })
        return ResponseHelper.success(event, { sessionId: session.id, url: session.url })
    }

    // State of a payment or a subscription, from its Stripe session
    async checkPayment(event) {
        const sessionId = StripeHelper.validateSessionId(RequestHelper.query(event, 'sessionId'))
        return ResponseHelper.success(event, await StripeHelper.paymentStatus(sessionId))
    }

    async checkSubscription(event) {
        const sessionId = StripeHelper.validateSessionId(RequestHelper.query(event, 'sessionId'))
        return ResponseHelper.success(event, await StripeHelper.subscriptionStatus(sessionId))
    }

    // Page shown after Stripe (success or cancel)
    paymentResult(event) {
        return html(event, StripePages.payment(resultType(event)))
    }

    subscriptionResult(event) {
        return html(event, StripePages.subscription(resultType(event)))
    }
}
