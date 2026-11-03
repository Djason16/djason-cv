import { useAdminDataStore } from '@/stores/adminData.js'
import { api } from '@/utils/api.js'

/*
 * Actions of the billing store (stores/billing.js): every action returns the answer of the API
 * ({ success, document } or { success: false, error }) and puts the new version of the document in the list.
 */

// "this" is the store
const keep = (store, res) => {
    if (!res.success || !res.document) return res
    const i = store.documents.findIndex(d => d.id === res.document.id)
    if (i === -1) store.documents.unshift(res.document)
    else store.documents.splice(i, 1, res.document)
    return res
}

export const billingActions = {
    // Every document (again when force is true)
    async load(force = false) {
        if (this.loaded && !force) return { success: true }
        const res = await api.get('/documents')
        if (res.success) {
            this.documents = res.documents
            this.loaded = true
        }
        return res
    },

    // New draft (no id) or changes of a draft
    async save(doc) {
        const res = doc.id ? await api.put(`/documents/${doc.id}`, doc) : await api.post('/documents', doc)
        return keep(this, res)
    },

    // Turns off the automatic debit of a quote (the next steps are no longer charged)
    async autopayStop(id) {
        return keep(this, await api.post(`/documents/${id}/autopay-stop`))
    },

    // Sent by email to the client, the PDF attached (composables/useDocumentMail.js); the documents sent with it get their date too
    async sendMail(id, body) {
        const res = keep(this, await api.post(`/documents/${id}/send`, body))
        if (res.success && body.with?.length) await this.load(true)
        return res
    },

    // The automatic tasks: their last run, or a run now (invoices to send, reminders)
    async tasks(now = false) {
        return now ? api.post('/documents/tasks', {}) : api.get('/documents/tasks')
    },

    // A quote without contract (its signature is enough), or with one again
    async contractChoice(id, none) {
        return keep(this, await api.post(`/documents/${id}/contract-choice`, { none }))
    },

    // Payment link of a finalized quote or invoice (Pay me page): kept on the document, so its PDF prints it
    async payLink(id) {
        const res = await api.post(`/documents/${id}/pay-link`)
        const doc = this.documents.find(d => d.id === id)
        if (res.success && doc) doc.payToken = res.token
        return res
    },

    // Finalized: its number; an invoice also marks its missions billed (the list of the missions is loaded again)
    async finalize(id, number) {
        const res = keep(this, await api.post(`/documents/${id}/finalize`, { number }))
        if (res.success) useAdminDataStore().invalidate('missions')
        return res
    },

    async setStatus(id, status) {
        return keep(this, await api.post(`/documents/${id}/status`, { status }))
    },

    async duplicate(id) {
        return keep(this, await api.post(`/documents/${id}/duplicate`, {}))
    },

    // Draft invoice of one step of the payment plan of a quote
    async createInvoice(quoteId, stepKey, label) {
        return keep(this, await api.post(`/documents/${quoteId}/invoice`, { stepKey, label }))
    },

    // Draft contract of a quote: { serviceType, interestRate }
    async createContract(quoteId, options) {
        return keep(this, await api.post(`/documents/${quoteId}/contract`, options))
    },

    async addPayment(id, payment) {
        return keep(this, await api.post(`/documents/${id}/payments`, payment))
    },

    async removePayment(id, paymentId) {
        return keep(this, await api.delete(`/documents/${id}/payments/${paymentId}`))
    },

    async remove(id) {
        const res = await api.delete(`/documents/${id}`)
        if (res.success) this.documents = this.documents.filter(d => d.id !== id)
        return res
    },
}
