import { computed, ref } from 'vue'
import { useAdminDataStore } from '@/stores/adminData'
import { api } from '@/utils/api'
import { isIndividualType, isProfessionalType } from '@/utils/clientTypes'

// Clients of the admin page: list, search, create / update / delete (GET / POST /api/clients, PUT / DELETE /api/clients/{id}) and form fields
export function useClients() {
    // The list is shared by every modal (stores/adminData.js)
    const adminData = useAdminDataStore()
    const search = ref('')

    // Name of a client: company name, or first and last name
    const displayClientName = (c: Record<string, any>) => c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-'
    // A client is active unless turned off
    const displayActive = (c: Record<string, any>) => !(c.active === 0 || c.active === false)

    const fetchClients = () => adminData.load('clients')

    // Creates a client: the list is loaded again the next time it is shown
    const createClient = async (data: Record<string, any>) => {
        const res = await api.post('/clients', data)
        if (res.success) adminData.invalidate('clients')
        return res
    }

    // Saves every field of a client (empty optional fields stored as null); the missions show its name, so they are loaded again
    const updateClient = async (item: Record<string, any>) => {
        const res = await api.put(`/clients/${item.id}`, {
            ...item,
            firstname: item.firstname || null,
            lastname: item.lastname || null,
            company_name: item.company_name || null,
            siret: item.siret || null
        })
        if (res.success) adminData.invalidate('missions')
        return res
    }

    // Deletes a client (its missions are deleted with it by the database)
    const deleteClient = async (id: string) => {
        const res = await api.delete(`/clients/${id}`)
        if (res.success) {
            adminData.remove('clients', id)
            adminData.invalidate('missions')
        }
        return res
    }

    // Clients matching the search bar
    const filteredClients = computed(() => {
        const q = search.value.toLowerCase()
        return adminData.clients.filter(c =>
            [c.firstname, c.lastname, c.company_name, c.email, c.address, c.city, c.postal_code]
                .filter(Boolean)
                .some(v => v.toLowerCase().includes(q))
        )
    })

    // Edited name: company name when the client has no first / last name, otherwise first word = first name, the rest = last name
    const updateNameField = (item: Record<string, any>, value: unknown) => {
        if (!item.firstname && !item.lastname) item.company_name = value
        else { const [first, ...rest] = String(value).split(' '); item.firstname = first; item.lastname = rest.join(' ') }
    }

    // Changing between individual and professional moves the name: first + last name <-> company name
    const updateClientType = (item: Record<string, any>, newType: string) => {
        const oldType = item.type
        item.type = newType

        if (isProfessionalType(oldType) && isIndividualType(newType)) {
            if (item.company_name) { const [first, ...rest] = item.company_name.split(' '); item.firstname = first; item.lastname = rest.join(' ') }
            item.company_name = null
        } else if (isIndividualType(oldType) && isProfessionalType(newType)) {
            item.company_name = [item.firstname, item.lastname].filter(Boolean).join(' ') || null
            item.firstname = item.lastname = null
        }
    }

    // Fields of the creation form
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

    // Professional clients have a company name, individuals a first and last name
    const getVisibleFields = (type: string) => {
        if (isProfessionalType(type)) return clientFields.filter(f => !['firstname', 'lastname'].includes(f.id))
        return clientFields.filter(f => f.id !== 'company_name')
    }

    // Fields grouped into the rows of the form
    const groupFields = (visibleFields: Record<string, any>[]) => {
        const groups: Record<string, any>[][] = []
        // Puts the given fields side by side on one row
        const addGroup = (ids: string[]) => { const g = visibleFields.filter(f => ids.includes(f.id)); if (g.length) groups.push(g) }

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
        search,
        fetchClients,
        createClient,
        updateClient,
        deleteClient,
        filteredClients,
        displayClientName,
        displayActive,
        updateNameField,
        updateClientType,
        getVisibleFields,
        groupFields
    }
}