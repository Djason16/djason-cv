<template>
    <!-- Clients: inline edit and delete -->
    <TableModal :show="show" :title="t('viewClients')"
        v-model:search="search" :search-placeholder="t('searchClients')" @close="close">
        <EditableTable :items="filteredClients" :columns="columns" :actions-label="t('actions')"
            :delete-label="t('delete')" :empty-message="t('noClientsFound')" :per-page="8"
            @update="handleUpdate" @delete="deleteClient" />
        <!-- New: the form opens, and this list comes back when it closes -->
        <template #actions>
            <HeroButton primary iconClass="fas fa-plus" :label="t('adminCreateClients')" @click="emit('open', 'client')" />
        </template>
    </TableModal>
</template>

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useClients } from '@/composables/useClients'
import { getClientTypeOptions } from '@/utils/clientTypes'
import { showConfirm, showResult } from '@/utils/dialog'
import { displayValue } from '@/utils/display'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'open'])

// Composable for client state and helpers
const lang = useLang()
const { getTranslation: t } = lang
const { search, fetchClients, updateClient, deleteClient: removeClient, filteredClients, displayClientName, displayActive, updateNameField, updateClientType } = useClients()

// Builds select options from utility (auto-includes association)
const typeOptions = getClientTypeOptions().map(opt => ({ value: opt.value, label: lang.getTranslation(opt.labelKey) }))

// Table columns: name, contact, type and state on the row; the address and the SIRET under it (its arrow).
// On a phone: the name, the email and the phone alone, the type and the state as two small tags (mobile)
const columns = computed(() => [
    { key: 'name', label: lang.getTranslation('name'), formatter: (c: Record<string, any>) => displayClientName(c), editValue: (c: Record<string, any>) => displayClientName(c).replace('-', ''), autocomplete: 'name', autocapitalize: 'words' },
    { key: 'email', label: lang.getTranslation('email'), formatter: (c: Record<string, any>) => c.email || '-', autocomplete: 'email', mobile: 'plain' },
    { key: 'phone', label: lang.getTranslation('phone'), formatter: (c: Record<string, any>) => c.phone || '-', autocomplete: 'tel', mobile: 'plain' },
    { key: 'address', label: lang.getTranslation('address'), autocomplete: 'street-address', detail: true },
    { key: 'city', label: lang.getTranslation('city'), autocomplete: 'address-level2', detail: true },
    { key: 'postal_code', label: lang.getTranslation('postalCode'), autocomplete: 'postal-code', detail: true },
    {
        key: 'type', label: lang.getTranslation('type'), type: 'select', mobile: 'tag',
        formatter: (c: Record<string, any>) => lang.getTranslation(c.type || '-'),
        editValue: (c: Record<string, any>) => c.type,
        options: typeOptions
    },
    { key: 'siret', label: lang.getTranslation('siret'), formatter: (c: Record<string, any>) => displayValue(c.siret), detail: true },
    {
        key: 'active', label: lang.getTranslation('active'), type: 'select', mobile: 'tag',
        formatter: (c: Record<string, any>) => lang.getTranslation(displayActive(c) ? 'active' : 'inactive'),
        editValue: (c: Record<string, any>) => displayActive(c) ? '1' : '0',
        options: [
            { value: '1', label: lang.getTranslation('active') },
            { value: '0', label: lang.getTranslation('inactive') }
        ]
    }
])

// Fetches clients when modal opens
watch(() => props.show, val => val && fetchClients())

// Handles inline table updates — converts empty strings to null so displayValue shows '-'
const handleUpdate = async ({ item, field, value }: { item: Record<string, any>, field: string, value: any }) => {
    if (field === 'name') updateNameField(item, value)
    else if (field === 'type') updateClientType(item, value)
    else if (field === 'active') item.active = value === '1' ? 1 : 0
    else item[field] = value === '' ? null : value

    const res = await updateClient(item)
    await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
}

// Deletes client with confirmation
const deleteClient = async (c: Record<string, any>) => {
    if (!(await showConfirm(lang.getTranslation('deleteClientConfirm', { name: displayClientName(c) }), { okLabel: lang.getTranslation('dialogDelete') }))) return
    const res = await removeClient(c.id)
    await showResult(res, lang.getTranslation('deleteSuccess'), lang.getTranslation('deleteClientFailed'))
}

const close = () => emit('close')
</script>
