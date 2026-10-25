import { useLang } from './useLang.js'
import { computed, ref } from 'vue'
import { api } from '@/utils/api.js'
import { isIndividualType, isProfessionalType } from '@/utils/clientTypes.js'
import { getDurationOptions } from '@/utils/durationOptions.js'
import { translateServiceName } from '@/utils/serviceTranslations.js'

// Missions of the clients with their clients and services: list, create / update / delete (/api/missions)
export function useMissions() {
    const lang = useLang()

    // Reactive state
    const missions = ref([])
    const clients = ref([])
    const services = ref([])
    const loading = ref(false)
    const search = ref('')
    const durationOptions = computed(() => getDurationOptions())

    // Checks if client is individual
    const isIndividualClient = id => isIndividualType(clients.value.find(c => c.id === id)?.type)

    // Return value or fallback placeholder
    const displayValue = v => v ?? '-'

    // Service name in the current language
    const displayServiceName = s => translateServiceName(s.name, lang.getTranslation)

    // Fetches missions, clients, and services
    const fetchData = async () => {
        loading.value = true
        try {
            const [mR, cR, sR] = await Promise.all([api.get('/missions'), api.get('/clients'), api.get('/services')])

            // tjm = null → old mission, infer from unit_price/duration/quantity (fallback)
            // tjm = 0    → explicit manual pricing mode
            // tjm > 0    → explicit TJM mode with hourly rate
            if (mR.success) missions.value = mR.missions.map(m => {
                const client = (cR.clients || []).find(c => c.id === m.client_id)
                return {
                    ...m,
                    tjm: (m.tjm !== null && m.tjm !== undefined)
                        ? m.tjm
                        : (isProfessionalType(client?.type) && m.duration && m.quantity && m.unit_price
                            ? Math.round((m.unit_price / (m.duration * m.quantity)) * 100) / 100
                            : 0)
                }
            })

            if (cR.success) clients.value = cR.clients
            if (sR.success) services.value = sR.services
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    // Creates a mission — resolves to the API result ({ success, id } or { success: false, error })
    const createMission = data => api.post('/missions', data)

    // Saves a mission row of the table (overrides replace some of its values)
    const saveMission = (item, overrides = {}) => api.put(`/missions/${item.id}`, {
        clientId: item.client_id,
        serviceId: item.service_id,
        title: item.title,
        date: item.date,
        duration: item.duration,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        tjm: item.tjm,
        tvaApplicable: item.vat_applicable,
        ...overrides
    })

    // Deletes a mission and removes it from the local list
    const deleteMission = async id => {
        const res = await api.delete(`/missions/${id}`)
        if (res.success) missions.value = missions.value.filter(m => m.id !== id)
        return res
    }

    return {
        missions,
        clients,
        services,
        loading,
        search,
        durationOptions,
        isIndividualClient,
        displayValue,
        displayServiceName,
        fetchData,
        createMission,
        saveMission,
        deleteMission
    }
}