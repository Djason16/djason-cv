<template>
    <!-- Manual availability status -->
    <TableModal :show="show" :title="t('viewManualOverride')" @close="close">
        <EditableTable :items="overrideItems" :columns="columns" :show-actions="false"
            :empty-message="t('noOverride')" @update="handleOverrideUpdate" />
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
const { override, fetchOverride, toggleOverride } = useUnavailability()

// Wraps override in an array for EditableTable
const overrideItems = computed(() => override.value ? [{
    id: override.value.id,
    enabled: override.value.enabled,
    status: override.value.status || 'unavailable'
}] : [])

// Column definitions with inline select options and translation
const columns = computed(() => [
    {
        key: 'enabled',
        label: lang.getTranslation('enabled'),
        type: 'select',
        formatter: m => m.enabled ? lang.getTranslation('yes') : lang.getTranslation('no'),
        editValue: m => m.enabled,
        disabled: false,
        options: [{ value: true, label: lang.getTranslation('yes') }, { value: false, label: lang.getTranslation('no') }]
    },
    {
        key: 'status',
        label: lang.getTranslation('status'),
        type: 'select',
        formatter: m => t(m.status),
        editValue: m => m.status,
        disabled: false,
        options: ['available', 'busy', 'unavailable'].map(s => ({ value: s, label: lang.getTranslation(s) }))
    }
])

// Updates override when table cell changes
const handleOverrideUpdate = async ({ item, field, value }) => {
    const enabled = field === 'enabled' ? value : true
    const status = field === 'status' ? value : (enabled ? override.value.status : 'unavailable')
    override.value = { ...override.value, enabled, status }
    const res = await toggleOverride(enabled, status)
    await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
}

// Fetches latest override when modal opens
watch(() => props.show, val => val && fetchOverride())

const close = () => emit('close')
</script>
