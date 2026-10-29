<template>
    <!-- Clients: inline edit and delete -->
    <TableModal :show="show" :title="t('viewClients')"
        v-model:search="search" :search-placeholder="t('searchClients')" @close="close">
        <EditableTable :items="filteredClients" :columns="columns" :actions-label="t('actions')"
            :delete-label="t('delete')" :empty-message="t('noClientsFound')"
            @update="handleUpdate" @delete="deleteClient" />
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useClients } from '@/composables/useClients.js'
import { getClientTypeOptions } from '@/utils/clientTypes.js'
import { showConfirm, showResult } from '@/utils/dialog.js'
import { displayValue } from '@/utils/display.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Composable for client state and helpers
const lang = useLang()
const { getTranslation: t } = lang
const { search, fetchClients, updateClient, deleteClient: removeClient, filteredClients, displayClientName, displayActive, updateNameField, updateClientType } = useClients()

// Builds select options from utility (auto-includes association)
const typeOptions = getClientTypeOptions().map(opt => ({ value: opt.value, label: lang.getTranslation(opt.labelKey) }))

// Table column definitions with inline formatters and editable options
const columns = computed(() => [
    { key: 'name', label: lang.getTranslation('name'), formatter: c => displayClientName(c), editValue: c => displayClientName(c).replace('-', ''), autocomplete: 'name', autocapitalize: 'words' },
    { key: 'email', label: lang.getTranslation('email'), formatter: c => c.email || '-', autocomplete: 'email' },
    { key: 'phone', label: lang.getTranslation('phone'), formatter: c => c.phone || '-', autocomplete: 'tel' },
    { key: 'address', label: lang.getTranslation('address'), autocomplete: 'street-address' },
    { key: 'city', label: lang.getTranslation('city'), autocomplete: 'address-level2' },
    { key: 'postal_code', label: lang.getTranslation('postalCode'), autocomplete: 'postal-code' },
    {
        key: 'type', label: lang.getTranslation('type'), type: 'select',
        formatter: c => lang.getTranslation(c.type || '-'),
        editValue: c => c.type,
        options: typeOptions
    },
    { key: 'siret', label: lang.getTranslation('siret'), formatter: c => displayValue(c.siret) },
    {
        key: 'active', label: lang.getTranslation('active'), type: 'select',
        formatter: c => lang.getTranslation(displayActive(c) ? 'active' : 'inactive'),
        editValue: c => displayActive(c) ? '1' : '0',
        options: [
            { value: '1', label: lang.getTranslation('active') },
            { value: '0', label: lang.getTranslation('inactive') }
        ]
    }
])

// Fetches clients when modal opens
watch(() => props.show, val => val && fetchClients())

// Handles inline table updates — converts empty strings to null so displayValue shows '-'
const handleUpdate = async ({ item, field, value }) => {
    if (field === 'name') updateNameField(item, value)
    else if (field === 'type') updateClientType(item, value)
    else if (field === 'active') item.active = value === '1' ? 1 : 0
    else item[field] = value === '' ? null : value

    const res = await updateClient(item)
    await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
}

// Deletes client with confirmation
const deleteClient = async c => {
    if (!(await showConfirm(lang.getTranslation('deleteClientConfirm', { name: displayClientName(c) }), { okLabel: lang.getTranslation('dialogDelete') }))) return
    const res = await removeClient(c.id)
    await showResult(res, lang.getTranslation('deleteSuccess'), lang.getTranslation('deleteClientFailed'))
}

const close = () => emit('close')
</script>
