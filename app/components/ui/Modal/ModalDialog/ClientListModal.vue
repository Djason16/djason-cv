<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewClients')" @close="close">
        <div class="client-list-modal">
            <!-- Search input -->
            <div class="search-bar">
                <input v-model="search" id="client-search" type="text"
                    :placeholder="$lang.getTranslation('searchClients')" class="text-small" autocomplete="off"
                    :title="$lang.getTranslation('searchClients')" />
            </div>

            <!-- Editable table -->
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
import { computed, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useClients } from '~/composables/useClients'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Composable for client state and helpers
const { $lang, clients, search, fetchClients, filteredClients, displayClientName, displayValue, updateNameField, updateClientType } = useClients()

// Table column definitions with inline formatters and editable options
const columns = computed(() => [
    { key: 'name', label: $lang.getTranslation('name'), formatter: c => displayClientName(c), editValue: c => displayClientName(c).replace('-', ''), autocomplete: 'name', autocapitalize: 'words' },
    { key: 'email', label: $lang.getTranslation('email'), formatter: c => c.email || '-', autocomplete: 'email' },
    { key: 'phone', label: $lang.getTranslation('phone'), formatter: c => c.phone || '-', autocomplete: 'tel' },
    { key: 'address', label: $lang.getTranslation('address'), autocomplete: 'street-address' },
    { key: 'city', label: $lang.getTranslation('city'), autocomplete: 'address-level2' },
    { key: 'postal_code', label: $lang.getTranslation('postalCode'), autocomplete: 'postal-code' },
    {
        key: 'type', label: $lang.getTranslation('type'), type: 'select',
        formatter: c => $lang.getTranslation(c.type || '-'),
        editValue: c => c.type,
        options: [
            { value: 'individual', label: $lang.getTranslation('individual') },
            { value: 'company', label: $lang.getTranslation('company') },
            { value: 'freelance', label: $lang.getTranslation('freelance') }
        ]
    },
    { key: 'siret', label: $lang.getTranslation('siret'), formatter: c => displayValue(c.siret) }
])

// Fetch clients when modal opens
watch(() => props.show, val => val && fetchClients())

// Handle inline table updates
const handleUpdate = async ({ item, field, value }) => {
    if (field === 'name') updateNameField(item, value)
    else if (field === 'type') updateClientType(item, value)
    else item[field] = value

    try {
        await $fetch('/api/clients/edit-client', { method: 'PUT', body: { ...item, firstname: item.firstname || null, lastname: item.lastname || null, company_name: item.company_name || null, siret: item.siret || null } })
    } catch (e) { console.error('Failed updating client', e) }
}

// Delete client with confirmation
const deleteClient = async c => {
    if (!confirm($lang.getTranslation('deleteClientConfirm', { name: displayClientName(c) }))) return
    try {
        const res = await $fetch('/api/clients/delete-client', { method: 'POST', body: { id: c.id } })
        if (res.success) clients.value = clients.value.filter(cli => cli.id !== c.id)
        else alert(res.error || $lang.getTranslation('deleteClientFailed') || 'Failed to delete client')
    } catch (e) {
        console.error(e)
        alert($lang.getTranslation('deleteClientFailed') || 'Failed to delete client')
    }
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