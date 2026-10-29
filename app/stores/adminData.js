import { defineStore } from 'pinia'
import { api } from '@/utils/api.js'
import { isProfessionalType } from '@/utils/clientTypes.js'

/*
 * Data of the admin page, shared by every modal: each list is loaded once, then kept up to date
 * by the changes made in the modals (no new request each time a modal opens).
 *   const adminData = useAdminDataStore()
 *   await adminData.load('clients', 'services')   only what is not loaded yet
 *   adminData.clients
 *   adminData.invalidate('missions')              loaded again the next time it is needed
 */

// API route and key of the answer of each list
const RESOURCES = {
    clients: { route: '/clients', key: 'clients' },
    missions: { route: '/missions', key: 'missions' },
    services: { route: '/services', key: 'services' },
    interestRates: { route: '/interest-rates', key: 'rates' },
}

// Requests in progress: two modals asking for the same list share one request
const pending = new Map()

// Pricing mode of a mission: tjm > 0 = daily rate, tjm = 0 = direct price,
// tjm = null (old missions) = daily rate worked out from the price for professional clients
const withPricing = (mission, clients) => {
    if (mission.tjm !== null && mission.tjm !== undefined) return mission
    const client = clients.find(c => c.id === mission.client_id)
    const { duration, quantity, unit_price: price } = mission
    const tjm = isProfessionalType(client?.type) && duration && quantity && price
        ? Math.round((price / (duration * quantity)) * 100) / 100
        : 0
    return { ...mission, tjm }
}

export const useAdminDataStore = defineStore('adminData', {
    state: () => ({
        clients: [],
        missions: [],
        services: [],
        interestRates: [],
        // true once a list is loaded
        loaded: {},
    }),
    actions: {
        // Loads the given lists that are not loaded yet
        async load(...names) {
            await Promise.all(names.filter(name => !this.loaded[name]).map(name => this.fetch(name)))
        },

        // Loads one list from the API (missions need the clients for their pricing mode)
        fetch(name) {
            if (pending.has(name)) return pending.get(name)
            const request = (async () => {
                if (name === 'missions') await this.load('clients')
                const { route, key } = RESOURCES[name]
                const res = await api.get(route)
                if (!res.success) return
                const rows = Array.isArray(res[key]) ? res[key] : []
                this[name] = name === 'missions' ? rows.map(m => withPricing(m, this.clients)) : rows
                this.loaded[name] = true
            })().finally(() => pending.delete(name))
            pending.set(name, request)
            return request
        },

        // The lists are loaded again the next time they are needed (after a creation, or a change that affects them)
        invalidate(...names) {
            names.forEach(name => { this.loaded[name] = false })
        },

        // Removes a deleted row from its list
        remove(name, id) {
            this[name] = this[name].filter(row => row.id !== id)
        },
    },
})
