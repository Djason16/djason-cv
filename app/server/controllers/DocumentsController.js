/*
 * Quotes, invoices and contracts of the admin (server/helpers/DocumentsHelper.js, amounts: utils/billing.js). Admin only.
 *   GET    /api/documents                       every document with its payments
 *   POST   /api/documents                       new draft { type: 'quote' | 'invoice' | 'contract', clientId, lines, ... }
 *   PUT    /api/documents/{id}                  changes a draft
 *   DELETE /api/documents/{id}                  deletes a draft (a finalized document is cancelled instead)
 *   POST   /api/documents/{id}/finalize         { number? } its number, then frozen
 *   POST   /api/documents/{id}/status           { status: 'accepted' | 'refused' | 'cancelled' | 'final' }
 *   POST   /api/documents/{id}/duplicate        new draft with the same content
 *   POST   /api/documents/{id}/invoice          { stepKey, label? } draft invoice of a step of the payment plan of a quote
 *   POST   /api/documents/{id}/contract         { serviceType, interestRate } draft contract of a quote
 *   POST   /api/documents/{id}/payments         { date, amount, method, note } a payment received
 *   POST   /api/documents/{id}/pay-link         its payment link (Pay me page, by card): { token, url }
 *   POST   /api/documents/{id}/autopay-stop     turns off the automatic debit of a quote (AutopayHelper)
 *   POST   /api/documents/{id}/send             { kind: 'documents' | 'paid', files: [{ name, pdf }], with: [ids] } by email,
 *                                                the PDF drawn by the admin attached (DocumentMailHelper)
 *   GET    /api/documents/tasks                 the last run of the billing tasks (time, invoices sent, reminders)
 *   POST   /api/documents/tasks                 the billing tasks at once (BillingTasksHelper): invoices to send, reminders
 *   POST   /api/documents/{id}/contract-choice  { none } a quote with no contract (its signature is enough), or with one again
 *   DELETE /api/documents/{id}/payments/{paymentId}
 */
// accepted, for a contract: signed by the client
const STATUSES = { quote: ['final', 'accepted', 'refused', 'cancelled'], invoice: ['final', 'cancelled'], contract: ['final', 'accepted', 'cancelled'] }
const METHODS = ['transfer', 'card', 'stripe', 'cash', 'check', 'other']

// The answer of a helper: the document, or its error with its HTTP status
const answer = (event, result) => result.error
    ? ResponseHelper.error(event, result.error, result.status || 400, 'DOCUMENT_ERROR')
    : ResponseHelper.success(event, { document: result.document })

export default class DocumentsController extends Controller {
    static routes = {
        finalize: ['POST', '/{id}/finalize'],
        setStatus: ['POST', '/{id}/status'],
        duplicate: ['POST', '/{id}/duplicate'],
        createInvoice: ['POST', '/{id}/invoice'],
        createContract: ['POST', '/{id}/contract'],
        addPayment: ['POST', '/{id}/payments'],
        payLink: ['POST', '/{id}/pay-link'],
        autopayStop: ['POST', '/{id}/autopay-stop'],
        contractChoice: ['POST', '/{id}/contract-choice'],
        send: ['POST', '/{id}/send'],
        tasks: ['POST', '/tasks'],
        tasksStatus: ['GET', '/tasks'],
        removePayment: ['DELETE', '/{id}/payments/{paymentId}'],
    }

    async getAll(event) {
        return ResponseHelper.success(event, { documents: await DocumentsHelper.all() })
    }

    async create(event) {
        return answer(event, await DocumentsHelper.save(null, (await this.body(event)) || {}))
    }

    async update(event, args) {
        return answer(event, await DocumentsHelper.save(args.id, (await this.body(event)) || {}))
    }

    async delete(event, args) {
        const doc = await DocumentsHelper.one(args.id)
        if (!doc) return ResponseHelper.notFound(event, 'Document not found')
        if (doc.status !== 'draft') return ResponseHelper.error(event, 'Only a draft can be deleted', 409, 'DOCUMENT_ERROR')
        await this.execute('DELETE FROM dc_documents WHERE id = ?', [args.id])
        return ResponseHelper.success(event, { id: args.id })
    }

    async finalize(event, args) {
        const body = (await this.body(event)) || {}
        return answer(event, await DocumentsHelper.finalize(args.id, body.number))
    }

    async setStatus(event, args) {
        const doc = await DocumentsHelper.one(args.id)
        if (!doc) return ResponseHelper.notFound(event, 'Document not found')
        const { status } = (await this.body(event)) || {}
        if (doc.status === 'draft' || !STATUSES[doc.type].includes(status))
            return ResponseHelper.validationError(event, 'Status not allowed')
        await this.execute('UPDATE dc_documents SET status = ? WHERE id = ?', [status, args.id])
        // An invoice cancelled: its missions are to bill again
        if (status === 'cancelled') await this.execute('UPDATE dc_missions SET invoice_id = NULL WHERE invoice_id = ?', [args.id])
        return ResponseHelper.success(event, { document: await DocumentsHelper.one(args.id) })
    }

    async duplicate(event, args) {
        const doc = await DocumentsHelper.one(args.id)
        if (!doc) return ResponseHelper.notFound(event, 'Document not found')
        const { id, number, status, issueDate, dueDate, payments, client, ...content } = doc
        return answer(event, await DocumentsHelper.save(null, { ...content, kind: 'standard', quoteId: null, stepKey: null, deductions: [] }))
    }

    async createInvoice(event, args) {
        const body = (await this.body(event)) || {}
        return answer(event, await DocumentsHelper.invoiceFromQuote(args.id, body.stepKey, String(body.label || '').slice(0, 500)))
    }

    async createContract(event, args) {
        return answer(event, await DocumentsHelper.contractFromQuote(args.id, (await this.body(event)) || {}))
    }

    // The payment link of a finalized quote or invoice, to send to the client
    async payLink(event, args) {
        const res = await PayLinkHelper.link(args.id)
        if (res.error) return ResponseHelper.error(event, res.error, res.status || 400, 'DOCUMENT_ERROR')
        return ResponseHelper.success(event, { token: res.token, url: `${useRuntimeConfig().public.frontendDomain}/pay-me/?doc=${res.token}` })
    }

    async send(event, args) {
        const body = await this.body(event)
        const kind = ['documents', 'paid'].includes(body.kind) ? body.kind : 'documents'
        const res = await DocumentMailHelper.send(args.id, { kind, files: body.files, with: Array.isArray(body.with) ? body.with : [] })
        if (res.error) return ResponseHelper.error(event, res.error, res.status || 400, 'DOCUMENT_ERROR')
        return ResponseHelper.success(event, { document: res.document, sentTo: res.sentTo || '', skipped: Boolean(res.skipped) })
    }

    async tasksStatus(event) {
        return ResponseHelper.success(event, { last: await BillingTasksHelper.last() })
    }

    async tasks(event) {
        return ResponseHelper.success(event, await BillingTasksHelper.run({ force: true }))
    }

    async contractChoice(event, args) {
        const { none } = await this.body(event)
        return answer(event, await DocumentsHelper.contractChoice(args.id, Boolean(none)))
    }

    async autopayStop(event, args) {
        return answer(event, await AutopayHelper.stop(args.id))
    }

    async addPayment(event, args) {
        const doc = await DocumentsHelper.one(args.id)
        if (!doc) return ResponseHelper.notFound(event, 'Document not found')
        if (doc.status === 'draft') return ResponseHelper.error(event, 'Finalize the document first', 409, 'DOCUMENT_ERROR')
        const body = (await this.body(event)) || {}
        const amount = Math.round((Number(body.amount) || 0) * 100) / 100
        if (amount <= 0) return ResponseHelper.validationError(event, 'The amount must be positive')
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date || '')) return ResponseHelper.validationError(event, 'Invalid date')

        await this.insert('INSERT INTO dc_payments (id, document_id, date, amount, method, note) VALUES (?, ?, ?, ?, ?, ?)',
            [DatabaseHelper.newId(), args.id, body.date, amount, METHODS.includes(body.method) ? body.method : 'other', String(body.note || '').slice(0, 255)])
        return ResponseHelper.success(event, { document: await DocumentsHelper.one(args.id) })
    }

    async removePayment(event, args) {
        await this.execute('DELETE FROM dc_payments WHERE id = ? AND document_id = ?', [args.paymentId, args.id])
        return ResponseHelper.success(event, { document: await DocumentsHelper.one(args.id) })
    }
}
