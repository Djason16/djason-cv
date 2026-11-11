import { todayIso } from '~/utils/display'
import { paymentState, quoteValidUntil } from '~/utils/billing'
import { ReminderMails } from '../templates/ReminderMails'
import { DatabaseHelper } from '../utils/DatabaseHelper'
import { DocumentsHelper, type Document } from './DocumentsHelper'
import { MailHelper, type Mail } from './MailHelper'
import { PayLinkHelper, stepsOf } from './PayLinkHelper'
import { SettingsHelper } from './SettingsHelper'

/*
 * Reminders sent alone, once a day (server/plugins/billing-tasks.js), each one once (options.reminders of the document):
 *   an invoice not paid          on its date, then 7 days later (the link of its page: to pay it, to download it)
 *   the next step of a quote     3 days before its date, on its date, then 7 days later (not with the automatic debit: it has its own)
 *   a quote not signed           7 days after it was sent: to the owner
 *   a quote about to end         3 days before the end of its validity, not signed: to the client, the link to download it again
 *   const results = await ReminderHelper.run()      what was sent
 */
const SOON_DAYS = 3
const LATE_DAYS = 7
const UNSIGNED_DAYS = 7
const EXPIRY_DAYS = 3

const today = () => todayIso()
const daysUntil = (iso: string) => Math.round((new Date(`${iso}T12:00:00Z`).getTime() - new Date(`${today()}T12:00:00Z`).getTime()) / 86400000)
const site = () => String(useRuntimeConfig().public.frontendDomain || '').replace(/\/$/, '')
const payUrl = (token: string) => token ? `${site()}/pay-me/?doc=${token}` : ''

// The reminders already sent by a document: { 'invoice-due': '2026-11-03', ... }, one more kept
const markSent = async (doc: Document, key: string) => {
    const fresh = await DocumentsHelper.one(doc.id)
    if (!fresh) return
    const reminders = { ...(fresh.options?.reminders || {}), [key]: today() }
    await DatabaseHelper.execute('UPDATE dc_documents SET options = ? WHERE id = ?', [JSON.stringify({ ...fresh.options, reminders }), doc.id])
}
const sentBefore = (doc: Document, key: string) => Boolean(doc.options?.reminders?.[key])

// The name of a step: its own name, else its place ("2/3")
const stepName = (step: { key: string, kind: string, label: string }, list: { key: string }[]) => step.label && !['deposit', 'balance', 'full'].includes(step.label) ? step.label
    : step.kind === 'deposit' ? 'acompte' : step.kind === 'balance' ? 'solde' : `${list.findIndex(s => s.key === step.key) + 1}/${list.length}`

export const ReminderHelper = {
    async run() {
        const settings = await SettingsHelper.all()
        const owner = settings.email || MailHelper.adminAddress()
        const docs = await DocumentsHelper.all()
        const results: unknown[] = []

        // Sends one reminder and keeps it; a failure is tried again the next day
        const send = async (doc: Document, key: string, message: Mail, to: string) => {
            try {
                await MailHelper.send({ to, replyTo: to === owner ? undefined : settings.email || undefined, ...message })
                await markSent(doc, key)
                results.push({ number: doc.number, sent: key })
            } catch (error) {
                results.push({ number: doc.number, error: `${key}: ${(error as Error).message}` })
            }
        }
        // The page of a document: the client pays it there and downloads its PDF (&pdf=1: at once)
        const pageOf = async (doc: Document) => payUrl((await PayLinkHelper.link(doc.id).catch(() => null))?.token ?? '')

        for (const doc of docs) {
            const email = doc.client?.email
            const quote = doc.quoteId ? docs.find(d => d.id === doc.quoteId) : null

            // An invoice not paid on its date (not one of a quote paid by automatic debit)
            if (doc.type === 'invoice' && doc.status === 'final' && email && !quote?.options?.autopay?.active) {
                const { remaining } = paymentState(doc, doc.netToPay)
                const due = doc.dueDate || doc.issueDate
                if (remaining <= 0 || !due) continue
                const days = daysUntil(due)
                const key = days <= -LATE_DAYS ? 'invoice-late' : days <= 0 ? 'invoice-due' : null
                if (!key || sentBefore(doc, key)) continue
                const link = await pageOf(doc)
                const message = ReminderMails.invoice({ number: doc.number, amount: remaining, date: due, link, late: key === 'invoice-late' }, settings)
                await send(doc, key, message, email)
                continue
            }

            if (doc.type !== 'quote') continue

            // The next step of a signed quote, by hand (no automatic debit)
            if (doc.status === 'accepted' && email && !doc.options?.autopay?.active) {
                const { list, next } = await stepsOf(doc)
                if (!next?.step.dueDate || next.amount <= 0) continue
                const days = daysUntil(next.step.dueDate)
                const when = days <= -LATE_DAYS ? 'late' : days <= 0 ? 'due' : days <= SOON_DAYS ? 'soon' : null
                const key = when && `step-${next.step.key}-${when}`
                if (!key || sentBefore(doc, key)) continue
                const link = payUrl((await PayLinkHelper.link(doc.id).catch(() => null))?.token ?? '')
                const message = ReminderMails.step({ number: doc.number, amount: next.amount, date: next.step.dueDate, step: stepName(next.step, list), link,
                    soon: when === 'soon', late: when === 'late' }, settings)
                await send(doc, key, message, email)
                continue
            }

            if (doc.status !== 'final') continue

            // Sent a week ago, still not signed: the owner told
            const sentAt = String(doc.options?.mailedAt ?? '').slice(0, 10)
            if (sentAt && -daysUntil(sentAt) >= UNSIGNED_DAYS && !sentBefore(doc, 'unsigned')) {
                await send(doc, 'unsigned', ReminderMails.unsigned({ number: doc.number, title: doc.title, client: doc.client?.name || '', days: -daysUntil(sentAt) }, settings), owner)
            }

            // About to end, not signed: the client gets it again
            const end = quoteValidUntil(doc.issueDate, doc.validityDays || 30)
            const left = end ? daysUntil(end) : -1
            if (email && left >= 0 && left <= EXPIRY_DAYS && !sentBefore(doc, 'expiry')) {
                const link = await pageOf(doc)
                await send(doc, 'expiry', ReminderMails.expiry({ number: doc.number, title: doc.title, date: end, link: link && `${link}&pdf=1` }, settings), email)
            }
        }
        return results
    },
}
