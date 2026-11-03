import { api, onDataWritten } from '@/utils/api.js'

/*
 * Keeps the data of the site fresh without loading it again for nothing.
 * The server counts the writes of each table (dc_versions, server/helpers/DatabaseHelper.js); the browser asks for these
 * small numbers (GET /api/versions) and loads again only the lists whose table changed:
 *   - every 30 s while the tab is shown (nothing while it is hidden or offline)
 *   - at once when the visitor comes back to the tab, the window or the connection (last check older than 10 s)
 *   - its own changes (made from this page, already shown) are not loaded again: the server tells which tables a request
 *     wrote (X-Data-Versions), and they are kept as known when nobody else wrote them meanwhile
 *   - never while a field is being typed in: the change is loaded once the field is left
 *
 *   watchData(['dc_clients'], () => store.fetch('clients'))   returns a function that stops watching
 *   startLiveData()                                           once, by plugins/live-data.client.js
 * In a component: onDataChange (composables/useLiveData.js), stopped with the component.
 */

const EVERY = 30e3
const STALE_AFTER = 10e3

// Tables each API route keeps up to date in the page by itself after a change (its store or its composable puts the
// answer in its list). A table a route changes on the side (an invoice marks its missions billed) is loaded again
const OWN_TABLES = {
    clients: ['dc_clients'],
    missions: ['dc_missions'],
    services: ['dc_services'],
    documents: ['dc_documents', 'dc_payments'],
    'interest-rates': ['dc_interest_rates'],
    calendar: ['dc_calendar_settings'],
    unavailability: ['dc_unavailability'],
    availability: ['dc_availability_override'],
    projects: ['dc_projects'],
    skills: ['dc_skills'],
    settings: ['dc_settings'],
    texts: ['dc_texts'],
}

const watchers = new Set()
// Versions of the tables the page shows (null until the first answer)
let known = null
let lastCheck = 0
let running = null
let timer = null
// A change found while a field was being typed in: loaded once it is left
let waiting = false

const paused = () => document.visibilityState === 'hidden' || navigator.onLine === false
const typing = () => {
    const el = document.activeElement
    return Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))
}
const newer = (versions, tables) => tables.some(table => (versions[table] ?? 0) > (known[table] ?? 0))

// Asks for the versions, then loads again what changed (one check at a time)
const check = () => running ||= (async () => {
    try {
        const res = await api.get('/versions')
        lastCheck = Date.now()
        if (!res.success) return
        const versions = res.versions || {}
        // First answer: what the page loaded is up to date
        if (!known) return void (known = versions)
        const due = [...watchers].filter(watcher => newer(versions, watcher.tables))
        if (!due.length) return void (known = { ...known, ...versions })
        if (typing()) return void (waiting = true)
        waiting = false
        known = { ...known, ...versions }
        await Promise.all(due.map(watcher => Promise.resolve().then(watcher.reload).catch(error => console.warn('[live data]', error))))
    } finally {
        running = null
    }
})()

// Next check EVERY after the end of this one
const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
        if (!paused()) await check()
        schedule()
    }, EVERY)
}

// Back on the page: checked at once when the last check is old
const comeBack = async () => {
    if (paused() || Date.now() - lastCheck < STALE_AFTER) return
    await check()
    schedule()
}

// A field left with a change waiting: loaded now
const fieldLeft = () => waiting && setTimeout(() => !typing() && check(), 200)

// Changes of this page ("dc_clients:12:1" = version 12 after 1 write): known if nobody else wrote the table meanwhile
const keepOwn = (endpoint, changes) => {
    if (!known) return
    const own = OWN_TABLES[endpoint.split(/[/?]/)[1]] || []
    for (const item of changes.split(',')) {
        const [table, version, count] = item.split(':')
        if (own.includes(table) && (known[table] ?? 0) === Number(version) - Number(count)) known[table] = Number(version)
    }
}

export const watchData = (tables, reload) => {
    const watcher = { tables, reload }
    watchers.add(watcher)
    return () => watchers.delete(watcher)
}

let started = false
export const startLiveData = () => {
    if (started) return
    started = true
    onDataWritten(keepOwn)
    check()
    schedule()
    document.addEventListener('visibilitychange', comeBack)
    window.addEventListener('focus', comeBack)
    window.addEventListener('online', comeBack)
    document.addEventListener('focusout', fieldLeft)
}
