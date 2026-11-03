// Billing tasks done alone by the server (server/helpers/BillingTasksHelper.js): 90 s after the start, then every 30 minutes
// (the invoices not sent yet; the reminders once a day from 9 am, time zone of the agenda). Not while building the site (prerender)
const FIRST_MS = 90 * 1000
const EVERY_MS = 30 * 60 * 1000

export default defineNitroPlugin(nitroApp => {
    if (import.meta.prerender) return
    const run = () => BillingTasksHelper.run().catch(error => console.error('Billing tasks failed:', error.message))
    const first = setTimeout(run, FIRST_MS)
    const timer = setInterval(run, EVERY_MS)
    nitroApp.hooks.hook('close', () => { clearTimeout(first); clearInterval(timer) })
})
