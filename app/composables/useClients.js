import { useNuxtApp } from '#app'
import { ref, computed } from 'vue'

export function useClients() {
    const { $lang } = useNuxtApp()

    // Reactive state
    const clients = ref([])
    const loading = ref(false)
    const search = ref('')

    // Return client name or fallback
    const displayClientName = c => c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-'
    const displayValue = v => v ?? '-'

    // Fetch clients from API
    const fetchClients = async () => {
        loading.value = true
        try {
            const res = await $fetch('/api/clients/list')
            if (res.success) clients.value = res.clients.rows
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    // Filter clients by search query
    const filteredClients = computed(() => {
        const q = search.value.toLowerCase()
        return clients.value.filter(c =>
            [c.firstname, c.lastname, c.company_name, c.email, c.address, c.city, c.postal_code]
                .filter(Boolean)
                .some(v => v.toLowerCase().includes(q))
        )
    })

    // Client type checks
    const isIndividualType = t => t === 'individual'
    const isCompanyType = t => t === 'company'
    const isFreelanceType = t => t === 'freelance'

    // Update name fields dynamically
    const updateNameField = (item, value) => {
        if (!item.firstname && !item.lastname) item.company_name = value
        else { const [first, ...rest] = value.split(' '); item.firstname = first; item.lastname = rest.join(' ') }
    }

    // Handle client type change with field migration
    const updateClientType = (item, newType) => {
        const oldType = item.type
        item.type = newType

        if (oldType === 'company' && ['individual', 'freelance'].includes(newType)) {
            if (item.company_name) { const [first, ...rest] = item.company_name.split(' '); item.firstname = first; item.lastname = rest.join(' ') }
            item.company_name = null
        }
        else if (['individual', 'freelance'].includes(oldType) && newType === 'company') {
            item.company_name = [item.firstname, item.lastname].filter(Boolean).join(' ') || null
            item.firstname = item.lastname = null
        }
    }

    // All client fields
    const clientFields = [
        { id: 'firstname', labelKey: 'firstName', placeholderKey: 'enterFirstName', type: 'text', required: true, autocomplete: 'given-name' },
        { id: 'lastname', labelKey: 'lastName', placeholderKey: 'enterLastName', type: 'text', required: true, autocomplete: 'family-name' },
        { id: 'company_name', labelKey: 'companyName', placeholderKey: 'enterCompanyName', type: 'text', required: true, autocomplete: 'organization' },
        { id: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', type: 'email', required: true, autocomplete: 'email' },
        { id: 'phone', labelKey: 'phoneNumber', placeholderKey: 'enterPhone', type: 'tel', required: false, autocomplete: 'tel' },
        { id: 'address', labelKey: 'address', placeholderKey: 'enterAddress', type: 'text', required: false, autocomplete: 'street-address' },
        { id: 'postal_code', labelKey: 'postalCode', placeholderKey: 'enterPostalCode', type: 'text', required: false, autocomplete: 'postal-code' },
        { id: 'city', labelKey: 'city', placeholderKey: 'enterCity', type: 'text', required: false, autocomplete: 'address-level2' },
        { id: 'siret', labelKey: 'siret', placeholderKey: 'enterSiret', type: 'text', required: false, autocomplete: 'off' }
    ]

    // Determine visible fields based on client type
    const getVisibleFields = type => {
        if (type === 'company') return clientFields.filter(f => !['firstname', 'lastname'].includes(f.id))
        if (type === 'freelance') return clientFields.filter(f => f.id !== 'company_name')
        return clientFields.filter(f => f.id !== 'company_name')
    }

    // Group fields into logical rows for layout
    const groupFields = visibleFields => {
        const groups = []
        const addGroup = ids => { const g = visibleFields.filter(f => ids.includes(f.id)); if (g.length) groups.push(g) }

        addGroup(['firstname', 'lastname'])
        addGroup(['email', 'phone'])
        addGroup(['address'])
        addGroup(['postal_code', 'city'])
        addGroup(['company_name', 'siret'])

        const usedIds = groups.flat().map(f => f.id)
        visibleFields.filter(f => !usedIds.includes(f.id)).forEach(f => groups.push([f]))
        return groups
    }

    return {
        $lang,
        clients,
        loading,
        search,
        fetchClients,
        filteredClients,
        displayClientName,
        displayValue,
        isIndividualType,
        isCompanyType,
        isFreelanceType,
        updateNameField,
        updateClientType,
        clientFields,
        getVisibleFields,
        groupFields
    }
}