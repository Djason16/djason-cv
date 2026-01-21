import { useNuxtApp } from '#app'
import { ref } from 'vue'

// Compute GMT offset string for a given timezone
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
    const { $lang } = useNuxtApp()
    const settings = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Wrap async calls with unified loading/error handling
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

    // Fetch current calendar settings
    const fetchSettings = () => run(async () => {
        const res = await $fetch('/api/calendar')
        settings.value = res
        return res
    })

    // Update calendar settings partially (timezone or schedule)
    const updateSettings = (id, updates) => run(async () => {
        const payload = {}
        if ('timezone' in updates) payload.timezone = updates.timezone
        if ('schedule' in updates) payload.schedule = updates.schedule

        const res = await $fetch(`/api/calendar/${id}`, { method: 'PATCH', body: payload })

        if ('timezone' in payload) settings.value.timezone = payload.timezone
        if ('schedule' in payload) settings.value.schedule = payload.schedule

        await fetchSettings()
        return res
    })

    return { $lang, settings, loading, error, fetchSettings, updateSettings }
}