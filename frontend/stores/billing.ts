import { defineStore } from 'pinia'
import type { BillingDocument } from '@/utils/billing'
import { billingActions } from './actions/billingActions'

/*
 * Quotes and invoices of the admin (/api/documents, server/helpers/DocumentsHelper.ts), shared by the list and the editor:
 *   const billing = useBillingStore()
 *   await billing.load()                 once, then kept up to date by every action
 *   billing.documents                    newest first, each with its payments
 *   await billing.save(doc)              creates or changes a draft, returns the API answer
 */
export const useBillingStore = defineStore('billing', {
    state: () => ({
        documents: [] as BillingDocument[],
        loaded: false,
    }),
    actions: billingActions,
})
