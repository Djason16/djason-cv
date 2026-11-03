import { shortNumber } from '@/utils/numbering.js'
import { documentTotals, planSteps } from './billing.js'

/*
 * Props of the contract template (components/views/Documents/ContractContainer.vue) from a contract of the admin
 * (dc_documents, type 'contract', made from a quote): its client, amounts, payment plan and options.
 *
 *   <ContractContainer v-bind="contractProps(doc, clientInfo, bank)" />
 */
export const contractProps = (doc, clientInfo = {}, bank = {}) => {
    const client = doc.client || clientInfo || {}
    const { netToPay } = documentTotals(doc)
    const steps = planSteps(doc.paymentPlan, netToPay, doc.issueDate)
    const mode = doc.paymentPlan?.mode || 'full'
    const year = Number(String(doc.issueDate || new Date().toISOString()).slice(0, 4))

    return {
        client: {
            name: client.name || '', address: client.address || '', postal_code: client.postalCode || '', city: client.city || '',
            siret: client.siret || '', phone: client.phone || '', email: client.email || '', contact: client.contact || '', type: client.type || 'individual',
        },
        contractDate: doc.issueDate ? `${doc.issueDate}T12:00:00` : new Date().toISOString(),
        contractYear: year,
        // CO-2026-0007 -> 0007 (any format: the figures at its end); a draft shows "BROUILLON"
        contractIndex: shortNumber(doc.number),
        contractNumber: doc.number || '',
        serviceType: doc.options?.serviceType || 'web',
        totalAmount: netToPay,
        // A deposit (or the first step of a schedule) is the amount paid before the work starts
        deposit: ['deposit', 'schedule'].includes(mode) ? steps[0]?.amount || 0 : 0,
        nbMensualites: mode === 'monthly' ? steps.length : 0,
        monthlyPayment: mode === 'monthly' ? steps[0]?.amount || 0 : 0,
        steps: steps.length > 1 ? steps : [],
        quoteNumber: doc.options?.quoteNumber || '',
        interestRate: doc.options?.interestRate ?? null,
        hasTVA: (doc.lines || []).some(line => Number(line.vatRate) > 0),
        // The bank transfer only when offered on the quote (card only otherwise); a contract made before the choice keeps it
        bankInfo: (doc.options?.allowTransfer ?? doc.status !== 'draft') ? { iban: bank.iban || null, bic: bank.bic || null } : { iban: null, bic: null },
        isDraft: doc.status === 'draft',
    }
}
