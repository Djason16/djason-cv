// Automatic debit of the steps of the quotes (server/helpers/AutopayHelper.js): a minute after the start, then every 6 hours.
// Not while building the site (prerender). A step is charged once its date has come, never twice.
// Each run leaves its time and result in dc_settings (key autopayLastRun, not one of the settings of the admin form)
const FIRST_MS = 60 * 1000
const EVERY_MS = 6 * 60 * 60 * 1000

const keep = value => DatabaseHelper.execute('INSERT INTO dc_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
    ['autopayLastRun', JSON.stringify({ at: new Date().toISOString(), ...value })]).catch(() => {})

const runOnce = async () => {
    try {
        const results = await AutopayHelper.run()
        await keep({ quotes: results.length, results })
        const done = results.filter(r => r.charged || r.refused || r.noticed || r.error)
        console.log(`💳 Automatic debit checked: ${results.length} quote(s)${done.length ? ` ${JSON.stringify(done)}` : ''}`)
    } catch (error) {
        await keep({ error: error.message })
        console.error('Automatic debit failed:', error.message)
    }
}

export default defineNitroPlugin(nitroApp => {
    if (import.meta.prerender) return
    const first = setTimeout(runOnce, FIRST_MS)
    const timer = setInterval(runOnce, EVERY_MS)
    nitroApp.hooks.hook('close', () => { clearTimeout(first); clearInterval(timer) })
})
