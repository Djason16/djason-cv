<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewUnavailability')" @close="close">
        <div class="unavailability-modal">
            <!-- Editable table for unavailability periods -->
            <EditableTable :items="unavailabilityPeriods" :columns="columns" :show-actions="false"
                :empty-message="$lang.getTranslation('noUnavailabilityPeriods')" @update="handlePeriodUpdate" />

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

// Use composable for fetching and updating unavailability periods
const { $lang, periods: unavailabilityPeriods, fetchPeriods, updatePeriod } = useUnavailability()

// Column definitions with inline date formatting
const columns = computed(() => ['startDate', 'endDate'].map(key => ({
    key,
    label: $lang.getTranslation(key),
    inputType: 'date',
    formatter: m => m[key] ? new Date(m[key]).toLocaleDateString() : '-',
    editValue: m => m[key],
    disabled: false
})))

// Update a period when edited
const handlePeriodUpdate = async ({ item, field, value }) =>
    await updatePeriod(item.id, { ...item, [field]: value })

// Fetch data when modal opens
watch(() => props.show, val => val && fetchPeriods())
const close = () => emit('close')
</script>

<style scoped>
.unavailability-modal {
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