import { api } from '@/utils/api.js'

/*
 * Actions of the siteSettings store (stores/siteSettings.js): read and save the information about the site owner (/api/settings).
 */

// "this" is the store: this.values, this.loaded
export const siteSettingsActions = {
    // Reads the settings (on the server for the first page, then shared with the browser)
    async load() {
        const res = await api.get('/settings')
        if (!res.success) return res
        Object.assign(this.values, res.settings)
        this.loaded = true
        return res
    },

    // Saves changed settings ({ phone: '...' }) from the admin; the site shows them at once
    async save(changes) {
        const res = await api.put('/settings', changes)
        if (res.success) Object.assign(this.values, res.settings)
        return res
    },

    // Area shown on the site for an address (worked out by the server); null when no service answered
    async areaOf(address) {
        const res = await api.get(`/settings/area?address=${encodeURIComponent(address)}`)
        return res.success ? res.area : null
    },

    // Photo of "About me": a new image (File), or null to go back to the photo of the site
    async savePhoto(file) {
        let res
        if (file) {
            const form = new FormData()
            form.append('image', file)
            res = await api.post('/settings/photo', form)
        } else res = await api.delete('/settings/photo')
        if (res.success) Object.assign(this.values, res.settings)
        return res
    },
}
