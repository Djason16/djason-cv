import { useSiteTextsStore } from '@/stores/siteTexts.js'

// Texts changed from the admin (Texts), read once before any page: on the server for the first page
// (in the HTML, for SEO), then reused by the browser without a new request (plugins/lang.js)
export default defineNuxtPlugin(async () => {
    await callOnce('site-texts', () => useSiteTextsStore().load())
})
