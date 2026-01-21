import { useNuxtApp } from '#app'
import { computed, ref } from 'vue'

export const useUnavailability = () => {
    const { $lang } = useNuxtApp()

    // Reactive state
    const periods = ref([])
    const override = ref({ enabled: false, status: null, updatedAt: null, id: null })
    const loading = ref(false)
    const error = ref(null)

    // Helper functions
    const translateStatus = (status) => $lang.getTranslation(status)
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

    // Unavailability periods
    const fetchPeriods = () =>
        run(async () => {
            const res = await $fetch('/api/unavailability')
            periods.value = res
            return res
        })

    const createPeriod = (data) =>
        run(async () => {
            const res = await $fetch('/api/unavailability', { method: 'POST', body: data })
            await fetchPeriods()
            return res
        })

    const updatePeriod = (id, data) =>
        run(async () => {
            const res = await $fetch(`/api/unavailability/${id}`, { method: 'PUT', body: data })
            await fetchPeriods()
            return res
        })

    const deletePeriod = (id) =>
        run(async () => {
            const res = await $fetch(`/api/unavailability/${id}`, { method: 'DELETE' })
            await fetchPeriods()
            return res
        })

    const getCurrentPeriod = computed(() =>
        periods.value.length ? periods.value[0] : null
    )

    // Manual availability override
    const fetchOverride = () =>
        run(async () => {
            const res = await $fetch('/api/availability')
            override.value = res
            return res
        })

    const toggleOverride = (enabled, status = 'unavailable', id = null) =>
        run(async () => {
            const finalId = id || override.value?.id

            const res = await $fetch('/api/availability/toggle', {
                method: 'PUT',
                body: { enabled, status, id: finalId }
            })

            override.value = {
                id: res.id,
                enabled: res.enabled,
                status: res.status,
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
            const [overrideData, periodsData] = await Promise.all([
                $fetch('/api/availability').catch(() => ({ enabled: false, status: null, id: null })),
                $fetch('/api/unavailability').catch(() => [])
            ])

            override.value = overrideData
            periods.value = periodsData
        })

    return {
        $lang,
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