/*
 * Weekly schedule (one row in dc_calendar_settings):
 *   GET       /api/calendar               public (availability shown on the home page)
 *   PUT/PATCH /api/calendar/{id}          timezone and/or schedule, the missing one is kept
 *   POST      /api/calendar/send-agenda   emails the schedule to the active clients
 */
// Agenda emails: sent 5 at a time, with a pause between two batches (milliseconds)
const BATCH_SIZE = 5
const BATCH_DELAY = 500

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

// 'YYYY-MM-DD' whatever the driver returns (string or Date)
const toDateStr = d => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10))

const toSettings = row => ({
    id: row.id,
    userId: row.user_id,
    timezone: row.timezone,
    schedule: row.schedule ? JSON.parse(row.schedule) : {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
})

export default class CalendarController extends Controller {
    static publicActions = ['getAll']

    static routes = { sendAgenda: ['POST', '/send-agenda'] }

    async getAll(event) {
        const row = await this.fetchOne('SELECT * FROM dc_calendar_settings LIMIT 1')
        return row ? ResponseHelper.success(event, { settings: toSettings(row) }) : ResponseHelper.notFound(event, 'calendarNotFound')
    }

    async update(event, args) {
        const row = await this.fetchOne('SELECT * FROM dc_calendar_settings WHERE id = ? LIMIT 1', [args.id])
        if (!row) return ResponseHelper.notFound(event, 'calendarNotFound')

        const body = await this.body(event)
        if (body.schedule !== undefined && (typeof body.schedule !== 'object' || body.schedule === null || Array.isArray(body.schedule)))
            return ResponseHelper.validationError(event, 'Schedule must be an object')

        const current = toSettings(row)
        const timezone = body.timezone !== undefined ? body.timezone : current.timezone
        const schedule = body.schedule !== undefined ? body.schedule : current.schedule

        await this.execute('UPDATE dc_calendar_settings SET timezone = ?, schedule = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [timezone, JSON.stringify(schedule), args.id])

        return ResponseHelper.success(event, { settings: { id: args.id, timezone, schedule, updatedAt: new Date().toISOString() } })
    }

    async sendAgenda(event) {
        const { locale = 'fr' } = await this.body(event)

        const row = await this.fetchOne('SELECT timezone, schedule FROM dc_calendar_settings LIMIT 1')
        if (!row) return ResponseHelper.notFound(event, 'calendarNotFound')

        const timezone = row.timezone
        const schedule = JSON.parse(row.schedule)
        const status = await this.availabilityStatus(timezone)

        // Active clients with an email, companies excluded (individual, freelance, association only)
        const clients = await this.fetchAll("SELECT id, email FROM dc_clients WHERE active = 1 AND email IS NOT NULL AND email != '' AND type != 'company'")
        if (!clients.length) return ResponseHelper.success(event, { sent: 0, total: 0, message: 'noActiveClients' })

        const config = useRuntimeConfig()
        const adminName = config.public.name
        const en = locale === 'en'
        const subject = status.isCurrentlyUnavailable
            ? (en ? `${adminName} - Currently unavailable` : `${adminName} - Actuellement indisponible`)
            : (en ? `${adminName} - My availability` : `${adminName} - Mes disponibilitės`)
        const html = MailTemplates.agenda({ timezone, schedule, ...status, adminName, locale, config })

        const mailer = MailHelper.pool()
        const results = []
        for (let i = 0; i < clients.length; i += BATCH_SIZE) {
            const batch = clients.slice(i, i + BATCH_SIZE)
            results.push(...await Promise.all(batch.map(client =>
                mailer.send({ to: client.email, subject, html })
                    .then(() => ({ success: true, email: client.email }))
                    .catch(error => {
                        console.error(`[MAIL] Failed for ${client.email}:`, error)
                        return { success: false, email: client.email }
                    })
            )))
            if (i + BATCH_SIZE < clients.length) await wait(BATCH_DELAY)
        }
        await mailer.close()

        return ResponseHelper.success(event, {
            sent: results.filter(r => r.success).length,
            total: clients.length,
            failed: results.filter(r => !r.success).map(r => r.email),
            isCurrentlyUnavailable: status.isCurrentlyUnavailable,
            availabilityStatus: status.availabilityStatus,
            hasOverride: status.hasOverride,
        })
    }

    // Status sent in the agenda: the manual override wins, otherwise the unavailability periods of today
    async availabilityStatus(timezone) {
        const periods = await this.fetchAll("SELECT start_date, end_date FROM dc_unavailability WHERE end_date >= date('now') ORDER BY start_date ASC")
        const override = await this.fetchOne('SELECT enabled, status FROM dc_availability_override LIMIT 1')
        const hasOverride = Boolean(override?.enabled)

        // "Today" in the configured timezone, not in UTC (01:00 in Paris can still be yesterday in UTC)
        const today = new Date().toLocaleDateString('en-CA', { timeZone: timezone })
        const unavailableByDates = periods.some(p => toDateStr(p.start_date) <= today && toDateStr(p.end_date) >= today)

        const availabilityStatus = hasOverride ? override.status : (unavailableByDates ? 'unavailable' : 'available')
        return {
            availabilityStatus,
            hasOverride,
            isCurrentlyUnavailable: availabilityStatus === 'unavailable',
            // Dates only come with the dated periods, never with the override (it has no dates)
            unavailability: !hasOverride && unavailableByDates ? periods : [],
        }
    }
}
