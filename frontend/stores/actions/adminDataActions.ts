import { api } from '@/utils/api'
import { isProfessionalType } from '@/utils/clientTypes'

/*
 * Actions of the adminData store (stores/adminData.js): load the lists of the admin from the API and keep them up to date.
 * A new list: add it to RESOURCES here and to the state of the store.
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
const withPricing = (mission: AdminRecord, clients: AdminRecord[]) => {
    if (mission.tjm !== null && mission.tjm !== undefined) return mission
    const client = clients.find(c => c.id === mission.client_id)
    const { duration, quantity, unit_price: price } = mission
    const tjm = isProfessionalType(client?.type) && duration && quantity && price
        ? Math.round((price / (duration * quantity)) * 100) / 100
        : 0
    return { ...mission, tjm }
}

// "this" is the store: this.clients, this.missions, this.loaded...
// A row of a list of the admin (client, mission, service, interest rate), as the API gives it
export type AdminRecord = Record<string, any> & { id: string }
// The store the actions work on ("this")
type ListName = 'clients' | 'missions' | 'services' | 'interestRates'
type AdminDataStore = Record<ListName, AdminRecord[]> & { loaded: Record<string, boolean>, load(...names: string[]): Promise<unknown>, fetch(name: string): Promise<unknown> }

export const adminDataActions = {
    // Loads the given lists that are not loaded yet
    async load(this: AdminDataStore, ...names: string[]) {
        await Promise.all(names.filter(name => !this.loaded[name]).map(name => this.fetch(name)))
    },

    // Loads one list from the API (missions need the clients for their pricing mode)
    fetch(this: AdminDataStore, name: string) {
        if (pending.has(name)) return pending.get(name)
        const request = (async () => {
            if (name === 'missions') await this.load('clients')
            const { route, key } = RESOURCES[name as keyof typeof RESOURCES]
            const res = await api.get(route)
            if (!res.success) return
            const rows = Array.isArray(res[key]) ? res[key] : []
            this[name as ListName] = name === 'missions' ? rows.map((m: AdminRecord) => withPricing(m, this.clients)) : rows
            this.loaded[name] = true
        })().finally(() => pending.delete(name))
        pending.set(name, request)
        return request
    },

    // The lists are loaded again the next time they are needed (after a creation, or a change that affects them)
    invalidate(this: AdminDataStore, ...names: string[]) {
        names.forEach(name => { this.loaded[name] = false })
    },

    // Removes a deleted row from its list
    remove(this: AdminDataStore, name: string, id: string) {
        this[name as ListName] = this[name as ListName].filter(row => row.id !== id)
    },
}
