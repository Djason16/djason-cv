import { useLang } from './useLang.js'
import { computed, ref } from 'vue'
import { api } from '@/utils/api.js'
import { isProfessionalType } from '@/utils/clientTypes.js'

// Late payment interest rates: list, search, update / delete (/api/interest-rates) and the rate that applies today to a client
export const useInterestRates = () => {
    const lang = useLang()

    // State
    const interestRates = ref([])
    const loading = ref(false)
    const search = ref('')

    // Formatting helpers
    const displayValue = v => v ?? '-'
    const formatRate = rate => rate ? `${(rate * 100).toFixed(2)}%` : '-'
    const formatDate = date => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

    // Fetches data from API
    const fetchInterestRates = async () => {
        loading.value = true
        const res = await api.get('/interest-rates')
        interestRates.value = res.success && Array.isArray(res.rates) ? res.rates : []
        loading.value = false
    }

    // Saves a rate row of the table
    const updateInterestRate = item => api.put(`/interest-rates/${item.id}`, {
        rate: item.rate, type: item.type, valid_from: item.valid_from, valid_until: item.valid_until
    })

    // Deletes a rate and removes it from the local list
    const deleteInterestRate = async id => {
        const res = await api.delete(`/interest-rates/${id}`)
        if (res.success) interestRates.value = interestRates.value.filter(r => r.id !== id)
        return res
    }

    // Filters results by search term
    const filteredInterestRates = computed(() => {
        if (!Array.isArray(interestRates.value)) return []
        const q = search.value.toLowerCase()
        return interestRates.value.filter(r =>
            [formatRate(r.rate), r.valid_from, r.valid_until, r.type]
                .filter(Boolean)
                .some(v => v.toString().toLowerCase().includes(q))
        )
    })

    // Checks if rate is active based on current date
    const isActiveRate = rate => {
        const now = new Date().toISOString().split('T')[0]
        return rate.valid_from <= now && rate.valid_until >= now
    }

    // Returns the active interest rate for a given client type
    const getApplicableRate = clientType => {
        const now = new Date().toISOString().split('T')[0]
        const type = isProfessionalType(clientType) ? 'professional' : 'individual'
        return interestRates.value.find(r =>
            r.type === type &&
            r.valid_from <= now &&
            r.valid_until >= now
        )?.rate ?? null
    }

    // Field configuration for forms
    const interestRateFields = [
        {
            id: 'type', labelKey: 'type', type: 'select', required: true, options: [
                { value: 'professional', labelKey: 'professional' },
                { value: 'individual', labelKey: 'individual' }
            ]
        },
        { id: 'rate', labelKey: 'rate', placeholderKey: 'enterRate', type: 'number', required: true, step: '0.0001', min: '0', max: '1' },
        { id: 'valid_from', labelKey: 'validFrom', placeholderKey: 'enterValidFrom', type: 'date', required: true },
        { id: 'valid_until', labelKey: 'validUntil', placeholderKey: 'enterValidUntil', type: 'date', required: true }
    ]

    return { interestRates, loading, search, fetchInterestRates, updateInterestRate, deleteInterestRate, filteredInterestRates, displayValue, formatRate, formatDate, isActiveRate, getApplicableRate, interestRateFields }
}