import { todayIso } from './display'
/*
 * Amounts of the quotes and invoices (admin > Quotes & invoices), shared by the browser and the server
 * (server/helpers/DocumentsHelper.ts): the same numbers on the screen, in the PDF and in the database.
 *
 *   documentTotals(doc)        lines, discount, VAT -> { subtotal, discount, totalHT, totalTVA, totalTTC, netToPay }
 *   planSteps(plan, total, d)  how the total is paid: at once, deposit + balance, a free schedule or monthly payments
 *   paymentState(doc, total)   paid, remaining and the state shown in the list (paid, partly paid, late...)
 *
 * A line: { description, quantity, unit, unitPrice, vatRate } (vatRate 0.2 = 20 %, 0 = no VAT).
 * A plan: { mode: 'full' | 'deposit' | 'schedule' | 'monthly', deposit: { type: 'percent' | 'amount', value },
 *           schedule: [{ label, type: 'percent' | 'amount', value, dueDate }], months, firstDate }
 */

export const VAT_RATES = [0.2, 0.1, 0.055, 0]

// A line of a document (vatRate 0.2 = 20 %); missionId: the mission it bills
export type BillingLine = { description: string, details?: string, quantity: number, unit: string, unitPrice: number, vatRate: number, missionId?: string }
// A share of the total: a percent of it or an amount
export type Share = { type: 'percent' | 'amount', value: number }
// How the total is paid
export type PaymentPlan = {
    mode?: 'full' | 'deposit' | 'schedule' | 'monthly'
    deposit?: Share
    balanceDate?: string
    schedule?: (Share & { label?: string, dueDate?: string })[]
    months?: number
    firstDate?: string
    dueDate?: string
}
// A step of the payment of a total
export type PlanStep = { key: string, kind: 'standard' | 'deposit' | 'installment' | 'balance', label: string, percent: number, amount: number, dueDate: string }
// A payment received for a document
export type Payment = { id: string, date: string, amount: number, method: string, note: string }
// Copy of the client printed on a finalized document
export type DocumentClient = { id?: string, tva?: string, type?: string, name?: string, firstname?: string, lastname?: string, contact?: string, email?: string, phone?: string, address?: string, postalCode?: string, city?: string, siret?: string }
// Automatic debit of a quote (the card kept by Stripe)
export type Autopay = {
    active?: boolean, customer?: string, paymentMethod?: string, card?: string, email?: string, error?: string
    startedAt?: string, finishedAt?: string, lastChargeAt?: string, noticeFor?: string, errorFor?: string
}
// Options of a document
export type DocumentOptions = {
    allowTransfer?: boolean, noContract?: boolean, autopay?: Autopay, reminders?: Record<string, string>
    serviceType?: string, interestRate?: number | null, quoteNumber?: string, mailedAt?: string, mailPending?: boolean, [key: string]: unknown
}

// A quote, an invoice or a contract, as the API gives it (server/helpers/DocumentsHelper.ts)
export type BillingDocument = {
    id: string, type: string, kind: string, number: string | null, status: string
    clientId: string | null, client: DocumentClient | null, quoteId: string | null, stepKey: string | null
    title: string, issueDate: string, dueDate: string, validityDays: number, validUntil: string, currency: string
    lines: BillingLine[], discountType: 'percent' | 'amount' | null, discountValue: number, paymentPlan: PaymentPlan
    deductions: { number?: string, amount: number }[], notes: string, options: DocumentOptions
    totalHT: number, totalTVA: number, totalTTC: number, netToPay: number
    finalizedAt: string | null, createdAt: string, payToken: string, payments: Payment[]
}
// What documentTotals() reads
export type TotalsInput = { lines?: BillingLine[], discountType?: 'percent' | 'amount' | null, discountValue?: number, deductions?: { number?: string, amount: number }[] }

// Money is kept in cents while computing: no 0.1 + 0.2 surprises
export const round2 = (value: unknown) => Math.round((Number(value) || 0) * 100) / 100

// Price of a line, before VAT
export const lineTotal = (line: { quantity?: unknown, unitPrice?: unknown }) => round2((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0))

// Totals of a document. The discount lowers every line by the same share (so does its VAT);
// the deductions are the deposits already invoiced, taken off the total of a balance invoice
export const documentTotals = ({ lines = [], discountType = null, discountValue = 0, deductions = [] }: TotalsInput = {}) => {
    const subtotal = round2(lines.reduce((sum, line) => sum + lineTotal(line), 0))
    const rawDiscount = discountType === 'percent' ? subtotal * (Number(discountValue) || 0) / 100
        : discountType === 'amount' ? Number(discountValue) || 0 : 0
    const discount = round2(Math.min(Math.max(rawDiscount, 0), subtotal))
    const share = subtotal ? (subtotal - discount) / subtotal : 0

    const totalHT = round2(subtotal - discount)
    const totalTVA = round2(lines.reduce((sum, line) => sum + lineTotal(line) * share * (Number(line.vatRate) || 0), 0))
    const totalTTC = round2(totalHT + totalTVA)
    const deducted = round2(deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0))
    return { subtotal, discount, totalHT, totalTVA, totalTTC, deducted, netToPay: round2(Math.max(totalTTC - deducted, 0)) }
}

// VAT of each rate, for the totals block ({ 0.2: 40, 0.055: 5.5 })
export const vatByRate = ({ lines = [], discountType = null, discountValue = 0 }: TotalsInput = {}) => {
    const { subtotal, discount } = documentTotals({ lines, discountType, discountValue })
    const share = subtotal ? (subtotal - discount) / subtotal : 0
    const rates: Record<number, number> = {}
    for (const line of lines) {
        const rate = Number(line.vatRate) || 0
        if (rate) rates[rate] = round2((rates[rate] || 0) + lineTotal(line) * share * rate)
    }
    return rates
}

// Amount of a share of the total (a percent or an amount), never more than the total
const shareOf = (part: Share | undefined, total: number) => round2(Math.min(part?.type === 'percent' ? total * (Number(part.value) || 0) / 100 : Number(part?.value) || 0, total))

// Date + n months (YYYY-MM-DD), the same day of the month (the last one when the month is shorter)
export const addMonths = (isoDate: string, months: number) => {
    const [y = 1970, m = 1, d = 1] = String(isoDate).slice(0, 10).split('-').map(Number)
    const last = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate()
    return new Date(Date.UTC(y, m - 1 + months, Math.min(d, last))).toISOString().slice(0, 10)
}

/*
 * Steps of the payment of a total: [{ key, kind, label, percent, amount, dueDate }]
 *   kind: 'standard' (paid at once), 'deposit', 'installment', 'balance' (the last step, what remains)
 * The last step always takes what remains, so the steps always add up to the total.
 */
export const planSteps = (plan: PaymentPlan = {}, total = 0, issueDate = ''): PlanStep[] => {
    const mode = plan.mode || 'full'
    const percentOf = (amount: number) => (total ? Math.round(amount / total * 1000) / 10 : 0)

    if (mode === 'deposit') {
        const deposit = shareOf(plan.deposit, total)
        return [
            { key: 'deposit', kind: 'deposit', label: 'deposit', percent: percentOf(deposit), amount: deposit, dueDate: issueDate },
            { key: 'balance', kind: 'balance', label: 'balance', percent: percentOf(total - deposit), amount: round2(total - deposit), dueDate: plan.balanceDate || '' },
        ]
    }

    if (mode === 'schedule' && plan.schedule?.length) {
        let used = 0
        return plan.schedule.map((row, i) => {
            const last = i === plan.schedule!.length - 1
            // A percent is always of the whole total, never more than what remains
            const amount = last ? round2(total - used) : Math.min(shareOf(row, total), round2(total - used))
            used = round2(used + amount)
            return { key: `step-${i}`, kind: i === 0 ? 'deposit' : last ? 'balance' : 'installment', label: row.label || '', percent: percentOf(amount), amount, dueDate: row.dueDate || '' }
        })
    }

    if (mode === 'monthly' && Number(plan.months) > 1) {
        const months = Math.round(Number(plan.months))
        const each = Math.floor(total / months * 100) / 100
        const first = plan.firstDate || issueDate
        return Array.from({ length: months }, (_, i) => {
            const amount = i === months - 1 ? round2(total - each * (months - 1)) : each
            return { key: `month-${i}`, kind: i === months - 1 ? 'balance' : 'installment', label: `${i + 1}/${months}`, percent: percentOf(amount), amount, dueDate: first ? addMonths(first, i) : '' }
        })
    }

    return [{ key: 'full', kind: 'standard', label: 'full', percent: 100, amount: round2(total), dueDate: plan.dueDate || '' }]
}

// Paid and remaining of a document, and its state in the list
export const paymentState = (doc: { payments?: { amount: number }[], status?: string, type?: string, dueDate?: string, validUntil?: string } = {}, netToPay = 0, today = todayIso()) => {
    const paid = round2((doc.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0))
    const remaining = round2(Math.max(netToPay - paid, 0))
    let state = doc.status || 'draft'
    if (doc.type === 'invoice' && state === 'final') {
        if (netToPay > 0 && remaining === 0) state = 'paid'
        else if (doc.dueDate && doc.dueDate < today) state = 'late'
        else if (paid > 0) state = 'partial'
    }
    if (doc.type === 'quote' && state === 'final' && doc.validUntil && doc.validUntil < today) state = 'expired'
    return { paid, remaining, state }
}

// Last day a quote is valid (YYYY-MM-DD)
export const quoteValidUntil = (issueDate: string, days: number = 30) => {
    if (!issueDate) return ''
    const d = new Date(`${String(issueDate).slice(0, 10)}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + (Number(days) || 0))
    return d.toISOString().slice(0, 10)
}
