import { defineStore } from 'pinia'
import { billingActions } from './actions/billingActions.js'

/*
 * Quotes and invoices of the admin (/api/documents, server/helpers/DocumentsHelper.js), shared by the list and the editor:
 *   const billing = useBillingStore()
 *   await billing.load()                 once, then kept up to date by every action
 *   billing.documents                    newest first, each with its payments
 *   await billing.save(doc)              creates or changes a draft, returns the API answer
 */
export const useBillingStore = defineStore('billing', {
    state: () => ({
        documents: [],
        loaded: false,
    }),
    actions: billingActions,
})
