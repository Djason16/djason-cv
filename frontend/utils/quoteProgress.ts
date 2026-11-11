import type { BillingDocument } from '@/utils/billing'
import { paymentState, planSteps } from '@/utils/billing'

/*
 * Where a quote stands in its path (always in this order): its contract (or none), the signature, then each payment of its plan.
 * Read by the path of the quote (BillingFlow.vue) and by the list of what is left to do (BillingList.vue).
 *   const { contract, plan, nextStep, noContract, signed, refused, current } = quoteProgress(quote, billing.documents)
 * current: 'contract' | 'sign' | 'pay' | 'done' | 'refused'
 */
export const quoteProgress = (quote: BillingDocument, documents: BillingDocument[]) => {
    const mine = documents.filter(d => d.quoteId === quote.id && d.status !== 'cancelled')
    const contract = mine.find(d => d.type === 'contract') || null
    // Each step of the plan with its invoice (made when paid), what is left on it
    const plan = planSteps(quote.paymentPlan, quote.totalTTC, quote.issueDate).map(step => {
        const invoice = mine.find(d => d.type === 'invoice' && d.stepKey === step.key) || null
        const remaining = invoice ? paymentState(invoice, invoice.netToPay).remaining : step.amount
        return { ...step, invoice, remaining, paid: Boolean(invoice) && remaining === 0 }
    })
    const nextStep = plan.find(step => !step.paid) || null
    const noContract = Boolean(quote.options?.noContract) && !contract
    const contractDone = noContract || (contract !== null && contract.status !== 'draft')
    const signed = quote.status === 'accepted'
    const refused = quote.status === 'refused'
    const current = refused ? 'refused' : !contractDone ? 'contract' : !signed ? 'sign' : nextStep ? 'pay' : 'done'
    return { mine, contract, plan, nextStep, noContract, contractDone, signed, refused, current }
}
