import { ref } from 'vue'
import { api } from '@/utils/api.js'

// Unavailability periods and manual availability status (/api/unavailability, /api/availability), used by the home page and the admin
export const useUnavailability = () => {
    const periods = ref([])
    const override = ref({ enabled: false, status: null, id: null })

    // Unavailability periods, most recent first
    const fetchPeriods = async () => {
        const res = await api.get('/unavailability')
        if (res.success) periods.value = res.periods
        return res
    }

    // Saves a period, then puts the list back in order (no new request)
    const updatePeriod = async (id, data) => {
        const res = await api.put(`/unavailability/${id}`, data)
        if (!res.success) return res
        periods.value = periods.value
            .map(p => p.id === id ? { ...p, ...data } : p)
            .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)))
        return res
    }

    // Manual status of the moment
    const fetchOverride = async () => {
        const res = await api.get('/availability')
        if (res.success) override.value = res.override
        return res
    }

    // Manual status: forces available / busy / unavailable, or goes back to the automatic one (schedule and periods)
    const toggleOverride = async (enabled, status = 'unavailable') => {
        const res = await api.put('/availability/toggle', { enabled, status, id: override.value?.id })
        if (res.success) override.value = { id: res.override.id, enabled: res.override.enabled, status: res.override.status }
        return res
    }

    // Manual status and periods together (home page)
    const fetchAll = () => Promise.all([fetchOverride(), fetchPeriods()])

    return { periods, override, fetchPeriods, updatePeriod, fetchOverride, toggleOverride, fetchAll }
}
