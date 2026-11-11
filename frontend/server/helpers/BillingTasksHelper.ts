import { DatabaseHelper } from '../utils/DatabaseHelper'
import { DocumentMailHelper } from './DocumentMailHelper'
import { ReminderHelper } from './ReminderHelper'
import { TimeZoneHelper } from './TimeZoneHelper'
import { hourNow, todayIso } from '~/utils/display'

/*
 * Billing tasks done alone by the server (server/plugins/billing-tasks.js every 30 minutes, or at once from the admin):
 *   the invoices that could not be sent yet (DocumentMailHelper.sendPending), each run
 *   the reminders (ReminderHelper), once a day from 9 am in the time zone of the agenda (admin → Agenda)
 *   await BillingTasksHelper.run({ force })      force: the reminders now; the last result kept in dc_settings (billingTasksLastRun)
 */
const REMIND_FROM_HOUR = 9

const lastRun = async () => {
    const row = await DatabaseHelper.fetchOne("SELECT value FROM dc_settings WHERE `key` = 'billingTasksLastRun'").catch(() => null)
    try { return JSON.parse(row?.value || '{}') } catch { return {} }
}
const keep = (value: unknown) => DatabaseHelper.execute('INSERT INTO dc_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
    ['billingTasksLastRun', JSON.stringify(value)]).catch(() => {})

export const BillingTasksHelper = {
    /** The last run: { at, remindedOn, pending, reminders } */
    last: () => lastRun(),

    async run({ force = false }: { force?: boolean } = {}) {
        const before = await lastRun()
        await TimeZoneHelper.ensure()
        const now = { day: todayIso(), hour: hourNow() }
        const pending = await DocumentMailHelper.sendPending().catch(error => [{ error: error.message }])
        let reminders = null
        if (force || (before.remindedOn !== now.day && now.hour >= REMIND_FROM_HOUR)) {
            reminders = await ReminderHelper.run().catch(error => [{ error: error.message }])
        }
        const result = { at: new Date().toISOString(), remindedOn: reminders ? now.day : before.remindedOn, pending, reminders: reminders ?? before.reminders ?? [] }
        await keep(result)
        const done = [...pending, ...(reminders || [])]
        if (done.length) console.log(`📨 Billing tasks: ${JSON.stringify(done)}`)
        return result
    },
}
