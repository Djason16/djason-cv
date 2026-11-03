import { todayIso } from '~/utils/display.js'
import { documentTotals, planSteps } from '~/utils/billing.js'
import { DatabaseHelper } from './DatabaseHelper.js'
import { DocumentsHelper } from './DocumentsHelper.js'
import { MailHelper } from './MailHelper.js'
import { PayLinkHelper, nextStep } from './PayLinkHelper.js'
import { SettingsHelper } from './SettingsHelper.js'
import { StripeHelper } from './StripeHelper.js'
import { TimeZoneHelper } from './TimeZoneHelper.js'

/*
 * Automatic debit of the steps of a quote (monthly payments, schedule): the client agreed to it when paying the first step
 * on its payment link (the card is kept by Stripe, options.autopay of the quote). Run by server/plugins/autopay.js.
 *   await AutopayHelper.run()       every quote with the automatic debit on: its next step charged once its date has come
 *   await AutopayHelper.stop(id)    turned off (admin)
 * 7 days before a debit: one email to the client (its date, amount and card), once per step.
 * A charge refused (card refused, authentication asked by the bank): one email to the client with the link to pay it by hand,
 * one to the owner; the debit stays on for the next steps. The same step is never charged twice (key of Stripe per day).
 */
// The day of today of the owner (time zone of the agenda): a debit, its invoice and its number follow it
const today = () => todayIso()
// Days before a debit when the client is told
const NOTICE_DAYS = 7
const daysUntil = iso => Math.round((new Date(`${iso}T12:00:00Z`) - new Date(`${today()}T12:00:00Z`)) / 86400000)
// The name of a step in the emails: its own name in the schedule, else its place ("2/3")
const stepName = (step, doc) => {
    if (step.label && !['deposit', 'balance', 'full'].includes(step.label)) return step.label
    const steps = planSteps(doc.paymentPlan, documentTotals(doc).totalTTC, doc.issueDate)
    return `${steps.findIndex(s => s.key === step.key) + 1}/${steps.length}`
}

export const AutopayHelper = {
    async run() {
        await TimeZoneHelper.ensure()
        const rows = await DatabaseHelper.fetchAll(
            "SELECT id, pay_token FROM dc_documents WHERE type = 'quote' AND status IN ('final', 'accepted') AND options LIKE '%\"autopay\"%'")
        const results = []
        for (const row of rows) results.push(await this.charge(row.id, row.pay_token).catch(error => ({ id: row.id, error: error.message })))
        return results
    },

    // The next step of one quote, when its date has come
    async charge(id, token) {
        const doc = await DocumentsHelper.one(id)
        const autopay = doc?.options?.autopay
        if (!autopay?.active || !token) return { id, skipped: 'off' }
        const next = await nextStep(doc)
        if (!next) {
            await PayLinkHelper.saveAutopay(id, { active: false, finishedAt: new Date().toISOString() })
            return { id, done: true }
        }
        if (!next.step.dueDate) return { id, waiting: 'no date' }

        // Not yet: told 7 days before (once per step); the run of every 6 hours catches it even a little later
        if (next.step.dueDate > today()) {
            const days = daysUntil(next.step.dueDate)
            if (days <= NOTICE_DAYS && autopay.noticeFor !== next.step.key) {
                const client = autopay.email || doc.client?.email
                if (client) {
                    const settings = await SettingsHelper.all()
                    const link = `${useRuntimeConfig().public.frontendDomain}/pay-me/?doc=${token}`
                    const sent = await MailHelper.send({ to: client, replyTo: settings.email || undefined, ...AutopayMails.upcoming({
                        number: doc.number, title: doc.title, amount: next.amount, date: next.step.dueDate, card: autopay.card, step: stepName(next.step, doc), link,
                    }, settings) }).then(() => true, error => (console.error('Debit notice not sent:', error.message), false))
                    if (sent) await PayLinkHelper.saveAutopay(id, { noticeFor: next.step.key })
                    return { id, noticed: next.step.dueDate, sent }
                }
            }
            return { id, waiting: next.step.dueDate }
        }

        const metadata = { doc_token: token, step_key: next.step.key, document: doc.number, autopay: '1' }
        const res = await StripeHelper.chargeSaved({
            customer: autopay.customer, paymentMethod: autopay.paymentMethod, amount: next.amount, currency: doc.currency || 'EUR',
            email: autopay.email || doc.client?.email, description: `Devis ${doc.number} — échéance du ${next.step.dueDate}`, metadata,
            // Once per step, day and card: a new card the same day (after a refusal) can still be charged
            idempotencyKey: `autopay-${id}-${next.step.key}-${today()}-${autopay.paymentMethod}`,
        })
        if (res.ok) {
            await PayLinkHelper.record({ id: res.intent.id, payment_status: 'paid', amount_total: res.intent.amount, metadata })
            await PayLinkHelper.saveAutopay(id, { error: '', lastChargeAt: new Date().toISOString() })
            return { id, charged: next.amount, step: next.step.key }
        }

        // Not a refusal of the bank (Stripe unreachable, a key already used): tried again at the next run, nobody told
        if (!['card_declined', 'authentication_required', 'expired_card', 'insufficient_funds', 'incorrect_cvc', 'processing_error', 'requires_payment_method', 'requires_action'].includes(res.code)) {
            console.error('Automatic debit not done:', res.code, res.message, doc.number)
            return { id, error: res.code }
        }

        // Refused: told once per step and day, the client gets the link to pay it by hand
        const failure = `${next.step.key}-${today()}`
        if (autopay.errorFor !== failure) {
            await PayLinkHelper.saveAutopay(id, { error: res.code, errorFor: failure })
            const settings = await SettingsHelper.all()
            const link = `${useRuntimeConfig().public.frontendDomain}/pay-me/?doc=${token}`
            const info = { number: doc.number, title: doc.title, amount: next.amount, link, reason: res.code }
            const client = autopay.email || doc.client?.email
            await Promise.allSettled([
                client && MailHelper.send({ to: client, ...AutopayMails.failedClient(info, settings) }),
                MailHelper.send({ to: settings.email || MailHelper.adminAddress(), ...AutopayMails.failedOwner(info, settings) }),
            ])
        }
        return { id, refused: res.code }
    },

    /** Turns the automatic debit of a quote off (the card stays at Stripe, it is no longer charged). */
    async stop(id) {
        const doc = await DocumentsHelper.one(id)
        if (!doc?.options?.autopay) return { error: 'No automatic debit', status: 404 }
        await PayLinkHelper.saveAutopay(id, { active: false, stoppedAt: new Date().toISOString() })
        return { document: await DocumentsHelper.one(id) }
    },
}
