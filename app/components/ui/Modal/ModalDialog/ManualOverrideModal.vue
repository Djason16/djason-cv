<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewManualOverride')" @close="close">
        <div class="manual-override-modal">
            <!-- Table showing the single override item -->
            <EditableTable :items="overrideItems" :columns="columns" :show-actions="false"
                :empty-message="$lang.getTranslation('noOverride')" @update="handleOverrideUpdate" />
            <div class="modal-footer">
                <HeroButton :label="$lang.getTranslation('close')" iconClass="fas fa-times" @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import ModalDialog from '../ModalDialog.vue'
import { useUnavailability } from '~/composables/useUnavailability'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Composable for translations and override management
const { $lang, override, fetchOverride, toggleOverride, translateStatus } = useUnavailability()

// Wrap override in an array for EditableTable
const overrideItems = computed(() => override.value ? [{
    id: override.value.id,
    enabled: override.value.enabled,
    status: override.value.status || 'unavailable'
}] : [])

// Column definitions with inline select options and translation
const columns = computed(() => [
    {
        key: 'enabled',
        label: $lang.getTranslation('enabled'),
        type: 'select',
        formatter: m => m.enabled ? $lang.getTranslation('yes') : $lang.getTranslation('no'),
        editValue: m => m.enabled,
        disabled: false,
        options: [{ value: true, label: $lang.getTranslation('yes') }, { value: false, label: $lang.getTranslation('no') }]
    },
    {
        key: 'status',
        label: $lang.getTranslation('status'),
        type: 'select',
        formatter: m => translateStatus(m.status),
        editValue: m => m.status,
        disabled: false,
        options: ['available', 'busy', 'unavailable'].map(s => ({ value: s, label: $lang.getTranslation(s) }))
    }
])

// Update override when table cell changes
const handleOverrideUpdate = async ({ item, field, value }) => {
    const enabled = field === 'enabled' ? value : true
    const status = field === 'status' ? value : (enabled ? override.value.status : 'unavailable')
    override.value = { ...override.value, enabled, status }
    await toggleOverride(enabled, status)
}

// Fetch latest override when modal opens
watch(() => props.show, val => val && fetchOverride())

const close = () => emit('close')
</script>

<style scoped>
.manual-override-modal {
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

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>