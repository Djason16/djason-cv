import { useSiteSettingsStore } from '@/stores/siteSettings.js'
import { api } from '@/utils/api.js'
import { setTimeZone } from '@/utils/display.js'

// Information about the site owner (admin > Settings), read once before any page: on the server for the first page
// (titles, SEO, legal pages in the HTML), then reused by the browser without a new request (useSite()).
// In the browser, the time zone of the agenda too: the day of today of the forms of the admin (todayIso) follows it
export default defineNuxtPlugin(async () => {
    await callOnce('site-settings', () => useSiteSettingsStore().load())
    if (import.meta.client) api.get('/calendar').then(res => setTimeZone(res.settings?.timezone)).catch(() => {})
})
