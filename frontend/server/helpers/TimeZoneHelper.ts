import { setTimeZone } from '~/utils/display'
import { DatabaseHelper } from '../utils/DatabaseHelper'

/*
 * Time zone of the owner (admin → Agenda, dc_calendar_settings.timezone) used by the server: the day of today of the documents
 * (todayIso), the dates of the debits and reminders, the hour of the daily tasks. Read again every minute at most.
 *   await TimeZoneHelper.ensure()      before a request of the API and each scheduled task
 *   TimeZoneHelper.set('Europe/Paris') when the admin changes it
 */
const EVERY_MS = 60 * 1000
let readAt = 0

export const TimeZoneHelper = {
    async ensure() {
        if (Date.now() - readAt < EVERY_MS) return
        readAt = Date.now()
        const row = await DatabaseHelper.fetchOne('SELECT timezone FROM dc_calendar_settings LIMIT 1').catch(() => null)
        setTimeZone(row?.timezone)
    },

    set(zone: string) {
        readAt = Date.now()
        return setTimeZone(zone)
    },
}
