import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useLang } from './useLang.js'
import { useAdminDataStore } from '@/stores/adminData.js'
import { api } from '@/utils/api.js'
import { isIndividualType } from '@/utils/clientTypes.js'
import { translateServiceName } from '@/utils/serviceTranslations.js'

// Missions of the clients with their clients and services: list, create / update / delete (/api/missions)
export function useMissions() {
    const lang = useLang()
    // Lists shared by every modal (stores/adminData.js)
    const adminData = useAdminDataStore()
    const { missions, clients, services } = storeToRefs(adminData)
    const search = ref('')

    // true when the client is an individual
    const isIndividualClient = id => isIndividualType(clients.value.find(c => c.id === id)?.type)

    // Service name in the current language
    const displayServiceName = s => translateServiceName(s.name, lang.getTranslation)

    // Missions with their clients and services (only what is not loaded yet)
    const fetchData = () => adminData.load('missions', 'clients', 'services')

    // Clients and services only, for the creation form
    const fetchFormData = () => adminData.load('clients', 'services')

    // Creates a mission: the list is loaded again the next time it is shown
    const createMission = async data => {
        const res = await api.post('/missions', data)
        if (res.success) adminData.invalidate('missions')
        return res
    }

    // Saves a mission row of the table (overrides replace some of its values); its month follows its date, like on the server
    const saveMission = async (item, overrides = {}) => {
        const res = await api.put(`/missions/${item.id}`, {
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
        if (res.success && item.date) item.month_concerned = String(item.date).slice(0, 7)
        return res
    }

    // Deletes a mission and removes it from the list
    const deleteMission = async id => {
        const res = await api.delete(`/missions/${id}`)
        if (res.success) adminData.remove('missions', id)
        return res
    }

    return {
        missions,
        clients,
        services,
        search,
        isIndividualClient,
        displayServiceName,
        fetchData,
        fetchFormData,
        createMission,
        saveMission,
        deleteMission
    }
}
