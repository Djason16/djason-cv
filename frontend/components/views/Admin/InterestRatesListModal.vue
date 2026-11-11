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

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useInterestRates } from '@/composables/useInterestRates'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import { showConfirm, showResult } from '@/utils/dialog'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const lang = useLang()
const { getTranslation: t } = lang
const { search, fetchInterestRates, updateInterestRate, deleteInterestRate: removeInterestRate, filteredInterestRates, formatRate, formatDate, isActiveRate } = useInterestRates()

// Table structure with formatters and editable definitions
const columns = computed(() => [
    {
        key: 'type', label: lang.getTranslation('type'), type: 'select',
        formatter: (r: Record<string, any>) => r.type === 'professional' ? (lang.getTranslation('professional')) : (lang.getTranslation('individual')),
        editValue: (r: Record<string, any>) => r.type,
        options: [
            { value: 'professional', label: lang.getTranslation('professional') },
            { value: 'individual', label: lang.getTranslation('individual') }
        ]
    },
    { key: 'rate', label: lang.getTranslation('rate'), mobile: 'plain', formatter: (r: Record<string, any>) => formatRate(r.rate), editValue: (r: Record<string, any>) => r.rate, inputType: 'number', step: '0.0001', min: '0', max: '1', autocomplete: 'off' },
    { key: 'valid_from', label: lang.getTranslation('validFrom'), shortLabel: lang.getTranslation('rateFromShort'), formatter: (r: Record<string, any>) => formatDate(r.valid_from), editValue: (r: Record<string, any>) => r.valid_from, inputType: 'date', autocomplete: 'off' },
    { key: 'valid_until', label: lang.getTranslation('validUntil'), shortLabel: lang.getTranslation('rateUntilShort'), formatter: (r: Record<string, any>) => formatDate(r.valid_until), editValue: (r: Record<string, any>) => r.valid_until, inputType: 'date', autocomplete: 'off' },
    { key: 'status', label: lang.getTranslation('status'), mobile: 'tag', formatter: (r: Record<string, any>) => isActiveRate(r) ? lang.getTranslation('active') : lang.getTranslation('inactive'), disabled: true }
])

// Loads data when modal opens
watch(() => props.show, v => v && fetchInterestRates())

// Updates interest rate in backend
const handleUpdate = async ({ item, field, value }: { item: Record<string, any>, field: string, value: any }) => {
    item[field] = value
    const res = await updateInterestRate(item)
    await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
}

// Deletes interest rate with user confirmation
const deleteInterestRate = async (r: Record<string, any>) => {
    if (!(await showConfirm(lang.getTranslation('deleteInterestRateConfirm', { rate: formatRate(r.rate) }), { okLabel: lang.getTranslation('dialogDelete') }))) return
    const res = await removeInterestRate(r.id)
    await showResult(res, lang.getTranslation('deleteSuccess'), lang.getTranslation('deleteInterestRateFailed'))
}

// Close modal
const close = () => emit('close')
</script>
