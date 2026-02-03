import { useNuxtApp } from '#app'
import { computed, ref } from 'vue'
import { getDurationOptions } from '~/utils/durationOptions'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'

export function useMissions() {
    const { $lang } = useNuxtApp()

    // Reactive state
    const missions = ref([])
    const clients = ref([])
    const services = ref([])
    const loading = ref(false)
    const search = ref('')
    const durationOptions = computed(() => getDurationOptions())

    // Check if client is individual
    const isIndividualClient = id => clients.value.find(c => c.id === id)?.type === 'individual'

    // Return value or fallback placeholder
    const displayValue = v => v ?? '-'

    // Translate service name using predefined key or dynamic mapping
    const displayServiceName = s => {
        const key = serviceTranslations[s.name] || getServiceTranslationKey(s.name)
        return $lang.getTranslation(key)
    }

    // Fetch missions, clients, and services, calculate TJM for missions
    const fetchData = async () => {
        loading.value = true
        try {
            const [mR, cR, sR] = await Promise.all([
                $fetch('/api/missions/list'),
                $fetch('/api/clients/list'),
                $fetch('/api/services/list')
            ])

            if (mR.success) missions.value = mR.missions.map(m => ({
                ...m,
                tjm: m.duration && m.quantity && m.unit_price
                    ? Math.round((m.unit_price / (m.duration * m.quantity)) * 100) / 100
                    : 0
            }))

            if (cR.success) clients.value = cR.clients.rows
            if (sR.success) services.value = sR.services.rows
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    return {
        $lang,
        missions,
        clients,
        services,
        loading,
        search,
        durationOptions,
        isIndividualClient,
        displayValue,
        displayServiceName,
        fetchData
    }
}