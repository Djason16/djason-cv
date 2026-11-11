import { defineStore } from 'pinia'
import { adminDataActions, type AdminRecord } from './actions/adminDataActions'

/*
 * Data of the admin page, shared by every modal: each list is loaded once, then kept up to date
 * by the changes made in the modals (no new request each time a modal opens).
 *   const adminData = useAdminDataStore()
 *   await adminData.load('clients', 'services')   only what is not loaded yet
 *   adminData.clients
 *   adminData.invalidate('missions')              loaded again the next time it is needed
 */
export const useAdminDataStore = defineStore('adminData', {
    state: () => ({
        clients: [] as AdminRecord[],
        missions: [] as AdminRecord[],
        services: [] as AdminRecord[],
        interestRates: [] as AdminRecord[],
        // true once a list is loaded
        loaded: {} as Record<string, boolean>,
    }),
    actions: adminDataActions,
})
