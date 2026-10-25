<template>
    <!-- Late payment interest rates: inline edit and delete -->
    <TableModal :show="show" :title="t('viewInterestRates')" max-width="1200px" min-width="50vw"
        v-model:search="search" :search-placeholder="t('searchInterestRates')" @close="close">
        <EditableTable :items="filteredInterestRates" :columns="columns"
            :actions-label="t('actions')" :delete-label="t('delete')"
            :empty-message="t('noInterestRatesFound')" @update="handleUpdate"
            @delete="deleteInterestRate" />
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useInterestRates } from '@/composables/useInterestRates.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const lang = useLang()
const { getTranslation: t } = lang
const { search, fetchInterestRates, updateInterestRate, deleteInterestRate: removeInterestRate, filteredInterestRates, formatRate, formatDate, isActiveRate } = useInterestRates()

// Table structure with formatters and editable definitions
const columns = computed(() => [
    {
        key: 'type', label: lang.getTranslation('type') || 'Type', type: 'select',
        formatter: r => r.type === 'professional' ? (lang.getTranslation('professional') || 'Professionnel') : (lang.getTranslation('individual') || 'Particulier'),
        editValue: r => r.type,
        options: [
            { value: 'professional', label: lang.getTranslation('professional') || 'Professionnel' },
            { value: 'individual', label: lang.getTranslation('individual') || 'Particulier' }
        ]
    },
    { key: 'rate', label: lang.getTranslation('rate'), formatter: r => formatRate(r.rate), editValue: r => r.rate, inputType: 'number', step: '0.0001', min: '0', max: '1', autocomplete: 'off' },
    { key: 'valid_from', label: lang.getTranslation('validFrom'), formatter: r => formatDate(r.valid_from), editValue: r => r.valid_from, inputType: 'date', autocomplete: 'off' },
    { key: 'valid_until', label: lang.getTranslation('validUntil'), formatter: r => formatDate(r.valid_until), editValue: r => r.valid_until, inputType: 'date', autocomplete: 'off' },
    { key: 'status', label: lang.getTranslation('status'), formatter: r => isActiveRate(r) ? lang.getTranslation('active') : lang.getTranslation('inactive'), disabled: true }
])

// Loads data when modal opens
watch(() => props.show, v => v && fetchInterestRates())

// Updates interest rate in backend
const handleUpdate = async ({ item, field, value }) => {
    item[field] = value
    const res = await updateInterestRate(item)
    if (!res.success) console.error('Failed updating interest rate', res.error)
}

// Deletes interest rate with user confirmation
const deleteInterestRate = async r => {
    if (!confirm(lang.getTranslation('deleteInterestRateConfirm', { rate: formatRate(r.rate) }))) return
    const res = await removeInterestRate(r.id)
    if (!res.success) alert(lang.getTranslation('deleteInterestRateFailed'))
}

// Close modal
const close = () => emit('close')
</script>
