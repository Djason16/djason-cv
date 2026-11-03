import { todayIso } from '~/utils/display.js'
import { randomBytes } from 'node:crypto'
import { documentTotals, paymentState, planSteps, round2 } from '~/utils/billing.js'
import { DatabaseHelper } from './DatabaseHelper.js'
import { DocumentMailHelper } from './DocumentMailHelper.js'
import { DocumentsHelper } from './DocumentsHelper.js'

/*
 * Payment links of the quotes and invoices: the client pays on the Pay me page (/pay-me/?doc=<token>), by card (Stripe).
 * The amount always comes from the document, never from the browser.
 *   await PayLinkHelper.link(id)          the secret of a finalized document (made once), for the admin
 *   await PayLinkHelper.file(token)       the whole document of a link, to draw its PDF on the Pay me page
 *   await PayLinkHelper.summary(token)    what the page shows: number, client, the steps of a quote, what is left to pay
 *   await PayLinkHelper.record(payment)   a paid Stripe session (or an automatic charge) saved once:
 *       an invoice  -> a payment on it
 *       a quote     -> the invoice of its next step (deposit, installment or the whole: the one already made or a new one), numbered,
 *                      with the payment; the quote accepted (the invoice cannot be made: the payment stays on the quote)
 *     Then the invoice to the client, its PDF drawn by the server, and an email to the owner (DocumentMailHelper.paidOnline).
 *     A first payment with the automatic debit chosen also keeps the card of the client (options.autopay of the quote): AutopayHelper
 *     then charges the next steps on their dates.
 */
const PAYABLE = ['final', 'accepted']
// Payments being saved: the return of the client and the webhook of Stripe can bring the same one at the same time
const saving = new Map()

// Every step of a quote with its state: paid (its invoice settled), and the next one to pay (the invoice already made, if any)
export const stepsOf = async quote => {
    const steps = planSteps(quote.paymentPlan, documentTotals(quote).totalTTC, quote.issueDate)
    const invoices = (await DocumentsHelper.all()).filter(d => d.quoteId === quote.id && d.type === 'invoice' && d.status !== 'cancelled')
    let next = null
    const list = steps.map(step => {
        const invoice = invoices.find(d => d.stepKey === step.key) || null
        const remaining = invoice ? paymentState(invoice, invoice.netToPay).remaining : round2(step.amount)
        const paid = Boolean(invoice) && remaining === 0
        if (!paid && !next) next = { step, invoice, amount: remaining }
        return { key: step.key, kind: step.kind, label: step.label, amount: round2(step.amount), dueDate: step.dueDate || '', paid }
    })
    return { list, next }
}

// Next step of a quote to pay: the first one without an invoice, or whose invoice is not fully paid
export const nextStep = async quote => (await stepsOf(quote)).next

// The document of a payment link (48 hexadecimal letters) while it can be paid, else null
const payableOf = async token => {
    if (!/^[a-f0-9]{48}$/.test(String(token || ''))) return null
    const row = await DatabaseHelper.fetchOne('SELECT id FROM dc_documents WHERE pay_token = ?', [token])
    const doc = row && await DocumentsHelper.one(row.id)
    return doc && PAYABLE.includes(doc.status) ? doc : null
}

const clientName = doc => doc.client?.name || [doc.client?.firstname, doc.client?.lastname].filter(Boolean).join(' ') || ''

// What the page may show of the automatic debit (never the ids of Stripe)
const autopayShown = autopay => autopay ? { active: Boolean(autopay.active), card: autopay.card || '', error: autopay.error || '' } : null

export const PayLinkHelper = {
    /** The secret of the payment link of a finalized quote or invoice (the same one every time). */
    async link(id) {
        const doc = await DocumentsHelper.one(id)
        if (!doc || !['quote', 'invoice'].includes(doc.type)) return { error: 'Document not found', status: 404 }
        if (!PAYABLE.includes(doc.status)) return { error: 'Finalize the document first', status: 409 }
        const row = await DatabaseHelper.fetchOne('SELECT pay_token FROM dc_documents WHERE id = ?', [id])
        if (row?.pay_token) return { token: row.pay_token }
        const token = randomBytes(24).toString('hex')
        await DatabaseHelper.execute('UPDATE dc_documents SET pay_token = ? WHERE id = ?', [token, id])
        return { token }
    },

    /**
     * The whole document of a link, to draw its PDF in the browser of the client (the same file as in the admin):
     * the card kept for the automatic debit is not given, the bank details printed on it are
     */
    async file(token) {
        const doc = await payableOf(token)
        if (!doc) return null
        const { autopay, ...options } = doc.options || {}
        const { bankIban, bankBic } = useRuntimeConfig()
        return { document: { ...doc, options }, bank: { iban: bankIban || null, bic: bankBic || null } }
    },

    /** The document of a link and what is left to pay; null when the link is unknown or the document cannot be paid. */
    async summary(token) {
        const doc = await payableOf(token)
        if (!doc) return null

        const base = { type: doc.type, kind: doc.kind, number: doc.number, title: doc.title, client: clientName(doc), email: doc.client?.email || '', currency: doc.currency || 'EUR', total: doc.netToPay, documentId: doc.id }
        if (doc.type === 'invoice') return { ...base, amount: paymentState(doc, doc.netToPay).remaining, step: null, steps: [], autopay: null }

        const { list, next } = await stepsOf(doc)
        // The automatic debit can be chosen while at least one dated step comes after the one paid now
        const later = next ? list.filter(s => !s.paid && s.key !== next.step.key && s.dueDate).length : 0
        return {
            ...base, amount: next ? next.amount : 0, step: next?.step.key || null, stepKind: next?.step.kind || null,
            steps: list, canAutopay: later > 0, autopay: autopayShown(doc.options?.autopay),
        }
    },

    /** Saves the automatic debit of a quote (or turns it off): { customer, paymentMethod, card, email, active, error } */
    async saveAutopay(quoteId, changes) {
        const doc = await DocumentsHelper.one(quoteId)
        if (!doc) return
        const autopay = { ...(doc.options?.autopay || {}), ...changes }
        await DatabaseHelper.execute('UPDATE dc_documents SET options = ? WHERE id = ?', [JSON.stringify({ ...(doc.options || {}), autopay }), quoteId])
    },

    /**
     * Saves a paid Stripe session or automatic charge (once: a reference already saved is skipped).
     * payment: { id, payment_status: 'paid', amount_total (cents), metadata: { doc_token, step_key, autopay } }
     * card (optional): the card kept for the automatic debit, { customer, paymentMethod, card, email }
     */
    async record(payment, card = null) {
        const id = payment?.id
        if (saving.has(id)) return saving.get(id).then(() => ({ skipped: true }))
        const job = this.recordOnce(payment, card).finally(() => saving.delete(id))
        saving.set(id, job)
        return job
    },

    async recordOnce(payment, card) {
        const token = payment?.metadata?.doc_token
        if (!token || payment.payment_status !== 'paid') return { skipped: true }
        const reference = `Stripe ${payment.id}`
        if (await DatabaseHelper.fetchOne('SELECT id FROM dc_payments WHERE note = ?', [reference])) return { skipped: true }

        const info = await this.summary(token)
        if (!info) return { error: 'Unknown link' }
        const amount = round2((payment.amount_total || 0) / 100)
        let invoiceId = info.documentId

        // A quote: the invoice of the step paid (the one already made, or a new one), numbered at once; the quote is accepted.
        // If the invoice cannot be made, the payment is kept on the quote: the money is never lost (the admin finishes by hand)
        if (info.type === 'quote') {
            const step = payment.metadata.step_key || info.step
            const existing = (await DocumentsHelper.all()).find(d => d.quoteId === info.documentId && d.type === 'invoice' && d.stepKey === step && d.status !== 'cancelled')
            const made = existing ? { document: existing } : await DocumentsHelper.invoiceFromQuote(info.documentId, step)
            const finalized = made.error ? made : made.document.status === 'draft' ? await DocumentsHelper.finalize(made.document.id) : made
            if (finalized.error) console.error('Payment link: invoice not made, payment kept on the quote:', finalized.error, info.number)
            else invoiceId = finalized.document.id
            await DatabaseHelper.execute("UPDATE dc_documents SET status = 'accepted' WHERE id = ? AND status = 'final'", [info.documentId])
            if (card) await this.saveAutopay(info.documentId, { ...card, active: true, error: '', startedAt: new Date().toISOString() })
        }
        await DatabaseHelper.insert('INSERT INTO dc_payments (id, document_id, date, amount, method, note) VALUES (?, ?, ?, ?, ?, ?)',
            [DatabaseHelper.newId(), invoiceId, todayIso(), amount, 'stripe', reference])
        // The client and the owner told at once (not waited for: Stripe gets its answer); the invoice and its PDF follow from the admin
        DocumentMailHelper.paidOnline(invoiceId, { ...info, token }, amount)
        return { recorded: true, invoiceId }
    },
}
