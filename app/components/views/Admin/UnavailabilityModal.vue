<template>
    <!-- Unavailability periods -->
    <TableModal :show="show" :title="t('viewUnavailability')" @close="close">
        <EditableTable :items="unavailabilityPeriods" :columns="columns" :show-actions="false"
            :empty-message="t('noUnavailabilityPeriods')" @update="handlePeriodUpdate" />
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import { useUnavailability } from '@/composables/useUnavailability.js'
import { showResult } from '@/utils/dialog.js'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const lang = useLang()
const { getTranslation: t } = lang
const { periods: unavailabilityPeriods, fetchPeriods, updatePeriod } = useUnavailability()

// Column definitions with inline date formatting
const columns = computed(() => ['startDate', 'endDate'].map(key => ({
    key,
    label: lang.getTranslation(key),
    inputType: 'date',
    formatter: m => m[key] ? new Date(m[key]).toLocaleDateString() : '-',
    editValue: m => m[key],
    disabled: false
})))

// Updates a period when edited
const handlePeriodUpdate = async ({ item, field, value }) => {
    const res = await updatePeriod(item.id, { ...item, [field]: value })
    await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
}

// Fetches data when modal opens
watch(() => props.show, val => val && fetchPeriods())
const close = () => emit('close')
</script>
