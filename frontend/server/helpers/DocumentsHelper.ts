import { todayIso } from '~/utils/display'
import { NUMBERING_TYPES, nextNumber } from '~/utils/numbering'
import { documentTotals, planSteps, quoteValidUntil, round2, type BillingDocument, type BillingLine, type DocumentClient, type DocumentOptions, type PaymentPlan } from '~/utils/billing'
import { DatabaseHelper } from '../utils/DatabaseHelper'
import { SettingsHelper } from './SettingsHelper'

/*
 * Quotes, invoices and contracts (dc_documents) and their payments (dc_payments), used by server/controllers/DocumentsController.ts.
 * Amounts come from utils/billing.ts (the same functions as the admin screens), computed again on every save.
 *
 *   await DocumentsHelper.all()                      every document with its payments, newest first
 *   await DocumentsHelper.save(id, body)             creates or changes a draft
 *   await DocumentsHelper.finalize(id, number?)      gives the next number of its series (admin → Numbering) and freezes the document
 *   await DocumentsHelper.invoiceFromQuote(id, key, label)  draft invoice of a step of the payment plan of a quote
 *   await DocumentsHelper.contractFromQuote(id, options)     draft contract of a quote (its client, lines and payment plan)
 *   await DocumentsHelper.contractChoice(id, none)          a quote without contract (options.noContract), or with one again
 */


// Fields the admin can change on a draft (body in camelCase -> column)
const EDITABLE: Record<string, string> = {
    clientId: 'client_id', title: 'title', issueDate: 'issue_date', dueDate: 'due_date', validityDays: 'validity_days',
    currency: 'currency', lines: 'lines', discountType: 'discount_type', discountValue: 'discount_value',
    paymentPlan: 'payment_plan', notes: 'notes', options: 'options', kind: 'kind',
}

const parse = <T>(text: string | null | undefined, fallback: T): T => {
    try { return text ? JSON.parse(text) : fallback } catch { return fallback }
}
const isoDate = (value: unknown): string => value ? (value instanceof Date ? value.toISOString() : String(value)).slice(0, 10) : ''

// Row of the database -> document of the API (camelCase, JSON fields read)
const toDocument = (row: any, payments: any[] = []): BillingDocument => ({
    id: String(row.id), type: String(row.type), kind: String(row.kind || 'standard'), number: row.number as string | null, status: String(row.status),
    clientId: row.client_id, client: parse<DocumentClient | null>(row.client, null), quoteId: row.quote_id, stepKey: row.step_key,
    title: row.title || '', issueDate: isoDate(row.issue_date), dueDate: isoDate(row.due_date),
    validityDays: row.validity_days ?? 30, validUntil: row.type === 'quote' ? quoteValidUntil(isoDate(row.issue_date), row.validity_days ?? 30) : '',
    currency: row.currency, lines: parse<BillingLine[]>(row.lines, []), discountType: row.discount_type, discountValue: row.discount_value || 0,
    paymentPlan: parse<PaymentPlan>(row.payment_plan, { mode: 'full' }), deductions: parse<{ number?: string, amount: number }[]>(row.deductions, []), notes: row.notes || '', options: parse<DocumentOptions>(row.options, {}),
    totalHT: row.total_ht, totalTVA: row.total_tva, totalTTC: row.total_ttc, netToPay: row.net_to_pay,
    finalizedAt: row.finalized_at, createdAt: row.created_at,
    // Secret of its payment link (empty until the admin asks for it): printed on the PDF
    payToken: row.pay_token || '',
    payments: payments.map(p => ({ id: p.id, date: isoDate(p.date), amount: p.amount, method: p.method, note: p.note || '' })),
})

// Lines kept clean: a description, numbers, a known VAT rate
const cleanLines = (lines: unknown): BillingLine[] => (Array.isArray(lines) ? lines : []).map((line: any) => ({
    description: String(line.description || '').slice(0, 500),
    details: String(line.details || '').slice(0, 1000),
    quantity: Number(line.quantity) || 0,
    unit: String(line.unit || '').slice(0, 32),
    unitPrice: round2(line.unitPrice),
    vatRate: Math.max(0, Math.min(Number(line.vatRate) || 0, 0.2)),
    // A line imported from a mission: the mission is marked billed when the invoice is finalized
    ...(line.missionId ? { missionId: String(line.missionId).slice(0, 64) } : {}),
}))

// Copy of the client printed on the document
const clientSnapshot = async (clientId: string | null | undefined) => {
    const c = clientId ? await DatabaseHelper.fetchOne('SELECT * FROM dc_clients WHERE id = ?', [clientId]) : null
    if (!c) return null
    return {
        id: c.id, type: c.type, name: c.company_name || `${c.firstname || ''} ${c.lastname || ''}`.trim(),
        contact: c.company_name ? `${c.firstname || ''} ${c.lastname || ''}`.trim() : '',
        email: c.email || '', phone: c.phone || '', address: c.address || '', postalCode: c.postal_code || '', city: c.city || '', siret: c.siret || '',
    }
}

// A document of the API (quote, invoice, contract) with its payments (utils/billing.ts)
export type Document = BillingDocument

export const DocumentsHelper = {
    async all() {
        const rows = await DatabaseHelper.fetchAll('SELECT * FROM dc_documents ORDER BY COALESCE(issue_date, created_at) DESC, created_at DESC')
        const payments = await DatabaseHelper.fetchAll('SELECT * FROM dc_payments ORDER BY date')
        return rows.map(row => toDocument(row, payments.filter(p => p.document_id === row.id)))
    },

    async one(id: string) {
        const row = await DatabaseHelper.fetchOne('SELECT * FROM dc_documents WHERE id = ?', [id])
        if (!row) return null
        return toDocument(row, await DatabaseHelper.fetchAll('SELECT * FROM dc_payments WHERE document_id = ? ORDER BY date', [id]))
    },

    /** Creates a draft (no id) or changes a draft; the totals are computed again. Returns the document, or an error text. */
    async save(id: string | null, body: Record<string, any>): Promise<{ error?: string, status?: number, document?: Document | null }> {
        const current = id ? await this.one(id) : null
        if (id && !current) return { error: 'Document not found', status: 404 }
        if (current && current.status !== 'draft') return { error: 'A finalized document cannot be changed', status: 409 }

        const merged: Record<string, any> = { ...(current || { type: NUMBERING_TYPES.includes(body.type) ? body.type : 'quote', lines: [], paymentPlan: { mode: 'full' }, deductions: [], options: {} }) }
        for (const key of Object.keys(EDITABLE)) if (body[key] !== undefined) merged[key] = body[key]
        merged.lines = cleanLines(merged.lines)
        merged.discountType = ['percent', 'amount'].includes(merged.discountType) ? merged.discountType : null
        const totals = documentTotals(merged)

        const values = {
            client_id: merged.clientId || null, title: String(merged.title || '').slice(0, 255), issue_date: merged.issueDate || null,
            due_date: merged.dueDate || null, validity_days: Number(merged.validityDays) || 30, currency: merged.currency === 'USD' ? 'USD' : 'EUR',
            lines: JSON.stringify(merged.lines), discount_type: merged.discountType, discount_value: Number(merged.discountValue) || 0,
            payment_plan: JSON.stringify(merged.paymentPlan || { mode: 'full' }), notes: String(merged.notes || ''), options: JSON.stringify(merged.options || {}),
            total_ht: totals.totalHT, total_tva: totals.totalTVA, total_ttc: totals.totalTTC, net_to_pay: totals.netToPay,
            // An invoice made by hand (not from a quote): an invoice or a deposit invoice (a deposit received for a quote made elsewhere)
            ...(merged.type === 'invoice' && !(current?.quoteId || body.quoteId) ? { kind: merged.kind === 'deposit' ? 'deposit' : 'standard' } : {}),
        }
        // Names between backticks: "lines" is a reserved word of MySQL
        const columns = Object.keys(values)
        if (current) {
            await DatabaseHelper.execute(`UPDATE dc_documents SET ${columns.map(c => `\`${c}\` = ?`).join(', ')} WHERE id = ?`, [...Object.values(values), id])
            return { document: await this.one(id!) }
        }
        const newId = DatabaseHelper.newId()
        const extra = { id: newId, type: merged.type, kind: body.kind || 'standard', quote_id: body.quoteId || null, step_key: body.stepKey || null, deductions: JSON.stringify(body.deductions || []) }
        const all = { ...extra, ...values }
        await DatabaseHelper.insert(`INSERT INTO dc_documents (${Object.keys(all).map(c => `\`${c}\``).join(', ')}) VALUES (${Object.keys(all).map(() => '?').join(', ')})`, Object.values(all))
        return { document: await this.one(newId) }
    },

    /** Next free number of a type on a date, in the format set in admin → Numbering (utils/numbering.ts): DE-2026-0007 */
    async nextNumber(type: string, date: string) {
        const rows = await DatabaseHelper.fetchAll('SELECT number FROM dc_documents WHERE type = ? AND number IS NOT NULL', [type])
        const { numbering } = await SettingsHelper.all()
        return nextNumber(type, date, numbering, rows.map((r: { number: string }) => r.number))
    },

    /** Finalizes a draft: its number (the next one, or the one given if it is free), a copy of its client, frozen. */
    async finalize(id: string, wanted?: string) {
        const doc = await this.one(id)
        if (!doc) return { error: 'Document not found', status: 404 }
        if (doc.status !== 'draft') return { error: 'Already finalized', status: 409 }
        if (!doc.clientId) return { error: 'A client is required', status: 400 }
        if (!doc.lines.length) return { error: 'At least one line is required', status: 400 }

        const issueDate = doc.issueDate || todayIso()
        // An invoice is dated the day it is issued, never later: its number follows the order of the dates (French rules)
        if (doc.type === 'invoice' && issueDate > todayIso()) return { error: 'billIssueDateFuture', status: 400 }
        let number = String(wanted || '').trim() || await this.nextNumber(doc.type, issueDate)
        if (await DatabaseHelper.fetchOne('SELECT id FROM dc_documents WHERE number = ?', [number])) return { error: 'This number is already used', status: 409 }

        const client = await clientSnapshot(doc.clientId)
        await DatabaseHelper.execute("UPDATE dc_documents SET number = ?, status = 'final', issue_date = ?, client = ?, finalized_at = NOW() WHERE id = ?",
            [number, issueDate, JSON.stringify(client), id])
        // The missions of its lines now billed by this invoice (never twice)
        const missions = doc.type === 'invoice' ? doc.lines.map((l: BillingLine) => l.missionId).filter(Boolean) : []
        if (missions.length) await DatabaseHelper.execute(`UPDATE dc_missions SET invoice_id = ? WHERE invoice_id IS NULL AND id IN (${missions.map(() => '?').join(',')})`, [id, ...missions])
        return { document: await this.one(id) }
    },

    /** Draft invoice of one step of the payment plan of a quote (a deposit, an installment or the balance). */
    async invoiceFromQuote(quoteId: string, stepKey: string, label = '') {
        const quote = await this.one(quoteId)
        if (!quote || quote.type !== 'quote') return { error: 'Quote not found', status: 404 }
        if (quote.status === 'draft') return { error: 'Finalize the quote first', status: 409 }

        const totals = documentTotals(quote)
        const steps = planSteps(quote.paymentPlan, totals.totalTTC, quote.issueDate)
        const step = steps.find(s => s.key === stepKey) || steps[0]!
        const invoices = (await this.all()).filter(d => d.quoteId === quoteId && d.status !== 'cancelled')
        if (invoices.some(d => d.stepKey === step.key)) return { error: 'This step already has an invoice', status: 409 }

        const today = todayIso()
        const base = { type: 'invoice', quoteId, stepKey: step.key, clientId: quote.clientId, title: quote.title, currency: quote.currency,
            issueDate: today, dueDate: step.dueDate && step.dueDate > today ? step.dueDate : today, paymentPlan: { mode: 'full' }, notes: quote.notes,
            // A bank transfer offered on the quote stays offered on its invoices (card only otherwise)
            options: { allowTransfer: Boolean(quote.options?.allowTransfer) } }

        // The balance (or a quote paid at once): every line of the quote, minus what was already invoiced
        if (step.kind === 'balance' || step.kind === 'standard') {
            const deductions = invoices.map(d => ({ number: d.number || '', amount: d.netToPay }))
            return this.save(null, { ...base, kind: step.kind, lines: quote.lines, discountType: quote.discountType, discountValue: quote.discountValue, deductions })
        }

        // A deposit or an installment: one line, its share of the quote with the same average VAT
        const vatRate = totals.totalHT ? round2(totals.totalTVA / totals.totalHT * 1000) / 1000 : 0
        // Text of the line: given by the admin screen in its language, or a French one
        const text = label || `${step.kind === 'deposit' ? 'Acompte' : 'Échéance'} ${step.percent} % — ${quote.number}${quote.title ? ` · ${quote.title}` : ''}`
        const lines = [{ description: text, quantity: 1, unit: '', unitPrice: round2(step.amount / (1 + vatRate)), vatRate }]
        return this.save(null, { ...base, kind: step.kind, lines })
    },

    /** A finalized quote not signed yet: without contract (its signature is enough) or with one again */
    async contractChoice(id: string, none: boolean) {
        const doc = await this.one(id)
        if (!doc || doc.type !== 'quote') return { error: 'Quote not found', status: 404 }
        if (doc.status !== 'final') return { error: 'Only a finalized quote not signed yet', status: 409 }
        await DatabaseHelper.execute('UPDATE dc_documents SET options = ? WHERE id = ?', [JSON.stringify({ ...doc.options, noContract: none }), id])
        return { document: await this.one(id) }
    },

    /** Draft contract of a finalized quote: the same client, lines, discount and payment plan; options: { serviceType, interestRate } */
    async contractFromQuote(quoteId: string, options: { serviceType?: string, interestRate?: unknown } = {}) {
        const quote = await this.one(quoteId)
        if (!quote || quote.type !== 'quote') return { error: 'Quote not found', status: 404 }
        if (quote.status === 'draft') return { error: 'Finalize the quote first', status: 409 }
        const existing = (await this.all()).find(d => d.type === 'contract' && d.quoteId === quoteId && d.status !== 'cancelled')
        if (existing) return { error: 'This quote already has a contract', status: 409 }

        const serviceType = ['web', 'video', 'repair'].includes(options.serviceType ?? '') ? options.serviceType : 'web'
        const interestRate = Number.isFinite(Number(options.interestRate)) ? Number(options.interestRate) : null
        return this.save(null, {
            type: 'contract', quoteId, clientId: quote.clientId, title: quote.title, currency: quote.currency,
            issueDate: todayIso(), lines: quote.lines, discountType: quote.discountType,
            discountValue: quote.discountValue, paymentPlan: quote.paymentPlan, notes: '', options: { serviceType, interestRate, quoteNumber: quote.number, allowTransfer: Boolean(quote.options?.allowTransfer) },
        })
    },
}
