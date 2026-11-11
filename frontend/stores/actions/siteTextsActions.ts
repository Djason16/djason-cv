import { api } from '@/utils/api'

/*
 * Actions of the siteTexts store (stores/siteTexts.js): read and save the texts changed from the admin (/api/texts).
 */

// "this" is the store: this.changed, this.loaded
type SiteTextsStore = { changed: Record<string, Record<string, string>>, loaded: boolean }

export const siteTextsActions = {
    // Reads the changed texts (on the server for the first page, then shared with the browser)
    async load(this: SiteTextsStore) {
        const res = await api.get('/texts')
        if (!res.success) return res
        this.changed = res.texts
        this.loaded = true
        return res
    },

    // Saves one text from the admin (empty = back to the default); the site shows it at once
    async save(this: SiteTextsStore, lang: string, key: string, value: unknown) {
        const res = await api.put('/texts', { lang, key, value })
        if (res.success) this.changed = res.texts
        return res
    },
}
