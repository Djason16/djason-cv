import { defineStore } from 'pinia'
import { userPreferencesActions } from './actions/userPreferencesActions.js'

/*
 * Cookie preferences of the visitor (the cookie banner).
 *
 * Adds a category, for example "maps" for an interactive map:
 *   1. add  maps: false  to "preferences" (off until the visitor accepts it)
 *   2. add  maps: { required: false }  to "categories" (required: true = always on, cannot be refused)
 *   3. write its texts in plugins/translations/common/preferences.js: mapsLabel and mapsDescription
 * Then anywhere:  if (userPreferences.preferences.maps) { ...show the map... }
 */
export const useUserPreferencesStore = defineStore('userPreferences', {
    state: () => ({
        // true once the visitor clicked a button of the banner
        hasUserMadeChoice: false,

        // Goes up on each click on "Cookie settings": the banner opens again, even when closed by a page change
        settingsOpenCount: 0,

        // Current choice of the visitor
        preferences: {
            essential: true,
            security: true,
            payment: true,
            functional: false,
        },

        // Categories listed when the visitor clicks "Customize"
        categories: {
            essential: { required: true }, // navigation, admin session
            security: { required: true }, // protection against unauthorized access
            payment: { required: true }, // Stripe, for the online payments
            functional: { required: false }, // remembers choices such as the language
        },
    }),
    actions: userPreferencesActions,
})
