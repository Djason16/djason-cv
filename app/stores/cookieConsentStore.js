import { defineStore } from 'pinia'
import { cookieConsentActions } from './actions/cookieConsentActions'

export const useCookieConsentStore = defineStore('cookieConsent', {
    // Default state for cookie consent preferences and category definitions
    state: () => ({
        hasUserMadeChoice: false,
        preferences: {
            essential: true,
            security: true,
            payment: true,
            functional: false
        },
        // Cookie categories displayed in the consent banner
        categories: {
            essential: {
                label: 'Essential cookies',
                description: 'Required for the site to function (navigation, admin authentication)',
                required: true
            },
            security: {
                label: 'Security cookies',
                description: 'Protection against unauthorized access and fraud prevention',
                required: true
            },
            payment: {
                label: 'Payment cookies',
                description: 'Stripe for secure online transactions',
                required: true
            },
            functional: {
                label: 'Functional cookies',
                description: 'Language preferences and user experience customization',
                required: false
            }
        }
    }),
    // Computed getters derived from state
    getters: {
        hasConsented: (state) => state.hasUserMadeChoice
    },
    actions: cookieConsentActions
})