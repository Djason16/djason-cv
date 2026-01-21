import { useNuxtApp } from '#app'
import { computed, ref, watch } from 'vue'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'

export const useDocumentData = (props, options = {}) => {
    const { $lang } = useNuxtApp()
    const groupingStrategy = options.groupingStrategy || 'default'

    const clients = ref([]), missions = ref([]), services = ref([]), search = ref(''), loading = ref(false)

    // Convert service name to translation key
    const toTranslationKey = name => name ? (serviceTranslations[name] || getServiceTranslationKey(name)) : ''

    // Translate service name with fallback
    const translateServiceName = name => {
        const key = toTranslationKey(name)
        const translated = $lang.getTranslation(key)
        return translated !== key ? translated : name
    }

    // Fetch clients, missions, services and normalize missions
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
            console.error('Failed to fetch data:', e)
        } finally {
            loading.value = false
        }
    }

    // Watch modal visibility to fetch data
    if (props) watch(() => props.show, v => v && fetchAllData())

    // Key to group missions by client/date or contract
    const getGroupingKey = m => {
        if (groupingStrategy === 'contracts') return `${m.client_id}_${m.month_concerned || m.date?.slice(0, 7) || 'unknown'}`
        const type = m.client_type || 'company'
        return (type === 'company' || type === 'freelance')
            ? `${m.client_id}_${m.month_concerned || m.date?.slice(0, 7) || 'unknown'}`
            : `${m.client_id}_${m.date}_${m.service_id}`
    }

    // Group and optionally filter missions
    const groupedData = computed(() => {
        const groups = {}, term = search.value.trim().toLowerCase()
        missions.value.forEach(m => {
            if (!term || m.client_name.toLowerCase().includes(term) ||
                (m.title && m.title.toLowerCase().includes(term)) ||
                (m.service_name && m.service_name.toLowerCase().includes(term))) {

                const key = getGroupingKey(m)
                if (groups[key]) groups[key].missions.push(m)
                else groups[key] = {
                    client: m.client_name || 'Unknown',
                    clientType: m.client_type || 'company',
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
        })

        let result = Object.values(groups)
        if (groupingStrategy === 'contracts') {
            result = result
                .filter(g => g.clientType === 'individual')
                .map(g => {
                    const totalAmount = g.missions.reduce((sum, m) => {
                        const line = (Number(m.unit_price) || 0) * (Number(m.quantity) || 1)
                        return sum + (m.vat_applicable === 1 ? line * 1.2 : line)
                    }, 0)
                    return { ...g, totalAmount, hasTVA: g.missions.some(m => m.vat_applicable === 1) }
                })
        }
        return result
    })

    // Format date for table
    const formatDate = (g, format = 'full') => {
        const m = g.missions[0]
        if (!m?.date) return '-'
        const d = new Date(m.date)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        if (format === 'month-only' && (g.clientType === 'company' || g.clientType === 'freelance')) return `XX/${month}/${year}`
        return `${day}/${month}/${year}`
    }

    // Summarize mission titles for display
    const formatMissionsSummary = g => {
        const isCompany = g.clientType === 'company' || g.clientType === 'freelance'
        if (isCompany) return g.missions.map(m => m.title?.trim() || translateServiceName(m.service_name) || m.service_name || '-').join(' + ')
        if (g.missions.length > 1) return g.missions.map(m => m.title?.trim() || '-').join(' + ')
        return g.missions[0]?.title?.trim() || translateServiceName(g.missions[0]?.service_name) || g.missions[0]?.service_name || '-'
    }

    const columns = computed(() => [
        { key: 'client', label: $lang.getTranslation('client'), disabled: true },
        { key: 'date', label: $lang.getTranslation('date'), disabled: true, formatter: g => formatDate(g, groupingStrategy === 'contracts' ? 'full' : 'month-only') },
        { key: 'missionsSummary', label: $lang.getTranslation('missionsSummary'), disabled: true, formatter: formatMissionsSummary }
    ])

    return { $lang, clients, missions, services, groupedData, columns, search, loading, fetchAllData, translateServiceName, toTranslationKey }
}

// Default documents data export
export const useDocumentsData = props => useDocumentData(props, { groupingStrategy: 'default' })