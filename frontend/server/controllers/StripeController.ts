import type Stripe from 'stripe'
import type { H3Event } from 'h3'
/*
 * Stripe Checkout of the "Pay me" page (public). The two result pages are the success / cancel URLs
 * given to Stripe: their addresses must not change.
 *   POST /api/stripe/create-checkout       one-time payment          -> { sessionId, url }
 *   POST /api/stripe/create-subscription   12-month subscription     -> { sessionId, url }
 *   GET  /api/stripe/check-payment?sessionId=...                     -> { paid, status, amount, currency } (a payment link: saved on its document)
 *   GET  /api/stripe/document?token=...                              the document of a payment link and what is left to pay (PayLinkHelper)
 *   GET  /api/stripe/document-file?token=...                         the whole document of a link and the bank details: its PDF drawn by the browser
 *   POST /api/stripe/webhook                                         events sent by Stripe (signed): a paid payment link saved
 *                                                                    even when the client closed the page too early
 *   GET  /api/stripe/check-subscription?sessionId=...                -> { active, status, ... }
 *   GET  /api/stripe/payment-result?type=success|cancel              HTML page closing the popup
 *   GET  /api/stripe/subscription-result?type=success|cancel         HTML page closing the popup
 * Validation and Stripe calls: server/helpers/StripeHelper.ts, result pages: server/templates/StripePages.ts.
 */
const resultType = (event: H3Event) => (RequestHelper.query(event, 'type') === 'cancel' ? 'cancel' : 'success')

// A paid session of a payment link saved on its document; with the automatic debit chosen, its card is kept for the next steps
const saveLinkPayment = async (session: Stripe.Checkout.Session) => {
    if (!session.metadata?.doc_token) return
    const card = session.metadata.autopay === '1' && session.payment_status === 'paid' ? await StripeHelper.savedCard(session).catch(() => null) : null
    const saved = await PayLinkHelper.record(session, card)
    if (saved.error) console.error('Payment link not saved:', saved.error, session.id)
}

// Sends a page of server/templates/StripePages.ts
const html = (event: H3Event, page: string) => {
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return page
}

export default class StripeController extends Controller {
    static publicActions = true

    static routes = {
        createCheckout: ['POST', '/create-checkout'],
        createSubscription: ['POST', '/create-subscription'],
        checkPayment: ['GET', '/check-payment'],
        document: ['GET', '/document'],
        documentFile: ['GET', '/document-file'],
        webhook: ['POST', '/webhook'],
        checkSubscription: ['GET', '/check-subscription'],
        paymentResult: ['GET', '/payment-result'],
        subscriptionResult: ['GET', '/subscription-result'],
    }

    // One-time payment: creates the Stripe page and returns its address.
    // A payment link (token): the amount, the currency and the name come from the document, not from the browser
    async createCheckout(event: H3Event) {
        const body = (await this.body(event)) || {}
        let data: Omit<Parameters<typeof StripeHelper.createCheckout>[0], 'successUrl' | 'cancelUrl'>
        if (body.token) {
            const info = await PayLinkHelper.summary(body.token)
            if (!info || info.amount <= 0) return ResponseHelper.error(event, 'payLinkNothing', 409)
            const label = info.type === 'invoice' ? 'Facture' : 'Devis'
            // The automatic debit of the next steps: only a quote with steps after this one, and only when the client agreed
            const autopay = Boolean(body.autopay) && info.canAutopay
            data = {
                ...StripeHelper.validateCheckout({ amount: Math.round(info.amount * 100), currency: info.currency.toLowerCase(), email: body.email }),
                productName: `${label} ${info.number}${info.title ? ` — ${info.title}` : ''}`.slice(0, 250),
                metadata: { doc_token: body.token, step_key: info.step || '', document: info.number, autopay: autopay ? '1' : '' },
                saveCard: autopay,
                // The name of the owner and the language of the visitor on the Stripe page
                displayName: (await SettingsHelper.all()).name,
                locale: body.language === 'en' ? 'en' : 'fr',
            }
        } else data = StripeHelper.validateCheckout(body as Parameters<typeof StripeHelper.validateCheckout>[0])
        const frontend = useRuntimeConfig().public.frontendDomain
        const session = await StripeHelper.createCheckout({
            ...data,
            successUrl: `${frontend}/api/stripe/payment-result?type=success`,
            cancelUrl: `${frontend}/api/stripe/payment-result?type=cancel`,
        })
        return ResponseHelper.success(event, { sessionId: session.id, url: session.url })
    }

    // Monthly subscription: creates the Stripe page and returns its address
    async createSubscription(event: H3Event) {
        const data = StripeHelper.validateSubscription((await this.body(event)) as Parameters<typeof StripeHelper.validateSubscription>[0])
        const frontend = useRuntimeConfig().public.frontendDomain
        const session = await StripeHelper.createSubscription({
            ...data,
            successUrl: `${frontend}/api/stripe/subscription-result?type=success`,
            cancelUrl: `${frontend}/api/stripe/subscription-result?type=cancel`,
        })
        return ResponseHelper.success(event, { sessionId: session.id, url: session.url })
    }

    // State of a payment or a subscription, from its Stripe session; a paid payment link is saved on its document (once)
    async checkPayment(event: H3Event) {
        const sessionId = StripeHelper.validateSessionId(RequestHelper.query(event, 'sessionId') as string | undefined)
        const session = await StripeHelper.checkoutSession(sessionId)
        await saveLinkPayment(session)
        return ResponseHelper.success(event, await StripeHelper.paymentStatus(session))
    }

    // Stripe calls this address after a payment (Dashboard → Developers → Webhooks, or "stripe listen" locally).
    // Saving twice is harmless: PayLinkHelper.record skips a session already saved
    async webhook(event: H3Event) {
        const stripeEvent = StripeHelper.verifyWebhook((await readRawBody(event, 'utf8')) ?? '', getHeader(event, 'stripe-signature') ?? '')
        if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(stripeEvent.type))
            await saveLinkPayment(stripeEvent.data.object as Stripe.Checkout.Session)
        return ResponseHelper.success(event, { received: true })
    }

    // The document of a payment link: what the Pay me page shows (nothing private beyond its client and amounts)
    async documentFile(event: H3Event) {
        const file = await PayLinkHelper.file(String(RequestHelper.query(event, 'token') ?? ''))
        return file ? ResponseHelper.success(event, file) : ResponseHelper.notFound(event, 'Unknown link')
    }

    async document(event: H3Event) {
        const info = await PayLinkHelper.summary(String(RequestHelper.query(event, 'token') ?? ''))
        if (!info) return ResponseHelper.notFound(event, 'payLinkUnknown')
        const { documentId, ...shown } = info
        return ResponseHelper.success(event, { document: shown })
    }

    async checkSubscription(event: H3Event) {
        const sessionId = StripeHelper.validateSessionId(RequestHelper.query(event, 'sessionId') as string | undefined)
        return ResponseHelper.success(event, await StripeHelper.subscriptionStatus(sessionId))
    }

    // Page shown after Stripe (success or cancel)
    paymentResult(event: H3Event) {
        return html(event, StripePages.payment(resultType(event)))
    }

    subscriptionResult(event: H3Event) {
        return html(event, StripePages.subscription(resultType(event)))
    }
}
