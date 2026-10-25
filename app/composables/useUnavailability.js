import { useLang } from './useLang.js'
import { computed, ref } from 'vue'
import { api } from '@/utils/api.js'

// Unavailability periods and manual availability status (/api/unavailability, /api/availability), used by the home page and the admin
export const useUnavailability = () => {
    const lang = useLang()

    // Reactive state
    const periods = ref([])
    const override = ref({ enabled: false, status: null, updatedAt: null, id: null })
    const loading = ref(false)
    const error = ref(null)

    // Helper functions
    const translateStatus = (status) => lang.getTranslation(status)
    const displayValue = (v) => v ?? '-'

    // Wraps async calls with loading + error handling
    const run = async (task) => {
        loading.value = true
        error.value = null
        try {
            return await task()
        } catch (err) {
            error.value = err
            console.error('Availability request failed:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // API failure -> thrown error (handled by run and the callers like before)
    const check = res => {
        if (!res.success) throw new Error(res.error)
        return res
    }

    // Unavailability periods
    const fetchPeriods = () =>
        run(async () => {
            const res = check(await api.get('/unavailability'))
            periods.value = res.periods
            return res.periods
        })

    const createPeriod = (data) =>
        run(async () => {
            const res = check(await api.post('/unavailability', data))
            await fetchPeriods()
            return res
        })

    const updatePeriod = (id, data) =>
        run(async () => {
            const res = check(await api.put(`/unavailability/${id}`, data))
            await fetchPeriods()
            return res
        })

    const deletePeriod = (id) =>
        run(async () => {
            const res = check(await api.delete(`/unavailability/${id}`))
            await fetchPeriods()
            return res
        })

    const getCurrentPeriod = computed(() =>
        periods.value.length ? periods.value[0] : null
    )

    // Manual availability override
    const fetchOverride = () =>
        run(async () => {
            const res = check(await api.get('/availability'))
            override.value = res.override
            return res.override
        })

    const toggleOverride = (enabled, status = 'unavailable', id = null) =>
        run(async () => {
            const finalId = id || override.value?.id

            const res = check(await api.put('/availability/toggle', { enabled, status, id: finalId }))

            override.value = {
                id: res.override.id,
                enabled: res.override.enabled,
                status: res.override.status,
                updatedAt: new Date().toISOString()
            }

            return res
        })

    const setAvailable = () => toggleOverride(true, 'available')
    const setBusy = () => toggleOverride(true, 'busy')
    const setUnavailable = () => toggleOverride(true, 'unavailable')
    const disableOverride = () => toggleOverride(false)

    const isOverrideActive = computed(() => override.value.enabled)
    const currentOverrideStatus = computed(() => override.value.status)

    // Loads override and periods together
    const fetchAll = () =>
        run(async () => {
            const [overrideRes, periodsRes] = await Promise.all([api.get('/availability'), api.get('/unavailability')])

            override.value = overrideRes.success ? overrideRes.override : { enabled: false, status: null, id: null }
            periods.value = periodsRes.success ? periodsRes.periods : []
        })

    return {
        periods,
        override,
        loading,
        error,
        translateStatus,
        displayValue,
        fetchPeriods,
        createPeriod,
        updatePeriod,
        deletePeriod,
        getCurrentPeriod,
        fetchOverride,
        toggleOverride,
        setAvailable,
        setBusy,
        setUnavailable,
        disableOverride,
        isOverrideActive,
        currentOverrideStatus,
        fetchAll
    }
}