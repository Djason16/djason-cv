import { createError, defineEventHandler, readBody } from 'h3'
import nodemailer from 'nodemailer'

export default defineEventHandler(async event => {
    const db = event.context.db
    const config = useRuntimeConfig(event)
    const adminName = config.public.name

    const { locale = 'fr' } = await readBody(event)

    // Fetch current calendar settings
    const { rows: settingsRows } = await db.sql`
        SELECT timezone, schedule FROM dc_calendar_settings LIMIT 1
    `

    if (!settingsRows.length)
        throw createError({ statusCode: 404, message: 'calendarNotFound' })

    const timezone = settingsRows[0].timezone
    const schedule = JSON.parse(settingsRows[0].schedule)

    // Fetch unavailability periods that haven't ended yet
    const { rows: unavailability } = await db.sql`
        SELECT start_date, end_date FROM dc_unavailability WHERE end_date >= date('now') ORDER BY start_date ASC
    `

    // Fetch manual availability override, if any — status only, no dates/hours attached
    const { rows: overrideRows } = await db.sql`
        SELECT enabled, status FROM dc_availability_override LIMIT 1
    `
    const override = overrideRows[0] || null
    const hasOverride = !!(override && override.enabled)

    // Normalize dates to 'YYYY-MM-DD' strings before comparing (defensive against Date objects from the driver)
    const toDateStr = d => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10))

    // IMPORTANT: compute "today" in the configured timezone, not in UTC.
    // new Date().toISOString() always returns the UTC date, which can be off by one day
    // (e.g. 01:00 in Paris/CEST on Aug 22 is still Aug 21 23:00 in UTC).
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: timezone })

    // Check if today falls within any date-based unavailability period
    const isCurrentlyUnavailableByDates = unavailability.some(u => toDateStr(u.start_date) <= todayStr && toDateStr(u.end_date) >= todayStr)

    // Manual override takes priority when enabled — it's a plain status flag, unrelated to unavailability dates
    const availabilityStatus = hasOverride ? override.status : (isCurrentlyUnavailableByDates ? 'unavailable' : 'available')
    const isCurrentlyUnavailable = availabilityStatus === 'unavailable'

    // Only pass date ranges to the template when the status comes from the dated unavailability table,
    // never when it comes from the override (override has no associated dates, matches site behavior)
    const relevantUnavailability = (!hasOverride && isCurrentlyUnavailableByDates) ? unavailability : []

    // Fetch active clients with a valid email only — exclude companies, only individual/freelance/association
    const { rows: clients } = await db.sql`
        SELECT id, email FROM dc_clients WHERE active = 1 AND email IS NOT NULL AND email != '' AND type != 'company'
    `

    if (!clients.length)
        return { success: true, sent: 0, total: 0, message: 'noActiveClients' }

    // Configure SMTP transporter with pooling (Option 3)
    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort),
        secure: config.smtpSecure === 'true',
        auth: { user: config.smtpUser, pass: config.smtpPass },
        pool: true,           // Enable SMTP connection pooling
        maxConnections: 5,    // Max. 5 simultaneous connections
        maxMessages: 100      // Max. 100 emails per connection
    })

    // Prepare localized subject — changes if currently unavailable
    const subject = isCurrentlyUnavailable
        ? (locale === 'en' ? `${adminName} - Currently unavailable` : `${adminName} - Actuellement indisponible`)
        : (locale === 'en' ? `${adminName} - My availability` : `${adminName} - Mes disponibilitės`)

    // Batch sending configuration (Option 2)
    const BATCH_SIZE = 5        // Number of emails sent in parallel
    const BATCH_DELAY = 500     // Delay between batches (ms)

    // Helper function to send a batch of emails in parallel
    const sendBatch = async (batch) => {
        const promises = batch.map(client =>
            transporter.sendMail({
                from: `"${adminName}" <${config.smtpUser}>`,
                to: client.email,
                subject,
                html: renderAgendaEmail({
                    timezone,
                    schedule,
                    unavailability: relevantUnavailability,
                    isCurrentlyUnavailable,
                    availabilityStatus,
                    hasOverride,
                    adminName,
                    locale,
                    config
                })
            }).then(() => ({ success: true, email: client.email }))
                .catch(err => {
                    console.error(`[MAIL] Failed for ${client.email}:`, err)
                    return { success: false, email: client.email, error: err }
                })
        )
        return await Promise.all(promises)
    }

    const results = []

    // Process clients in batches (Option 2)
    for (let i = 0; i < clients.length; i += BATCH_SIZE) {
        const batch = clients.slice(i, i + BATCH_SIZE)
        const batchResults = await sendBatch(batch)
        results.push(...batchResults)

        // Small delay between batches (except after the last one)
        if (i + BATCH_SIZE < clients.length) {
            await new Promise(r => setTimeout(r, BATCH_DELAY))
        }
    }

    // Close the transporter to free resources
    await transporter.close()

    // Compile results
    const sent = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).map(r => r.email)

    return { success: true, sent, total: clients.length, failed, isCurrentlyUnavailable, availabilityStatus, hasOverride }
})
