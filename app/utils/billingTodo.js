import { paymentState } from '@/utils/billing.js'
import { quoteProgress } from '@/utils/quoteProgress.js'

/*
 * What is left to do in the billing, the oldest first (the "To do" of the admin dashboard, AdminTodo.vue):
 * a draft to finalize, a quote at its next step (contract, signature, payment), an invoice not paid yet (one of a quote is followed
 * from its quote), and the missions not billed yet, one card per client.
 *   const items = billingTodo(documents, missions, clients, { t, money })
 *   item: { id (a document) or clientId (missions), kind, number, clientName, title, step (what to do), amount (shown), value (its figure), date }
 */
const nameOf = c => c ? c.company_name || `${c.firstname || ''} ${c.lastname || ''}`.trim() : ''

export const billingTodo = (documents, missions, clients, { t, money }) => {
    const clientName = doc => doc.client?.name || nameOf(clients.find(c => c.id === doc.clientId)) || '—'
    const docs = documents.flatMap(d => {
        const item = (kind, amount = d.netToPay) => [{
            id: d.id, kind, number: d.number, clientName: clientName(d), title: d.title, date: d.issueDate || '',
            step: t(`billStepCard_${kind}`), amount: money(amount, d.currency), value: Number(amount) || 0,
        }]
        if (d.status === 'draft') return item('draft')
        if (d.type === 'quote' && ['final', 'accepted'].includes(d.status)) {
            const progress = quoteProgress(d, documents)
            if (progress.current === 'contract') return item('contract')
            if (progress.current === 'sign') return item('sign')
            if (progress.current === 'pay') return item('pay', progress.nextStep.remaining)
        }
        if (d.type === 'invoice' && !d.quoteId && d.status === 'final') {
            const { remaining } = paymentState(d, d.netToPay)
            if (remaining > 0) return item('pay', remaining)
        }
        return []
    })
    // The missions not billed yet, gathered by client: one click makes the invoice, its missions ticked
    const open = missions.filter(m => !m.invoice_id)
    const byClient = [...new Set(open.map(m => m.client_id))].map(clientId => {
        const list = open.filter(m => m.client_id === clientId)
        const total = list.reduce((sum, m) => sum + (Number(m.unit_price) || 0), 0)
        return {
            clientId, kind: 'missions', number: t('billTodoMissions'), title: '',
            clientName: nameOf(clients.find(c => c.id === clientId)) || nameOf(list[0]) || '—',
            step: t('billStepCard_missions', { count: list.length }), amount: money(total), value: total,
            date: list.map(m => String(m.date || '')).sort()[0] || '',
        }
    })
    return [...docs, ...byClient].sort((a, b) => String(a.date).localeCompare(String(b.date)))
}
