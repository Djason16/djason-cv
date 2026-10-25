import { useLang } from './useLang.js'
import { ref } from 'vue'
import { api } from '@/utils/api.js'

// Computes GMT offset string for a given timezone
export const getGMTOffset = (timezone) => {
    try {
        const now = new Date()
        const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
        const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
        const offset = (local - utc) / 36e5
        return `GMT${offset >= 0 ? '+' : ''}${offset}`
    } catch {
        return 'GMT?'
    }
}

// Hook to manage calendar settings with loading/error states
export const useCalendar = () => {
    const lang = useLang()
    const settings = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Wraps async calls with unified loading/error handling
    const run = async (fn) => {
        loading.value = true
        error.value = null
        try {
            return await fn()
        } catch (err) {
            error.value = err
            console.error('Calendar request failed:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // API failure -> thrown error (handled by the callers like before)
    const check = res => {
        if (!res.success) throw new Error(res.error)
        return res
    }

    // Fetches current calendar settings
    const fetchSettings = () => run(async () => {
        const res = check(await api.get('/calendar'))
        settings.value = res.settings
        return res.settings
    })

    // Updates calendar settings partially (timezone or schedule)
    const updateSettings = (id, updates) => run(async () => {
        const payload = {}
        if ('timezone' in updates) payload.timezone = updates.timezone
        if ('schedule' in updates) payload.schedule = updates.schedule

        const res = check(await api.patch(`/calendar/${id}`, payload))

        if ('timezone' in payload) settings.value.timezone = payload.timezone
        if ('schedule' in payload) settings.value.schedule = payload.schedule

        await fetchSettings()
        return res
    })

    // Sends current agenda/schedule to all active clients
    const sendAgenda = locale => run(async () => {
        return check(await api.post('/calendar/send-agenda', { locale }))
    })

    return { settings, loading, error, fetchSettings, updateSettings, sendAgenda }
}