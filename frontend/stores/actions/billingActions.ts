import { useAdminDataStore } from '@/stores/adminData'
import { api, type ApiResult } from '@/utils/api'
import type { BillingDocument } from '@/utils/billing'

/*
 * Actions of the billing store (stores/billing.ts): every action returns the answer of the API
 * ({ success, document } or { success: false, error }) and puts the new version of the document in the list.
 */

// The store the actions work on ("this")
type BillingStore = { documents: BillingDocument[], loaded: boolean, load(force?: boolean): Promise<ApiResult> }

const keep = (store: BillingStore, res: ApiResult) => {
    if (!res.success || !res.document) return res
    const i = store.documents.findIndex(d => d.id === res.document.id)
    if (i === -1) store.documents.unshift(res.document)
    else store.documents.splice(i, 1, res.document)
    return res
}

export const billingActions = {
    // Every document (again when force is true)
    async load(this: BillingStore, force = false) {
        if (this.loaded && !force) return { success: true }
        const res = await api.get('/documents')
        if (res.success) {
            this.documents = res.documents
            this.loaded = true
        }
        return res
    },

    // New draft (no id) or changes of a draft
    async save(this: BillingStore, doc: Partial<BillingDocument>) {
        const res = doc.id ? await api.put(`/documents/${doc.id}`, doc) : await api.post('/documents', doc)
        return keep(this, res)
    },

    // Turns off the automatic debit of a quote (the next steps are no longer charged)
    async autopayStop(this: BillingStore, id: string) {
        return keep(this, await api.post(`/documents/${id}/autopay-stop`))
    },

    // Sent by email to the client, the PDF attached (composables/useDocumentMail.js); the documents sent with it get their date too
    async sendMail(this: BillingStore, id: string, body: Record<string, unknown>) {
        const res = keep(this, await api.post(`/documents/${id}/send`, body))
        if (res.success && (body.with as string[] | undefined)?.length) await this.load(true)
        return res
    },

    // The automatic tasks: their last run, or a run now (invoices to send, reminders)
    async tasks(this: BillingStore, now = false) {
        return now ? api.post('/documents/tasks', {}) : api.get('/documents/tasks')
    },

    // A quote without contract (its signature is enough), or with one again
    async contractChoice(this: BillingStore, id: string, none: boolean) {
        return keep(this, await api.post(`/documents/${id}/contract-choice`, { none }))
    },

    // Payment link of a finalized quote or invoice (Pay me page): kept on the document, so its PDF prints it
    async payLink(this: BillingStore, id: string) {
        const res = await api.post(`/documents/${id}/pay-link`)
        const doc = this.documents.find(d => d.id === id)
        if (res.success && doc) doc.payToken = res.token
        return res
    },

    // Finalized: its number; an invoice also marks its missions billed (the list of the missions is loaded again)
    async finalize(this: BillingStore, id: string, number: string) {
        const res = keep(this, await api.post(`/documents/${id}/finalize`, { number }))
        if (res.success) useAdminDataStore().invalidate('missions')
        return res
    },

    async setStatus(this: BillingStore, id: string, status: string) {
        return keep(this, await api.post(`/documents/${id}/status`, { status }))
    },

    async duplicate(this: BillingStore, id: string) {
        return keep(this, await api.post(`/documents/${id}/duplicate`, {}))
    },

    // Draft invoice of one step of the payment plan of a quote
    async createInvoice(this: BillingStore, quoteId: string, stepKey: string, label: string) {
        return keep(this, await api.post(`/documents/${quoteId}/invoice`, { stepKey, label }))
    },

    // Draft contract of a quote: { serviceType, interestRate }
    async createContract(this: BillingStore, quoteId: string, options: Record<string, unknown>) {
        return keep(this, await api.post(`/documents/${quoteId}/contract`, options))
    },

    async addPayment(this: BillingStore, id: string, payment: Record<string, unknown>) {
        return keep(this, await api.post(`/documents/${id}/payments`, payment))
    },

    async removePayment(this: BillingStore, id: string, paymentId: string) {
        return keep(this, await api.delete(`/documents/${id}/payments/${paymentId}`))
    },

    async remove(this: BillingStore, id: string) {
        const res = await api.delete(`/documents/${id}`)
        if (res.success) this.documents = this.documents.filter(d => d.id !== id)
        return res
    },
}
