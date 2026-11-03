import { paymentState } from '~/utils/billing.js'
import { DocumentMails } from '../templates/DocumentMails.js'
import { DatabaseHelper } from './DatabaseHelper.js'
import { DocumentsHelper } from './DocumentsHelper.js'
import { MailHelper } from './MailHelper.js'
import { PayLinkHelper } from './PayLinkHelper.js'
import { SettingsHelper } from './SettingsHelper.js'

/*
 * The documents sent by email to their client, their PDF attached. The PDF is drawn by the browser of the admin
 * (utils/pdf.js, the same file as the download): the server only checks it and sends it.
 *   await DocumentMailHelper.send(id, { kind, files, with })   kind 'documents' (the document, with others: with = [ids])
 *                                                              or 'paid' (an invoice paid); files: [{ name, pdf (base64) }]
 *   await DocumentMailHelper.paidOnline(invoiceId, info, amount)   after a payment online (Stripe, automatic debit): the invoice
 *                                                                  to the client at once (the button to download it); the owner told
 *   await DocumentMailHelper.sendInvoice(id)                       one invoice sent by the server alone (its download button)
 *   await DocumentMailHelper.sendPending()                         the ones that could not go (options.mailPending): tried again
 * Every document sent keeps the date (options.mailedAt); the owner gets a copy (bcc).
 */

// A PDF of the browser: base64 of a file starting with "%PDF", 10 MB at most
const MAX_BYTES = 10 * 1024 * 1024
const validPdf = file => typeof file?.pdf === 'string' && file.pdf.startsWith('JVBER') && file.pdf.length * 0.75 <= MAX_BYTES
const fileName = name => `${String(name || 'document').replace(/[^\w.-]+/g, '-').slice(0, 80)}.pdf`

const payUrl = doc => doc?.payToken ? `${String(useRuntimeConfig().public.frontendDomain || '').replace(/\/$/, '')}/pay-me/?doc=${doc.payToken}` : ''
const owner = settings => settings.email || MailHelper.adminAddress()

// The options of a document changed (mailedAt, mailPending), the others kept
const setOptions = async (doc, changes) => DatabaseHelper.execute('UPDATE dc_documents SET options = ? WHERE id = ?',
    [JSON.stringify({ ...(doc.options || {}), ...changes }), doc.id])

// One invoice sent at a time (two tabs of the admin open, or two clicks): never twice
const sending = new Set()

export const DocumentMailHelper = {
    async send(id, { kind, files, with: others = [] }) {
        const doc = await DocumentsHelper.one(id)
        if (!doc) return { error: 'Document not found', status: 404 }
        if (doc.status === 'draft') return { error: 'billMailDraft', status: 409 }
        const to = doc.client?.email
        if (!to) return { error: 'billMailNoEmail', status: 400 }
        if (!Array.isArray(files) || !files.length || files.length > 3 || !files.every(validPdf)) return { error: 'billMailBadPdf', status: 400 }
        if (sending.has(id)) return { document: doc, skipped: true }
        sending.add(id)
        try {
            const extra = (await Promise.all(others.slice(0, 2).map(other => DocumentsHelper.one(other))))
                .filter(other => other && other.clientId === doc.clientId && other.status !== 'draft')
            const all = [doc, ...extra]
            const settings = await SettingsHelper.all()
            const remaining = doc.type === 'invoice' ? paymentState(doc, doc.netToPay).remaining : 0
            const payments = doc.payments || []
            // Left to pay: the link of the payment (the one of its quote for an invoice of a step), made when missing
            let link = ''
            if (remaining > 0) {
                const made = await PayLinkHelper.link(doc.quoteId || doc.id).catch(() => null)
                if (made?.token) link = payUrl({ payToken: made.token })
            }
            const mail = kind === 'documents'
                ? DocumentMails.documents({ types: all.map(d => d.type), numbers: all.map(d => d.number), title: doc.title, remaining, link }, settings)
                : DocumentMails.paid({ invoice: doc.number, title: doc.title, amount: payments.at(-1)?.amount ?? doc.netToPay, remaining }, settings)
            await MailHelper.send({
                to, bcc: owner(settings), replyTo: settings.email || undefined, ...mail,
                attachments: files.map(file => ({ filename: fileName(file.name), content: Buffer.from(file.pdf, 'base64'), contentType: 'application/pdf' })),
            })
            const mailedAt = new Date().toISOString()
            for (const sent of all) await setOptions(sent, { mailedAt, ...(sent.id === doc.id ? { mailPending: false } : {}) })
            return { document: await DocumentsHelper.one(id), sentTo: to }
        } catch (error) {
            console.error('Document mail not sent:', error.message)
            return { error: 'billMailFailed', status: 502 }
        } finally {
            sending.delete(id)
        }
    },

    /**
     * An invoice sent by the server alone: after a payment online, or again by the scheduled task when it could not go
     * (options.mailPending). Thanks for the payment, and the button to download the invoice: its page (/pay-me/?doc=...&pdf=1)
     * draws the PDF in the browser, the same file as in the admin (the only way PDF are made).
     */
    async sendInvoice(id) {
        const doc = await DocumentsHelper.one(id)
        if (!doc || doc.type !== 'invoice' || doc.status === 'draft') return { error: 'Invoice not found' }
        const to = doc.client?.email
        if (!to) { await setOptions(doc, { mailPending: false }); return { skipped: 'no email' } }
        if (sending.has(id)) return { skipped: 'sending' }
        sending.add(id)
        try {
            const settings = await SettingsHelper.all()
            const { remaining } = paymentState(doc, doc.netToPay)
            const made = await PayLinkHelper.link(doc.id).catch(() => null)
            const download = made?.token ? `${payUrl({ payToken: made.token })}&pdf=1` : ''
            const mail = DocumentMails.paid({ invoice: doc.number, title: doc.title, amount: doc.payments?.at(-1)?.amount ?? doc.netToPay, remaining, download }, settings)
            await MailHelper.send({ to, bcc: owner(settings), replyTo: settings.email || undefined, ...mail })
            await setOptions(await DocumentsHelper.one(id), { mailedAt: new Date().toISOString(), mailPending: false })
            return { sent: to }
        } catch (error) {
            console.error('Invoice not sent, tried again later:', error.message)
            await setOptions(await DocumentsHelper.one(id), { mailPending: true }).catch(() => {})
            return { error: error.message }
        } finally {
            sending.delete(id)
        }
    },

    /** The invoices that could not go yet (scheduled task): each one tried again */
    async sendPending() {
        const rows = await DatabaseHelper.fetchAll("SELECT id FROM dc_documents WHERE type = 'invoice' AND status <> 'draft' AND options LIKE '%\"mailPending\":true%'")
        const results = []
        for (const row of rows) results.push({ id: row.id, ...(await this.sendInvoice(row.id)) })
        return results
    },

    // After a payment online: the invoice to the client at once (PDF attached), the owner told
    async paidOnline(invoiceId, info, amount) {
        try {
            const settings = await SettingsHelper.all()
            const invoice = invoiceId ? await DocumentsHelper.one(invoiceId) : null
            const isInvoice = invoice?.type === 'invoice'
            const base = { amount, number: info.number, title: info.title, client: info.client, invoice: isInvoice ? invoice.number : '' }
            await Promise.allSettled([
                isInvoice ? this.sendInvoice(invoice.id) : null,
                MailHelper.send({ to: owner(settings), ...DocumentMails.paidOwner(base, settings) }),
            ])
        } catch (error) {
            console.error('Payment mails not sent:', error.message)
        }
    },
}
