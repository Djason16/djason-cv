import { useNuxtApp } from '#app'
import { computed, ref, watch } from 'vue'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'

export const useContractData = (props) => {
    const { $lang } = useNuxtApp()

    // State management
    const clients = ref([])
    const missions = ref([])
    const services = ref([])
    const search = ref('')
    const loading = ref(false)

    // Service translation utilities
    const toTranslationKey = (name) => name ? (serviceTranslations[name] || getServiceTranslationKey(name)) : ''
    const translateServiceName = (name) => {
        const key = toTranslationKey(name)
        const t = $lang.getTranslation(key)
        return t !== key ? t : name
    }

    // Fetch and merge all contract data from APIs
    const fetchAllData = async () => {
        loading.value = true
        try {
            const [cRes, mRes, sRes] = await Promise.all([
                $fetch('/api/clients/list'),
                $fetch('/api/missions/list'),
                $fetch('/api/services/list')
            ])

            clients.value = cRes?.clients?.rows || []
            services.value = sRes?.services?.rows || []
            missions.value = (mRes?.missions || []).map(m => {
                const s = services.value.find(x => x.id === m.service_id)
                const cl = clients.value.find(x => x.id === m.client_id) || {}

                return {
                    ...m,
                    service_name: s?.name || m.service_id || '-',
                    client_type: cl.type || 'company',
                    client_name: cl.company_name || `${cl.firstname || ''} ${cl.lastname || ''}`.trim() || 'Unknown',
                    client_address: cl.address || '',
                    client_postal_code: cl.postal_code || '',
                    client_city: cl.city || '',
                    client_siret: cl.siret || '',
                    client_phone: cl.phone || '',
                    client_email: cl.email || ''
                }
            })
        } catch (err) {
            console.error('Data fetch error:', err)
        } finally {
            loading.value = false
        }
    }

    // Auto-reload when modal opens
    if (props) watch(() => props.show, v => v && fetchAllData())

    // Group missions by client and month, calculate totals, filter individuals
    const groupedContracts = computed(() => {
        const groups = {}
        const term = search.value.trim().toLowerCase()

        missions.value.forEach(m => {
            if (!term || m.client_name.toLowerCase().includes(term) ||
                (m.title && m.title.toLowerCase().includes(term)) ||
                (m.service_name && m.service_name.toLowerCase().includes(term))) {

                const key = `${m.client_id}_${m.month_concerned || m.date?.slice(0, 7) || 'unknown'}`

                if (groups[key]) {
                    groups[key].missions.push(m)
                } else {
                    groups[key] = {
                        client: m.client_name || 'Unknown',
                        clientType: m.client_type || 'individual',
                        month: m.month_concerned || m.date?.slice(0, 7) || 'unknown',
                        missions: [m],
                        client_address: m.client_address,
                        client_postal_code: m.client_postal_code,
                        client_city: m.client_city,
                        client_siret: m.client_siret,
                        client_phone: m.client_phone,
                        client_email: m.client_email,
                        serviceType: m.service_name?.toLowerCase() || 'web'
                    }
                }
            }
        })

        return Object.values(groups)
            .filter(g => g.clientType === 'individual')
            .map(g => ({
                ...g,
                totalAmount: g.missions.reduce((sum, m) =>
                    sum + ((Number(m.unit_price) || 0) * (Number(m.quantity) || 1)), 0)
            }))
    })

    // Table columns with DD/MM/YYYY date formatting
    const columns = computed(() => [
        { key: 'client', label: $lang.getTranslation('client'), disabled: true },
        {
            key: 'month',
            label: $lang.getTranslation('date'),
            disabled: true,
            formatter: g => {
                const m = g.missions[0]
                if (!m?.date) return '-'
                const d = new Date(m.date)
                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            }
        },
        {
            key: 'missionsSummary',
            label: $lang.getTranslation('missionsSummary'),
            disabled: true,
            formatter: g => g.missions.map(m => m.title?.trim() || translateServiceName(m.service_name) || '-').join(' + ')
        }
    ])

    return { $lang, clients, missions, services, groupedContracts, columns, search, loading, fetchAllData, translateServiceName }
}