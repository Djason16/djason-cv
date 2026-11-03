import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useAdminDataStore } from '@/stores/adminData.js'
import { api } from '@/utils/api.js'

// Missions done for companies (time spent or fixed price), with their clients: list, create / update / delete (/api/missions)
export function useMissions() {
    // Lists shared by every modal (stores/adminData.js)
    const adminData = useAdminDataStore()
    const { missions, clients } = storeToRefs(adminData)
    const search = ref('')

    // Missions with their clients: the missions always loaded again (an invoice may have billed some since)
    const fetchData = () => { adminData.invalidate('missions'); return adminData.load('missions', 'clients') }

    // Clients only, for the creation form
    const fetchFormData = () => adminData.load('clients')

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
            description: item.description,
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
        search,
        fetchData,
        fetchFormData,
        createMission,
        saveMission,
        deleteMission
    }
}
