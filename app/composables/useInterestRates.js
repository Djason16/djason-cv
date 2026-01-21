import { useNuxtApp } from '#app'
import { ref, computed } from 'vue'

export const useInterestRates = () => {
    const { $lang } = useNuxtApp()

    // State
    const interestRates = ref([])
    const loading = ref(false)
    const search = ref('')

    // Formatting helpers
    const displayValue = v => v ?? '-'
    const formatRate = rate => rate ? `${(rate * 100).toFixed(2)}%` : '-'
    const formatDate = date => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

    // Fetch data from API
    const fetchInterestRates = async () => {
        loading.value = true
        try {
            const res = await $fetch('/api/interest-rates/list')
            interestRates.value = res?.success && Array.isArray(res?.rates?.rows) ? res.rates.rows : []
        } catch (e) {
            console.error('Error fetching interest rates:', e)
            interestRates.value = []
        } finally {
            loading.value = false
        }
    }

    // Filter results by search term
    const filteredInterestRates = computed(() => {
        if (!Array.isArray(interestRates.value)) return []
        const q = search.value.toLowerCase()
        return interestRates.value.filter(r =>
            [formatRate(r.rate), r.valid_from, r.valid_until]
                .filter(Boolean)
                .some(v => v.toString().toLowerCase().includes(q))
        )
    })

    // Check if rate is active based on current date
    const isActiveRate = rate => {
        const now = new Date().toISOString().split('T')[0]
        return rate.valid_from <= now && rate.valid_until >= now
    }

    // Field configuration for forms
    const interestRateFields = [
        { id: 'rate', labelKey: 'rate', placeholderKey: 'enterRate', type: 'number', required: true, step: '0.0001', min: '0', max: '1' },
        { id: 'valid_from', labelKey: 'validFrom', placeholderKey: 'enterValidFrom', type: 'date', required: true },
        { id: 'valid_until', labelKey: 'validUntil', placeholderKey: 'enterValidUntil', type: 'date', required: true }
    ]

    return { $lang, interestRates, loading, search, fetchInterestRates, filteredInterestRates, displayValue, formatRate, formatDate, isActiveRate, interestRateFields }
}