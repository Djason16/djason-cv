import { useNuxtApp } from '#app'
import { ref, computed, watch } from 'vue'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'

export const useDocumentsData = props => {
    const { $lang } = useNuxtApp()

    // Reactive state
    const clients = ref([]), missions = ref([]), services = ref([]), search = ref(''), loading = ref(false)

    // Map service name to translation key or translated string
    const toTranslationKey = n => n ? serviceTranslations[n] || getServiceTranslationKey(n) : ''
    const translateServiceName = n => { const key = toTranslationKey(n); const t = $lang.getTranslation(key); return t !== key ? t : n }

    // Fetch all data from API
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
        } finally { loading.value = false }
    }

    // Auto-fetch when modal is shown
    if (props) watch(() => props.show, v => v && fetchAllData())

    // Group missions by client, type, and month/date
    const groupedMissions = computed(() => {
        const g = {}
        const term = search.value.trim().toLowerCase()
        missions.value.forEach(m => {
            if (
                !term ||
                m.client_name.toLowerCase().includes(term) ||
                (m.title && m.title.toLowerCase().includes(term)) ||
                (m.service_name && m.service_name.toLowerCase().includes(term))
            ) {
                const client = m.client_name || 'Unknown'
                const type = m.client_type || 'company'
                const key = (type === 'company' || type === 'freelance')
                    ? `${m.client_id}_${m.month_concerned || m.date?.slice(0, 7) || 'unknown'}`
                    : `${m.client_id}_${m.date}_${m.service_id}`
                if (g[key]) g[key].missions.push(m)
                else g[key] = { ...m, client, clientType: type, month: m.date?.slice(0, 7) || 'unknown', missions: [m], client_address: m.client_address, client_postal_code: m.client_postal_code, client_city: m.client_city, client_siret: m.client_siret, client_phone: m.client_phone, client_email: m.client_email }
            }
        })
        return Object.values(g)
    })

    // Table columns with formatted date and mission summary
    const columns = computed(() => [
        { key: 'client', label: $lang.getTranslation('client'), disabled: true },
        {
            key: 'date', label: $lang.getTranslation('date'), disabled: true, formatter: g => {
                const m = g.missions[0]; if (!m?.date) return '-'
                const d = new Date(m.date), day = String(d.getDate()).padStart(2, '0'), month = String(d.getMonth() + 1).padStart(2, '0'), year = d.getFullYear()
                return (g.clientType === 'company' || g.clientType === 'freelance') ? `XX/${month}/${year}` : `${day}/${month}/${year}`
            }
        },
        {
            key: 'missionsSummary', label: $lang.getTranslation('missionsSummary'), disabled: true, formatter: g => {
                if (g.clientType === 'company' || g.clientType === 'freelance') return g.missions.map(m => m.title?.trim() || $lang.getTranslation(toTranslationKey(m.service_name)) || m.service_name || '-').join(' + ')
                return g.missions.length > 1 ? g.missions.map(m => m.title?.trim() || '-').join(' + ') : (() => { const m = g.missions[0]; return m?.title?.trim() || $lang.getTranslation(toTranslationKey(m?.service_name)) || m?.service_name || '-' })()
            }
        }
    ])

    return { $lang, clients, missions, services, groupedMissions, columns, search, loading, fetchAllData, translateServiceName }
}