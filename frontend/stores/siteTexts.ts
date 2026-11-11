import { defineStore } from 'pinia'
import { siteTextsActions } from './actions/siteTextsActions'

/*
 * Texts of the site changed from the admin (Texts), stored in the database (dc_texts):
 * they replace the defaults of plugins/translations/ at once, without a new build (plugins/lang.js).
 * Loaded once before any page by plugins/site-texts.js (on the server: the changed texts are in the HTML, for SEO).
 */
export const useSiteTextsStore = defineStore('siteTexts', {
    state: () => ({
        // { fr: { heroTitle: '...' }, en: { ... } }
        changed: {} as Record<string, Record<string, string>>,
        // true once read from the API
        loaded: false,
    }),
    actions: siteTextsActions,
})
