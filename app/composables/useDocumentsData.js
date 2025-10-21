import { useNuxtApp } from '#app'
import { ref, computed, watch } from 'vue'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'

export function useDocumentsData(props) {
    const { $lang } = useNuxtApp()

    // Reactive state
    const clients = ref([])
    const missions = ref([])
    const services = ref([])
    const loading = ref(false)
    const search = ref('')

    // Helpers to translate service names
    const toTranslationKey = n => n ? (serviceTranslations[n] || getServiceTranslationKey(n)) : ''
    const translateServiceName = n => {
        const key = toTranslationKey(n)
        const t = $lang.getTranslation(key)
        return t !== key ? t : n
    }

    // Fetch clients, missions, services
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
                const c = clients.value.find(x => x.id === m.client_id) || {}
                return {
                    ...m,
                    service_name: s?.name || m.service_id || '-',
                    client_type: c.type || 'company',
                    client_name: c.company_name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || 'Unknown',
                    client_address: c.address || '',
                    client_postal_code: c.postal_code || '',
                    client_city: c.city || '',
                    client_siret: c.siret || '',
                    client_phone: c.phone || '',
                    client_email: c.email || ''
                }
            })
        } catch (e) {
            console.error('Error loading data:', e)
        } finally {
            loading.value = false
        }
    }

    // Auto-fetch if modal prop exists
    if (props) watch(() => props.show, v => v && fetchAllData())

    // Group missions by client and month
    const groupedMissions = computed(() => {
        const groups = {}
        missions.value.forEach(m => {
            const client = m.client_name || 'Unknown'
            const type = m.client_type || 'company'
            const month = type === 'company' || type === 'freelance'
                ? m.month_concerned || (m.date?.slice(0, 7) || 'unknown')
                : m.date?.slice(0, 7)

            const key = type === 'company' || type === 'freelance' ? `${client}_${month}` : m.id
            if (groups[key]) groups[key].missions.push(m)
            else groups[key] = { ...m, client, clientType: type, month, missions: [m] }
        })
        return Object.values(groups)
    })

    // Table column definitions
    const columns = computed(() => [
        { key: 'client', label: $lang.getTranslation('client'), disabled: true },
        {
            key: 'date',
            label: $lang.getTranslation('date'),
            formatter: g =>
                (g.clientType === 'company' || g.clientType === 'freelance')
                    ? `${g.missions[0]?.date?.slice(0, 7) || '2025-11'}-XX`
                    : g.missions[0]?.date?.slice(0, 10) || '-'
        },
        {
            key: 'missionsSummary',
            label: $lang.getTranslation('missionsSummary'),
            formatter: g => (g.clientType === 'company' || g.clientType === 'freelance')
                ? g.missions.map(m =>
                    m.title?.trim() || $lang.getTranslation(toTranslationKey(m.service_name)) || m.service_name || '-'
                ).join(', ')
                : (() => {
                    const m = g.missions[0]
                    return m?.title?.trim() || $lang.getTranslation(toTranslationKey(m?.service_name)) || m?.service_name || '-'
                })()
        }
    ])

    return { $lang, clients, missions, services, groupedMissions, columns, search, loading, fetchAllData, translateServiceName }
}