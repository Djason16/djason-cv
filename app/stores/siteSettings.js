import { defineStore } from 'pinia'
import { siteSettingsActions } from './actions/siteSettingsActions.js'

/*
 * Information about the site owner, edited from the admin (Settings) and stored in the database (dc_settings):
 * identity, legal details and social links. Loaded once by components/layout/AppShell, read with useSite().
 *
 * A new setting: add it here, to SETTING_KEYS of server/helpers/SettingsHelper.js
 * and to the fields of components/views/Admin/SettingsModal.vue (with its texts in plugins/translations/pages/admin/settings.js).
 */
export const useSiteSettingsStore = defineStore('siteSettings', {
    state: () => ({
        values: {
            // Identity
            name: '',
            email: '',
            phone: '',
            birthDate: '',
            // Legal and billing details (legal pages, documents)
            siret: '',
            tva: '',
            address: '',
            invoiceAddress: '',
            // Social links of the footer
            linkedin: '',
            github: '',
            malt: '',
            instagram: '',
            whatsapp: '',
            // Photo of "About me" uploaded from the admin (empty: public/images/about-me.jpg)
            aboutPhoto: '',
            // Consumer mediator printed in the terms (CGV)
            mediatorName: '',
            mediatorAddress: '',
            mediatorUrl: '',
            // Numbers of the documents (JSON, utils/numbering.js; empty: DE-2026-0001, FA-..., CO-...)
            numbering: '',
        },
        // true once read from the API
        loaded: false,
    }),
    actions: siteSettingsActions,
})
