<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewClients')" @close="close">
        <div class="client-list-modal">
            <!-- Search input -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchClients')"
                    class="text-small" />
            </div>

            <!-- Editable table for clients -->
            <EditableTable :items="filteredClients" :columns="columns" :actions-label="$lang.getTranslation('actions')"
                :delete-label="$lang.getTranslation('delete')" :empty-message="$lang.getTranslation('noClientsFound')"
                @update="handleUpdate" @delete="deleteClient" />

            <!-- Footer with close button -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('close')" iconClass="fas fa-times"
                    @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed, ref, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()
const { processText } = useTextEscape($lang)

const clients = ref([])
const search = ref('')
const loading = ref(false)

// Column definitions with inline formatting, editing, and options
const columns = computed(() => [
    {
        key: 'name', label: $lang.getTranslation('name'),
        formatter: c => c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-',
        editValue: c => c.company_name || [c.firstname, c.lastname].filter(Boolean).join('') || '',
        autocomplete: 'name', autocapitalize: 'words'
    },
    { key: 'email', label: $lang.getTranslation('email'), formatter: c => processText(c.email || '-'), processHtml: true, autocomplete: 'email' },
    { key: 'phone', label: $lang.getTranslation('phone'), formatter: c => processText(c.phone || '-'), processHtml: true, autocomplete: 'tel' },
    { key: 'address', label: $lang.getTranslation('address'), autocomplete: 'street-address' },
    { key: 'city', label: $lang.getTranslation('city'), autocomplete: 'address-level2' },
    { key: 'postal_code', label: $lang.getTranslation('postalCode'), autocomplete: 'postal-code' },
    {
        key: 'type', label: $lang.getTranslation('type'), type: 'select',
        formatter: c => $lang.getTranslation(c.type || '-'),
        options: [
            { value: 'individual', label: $lang.getTranslation('individual') },
            { value: 'company', label: $lang.getTranslation('company') },
            { value: 'freelance', label: $lang.getTranslation('freelance') }
        ]
    },
    {
        key: 'siret', label: $lang.getTranslation('siret'),
        disabled: c => c.type === 'individual',
        formatter: c => c.type === 'individual' ? '-' : c.siret || '-'
    }
])

// Fetch clients when modal opens
const fetchClients = async () => {
    loading.value = true
    try { const res = await $fetch('/api/clients/list'); if (res.success) clients.value = res.clients.rows }
    catch (e) { console.error(e) }
    finally { loading.value = false }
}

watch(() => props.show, val => val && fetchClients())

// Filter clients by search input across multiple fields
const filteredClients = computed(() => {
    const q = search.value.toLowerCase()
    return clients.value.filter(c =>
        [c.firstname, c.lastname, c.company_name, c.email, c.address, c.city, c.postal_code]
            .filter(Boolean).some(v => v.toLowerCase().includes(q))
    )
})

// Handle inline table updates with dynamic field mapping
const handleUpdate = async ({ item, field, value }) => {
    if (field === 'name') {
        if (!item.firstname && !item.lastname) item.company_name = value
        else { const [first, ...rest] = value.split(' '); item.firstname = first; item.lastname = rest.join(' ') }
    } else if (field === 'type') {
        const old = item.type; item.type = value
        if (['individual', 'freelance'].includes(old) && value === 'company') {
            item.company_name = [item.firstname, item.lastname].filter(Boolean).join(' ') || null
            item.firstname = item.lastname = null
        } else if (old === 'company' && ['individual', 'freelance'].includes(value)) {
            if (item.company_name) { const [first, ...rest] = item.company_name.split(' '); item.firstname = first; item.lastname = rest.join(' ') }
            item.company_name = null
            if (value === 'individual') item.siret = null
        }
    } else item[field] = value

    try { await $fetch('/api/clients/edit-client', { method: 'PUT', body: { ...item, firstname: item.firstname || null, lastname: item.lastname || null, company_name: item.company_name || null, siret: item.siret || null } }) }
    catch (e) { console.error('Failed updating client', e) }
}

// Delete a client with confirmation
const deleteClient = async c => {
    const displayName = c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-'
    if (!confirm($lang.getTranslation('deleteClientConfirm', { name: displayName }))) return
    try {
        const res = await $fetch('/api/clients/delete-client', { method: 'POST', body: { id: c.id } })
        if (res.success) clients.value = clients.value.filter(cli => cli.id !== c.id)
        else alert(res.error || $lang.getTranslation('deleteClientFailed') || 'Failed to delete client')
    } catch (e) { console.error(e); alert($lang.getTranslation('deleteClientFailed') || 'Failed to delete client') }
}

const close = () => emit('close')
</script>

<style scoped>
.client-list-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1920px;
    min-width: 60vw;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark);
    box-sizing: border-box;
}

.search-bar {
    display: flex;
    justify-content: flex-end;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>