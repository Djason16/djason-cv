import { computed, ref } from 'vue'
import { useAdminDataStore } from '@/stores/adminData.js'
import { api } from '@/utils/api.js'
import { isProfessionalType } from '@/utils/clientTypes.js'
import { todayIso } from '@/utils/display.js'

// Late payment interest rates: list, search, update / delete (/api/interest-rates) and the rate that applies today to a client
export const useInterestRates = () => {
    // The list is shared by every modal (stores/adminData.js)
    const adminData = useAdminDataStore()
    const search = ref('')

    // Rate as a percentage, date in French format
    const formatRate = rate => rate ? `${(rate * 100).toFixed(2)}%` : '-'
    const formatDate = date => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

    const fetchInterestRates = () => adminData.load('interestRates')

    // Saves a rate row of the table
    const updateInterestRate = item => api.put(`/interest-rates/${item.id}`, {
        rate: item.rate, type: item.type, valid_from: item.valid_from, valid_until: item.valid_until
    })

    // Deletes a rate and removes it from the list
    const deleteInterestRate = async id => {
        const res = await api.delete(`/interest-rates/${id}`)
        if (res.success) adminData.remove('interestRates', id)
        return res
    }

    // Rates matching the search bar
    const filteredInterestRates = computed(() => {
        const q = search.value.toLowerCase()
        return adminData.interestRates.filter(r =>
            [formatRate(r.rate), r.valid_from, r.valid_until, r.type]
                .filter(Boolean)
                .some(v => v.toString().toLowerCase().includes(q))
        )
    })

    // true when the rate is valid on a day (today by default, YYYY-MM-DD)
    const isActiveRate = (rate, day = todayIso()) => String(rate.valid_from).slice(0, 10) <= day && String(rate.valid_until).slice(0, 10) >= day

    // Rate valid on a day (today by default) for a client type (professional or individual), null when there is none
    const getApplicableRate = (clientType, day = todayIso()) => {
        const type = isProfessionalType(clientType) ? 'professional' : 'individual'
        return adminData.interestRates.find(r => r.type === type && isActiveRate(r, String(day).slice(0, 10)))?.rate ?? null
    }

    return { search, fetchInterestRates, updateInterestRate, deleteInterestRate, filteredInterestRates, formatRate, formatDate, isActiveRate, getApplicableRate }
}