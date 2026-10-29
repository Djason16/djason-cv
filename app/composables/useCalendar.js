import { ref } from 'vue'
import { api } from '@/utils/api.js'

// Computes GMT offset string for a given timezone
export const getGMTOffset = (timezone) => {
    try {
        const now = new Date()
        const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
        const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
        // Hours between the timezone and UTC
        const offset = (local - utc) / 36e5
        return `GMT${offset >= 0 ? '+' : ''}${offset}`
    } catch {
        return 'GMT?'
    }
}

// Weekly schedule and timezone of the availability (/api/calendar)
export const useCalendar = () => {
    const settings = ref(null)

    // API failure -> thrown error, with the error key as message (shown by the callers)
    const check = res => {
        if (!res.success) throw new Error(res.error)
        return res
    }

    // Current settings
    const fetchSettings = async () => {
        const res = check(await api.get('/calendar'))
        settings.value = res.settings
        return res.settings
    }

    // Saves the timezone and / or the schedule, and keeps them in the local settings (no new request)
    const updateSettings = async (id, updates) => {
        const payload = {}
        if ('timezone' in updates) payload.timezone = updates.timezone
        if ('schedule' in updates) payload.schedule = updates.schedule
        const res = check(await api.patch(`/calendar/${id}`, payload))
        Object.assign(settings.value, payload)
        return res
    }

    // Emails the current schedule to every active client
    const sendAgenda = async locale => check(await api.post('/calendar/send-agenda', { locale }))

    return { settings, fetchSettings, updateSettings, sendAgenda }
}
