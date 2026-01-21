<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewCalendar')" @close="close">
        <div class="calendar-modal">
            <!-- Editable table showing timezone and daily schedule -->
            <EditableTable :items="formattedItems" :columns="columns" :show-actions="false" :item-key="'_rowId'"
                :empty-message="$lang.getTranslation('noSchedule')" @update="handleUpdate" />
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
import { getGMTOffset, useCalendar } from '~/composables/useCalendar'
import timezones from '~/utils/timezones.js'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang, settings, fetchSettings, updateSettings } = useCalendar()

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Format timezone label with translation and GMT offset
const formatTimezoneLabel = tz => `${$lang.getTranslation(tz)} (${getGMTOffset(tz)})`

// Compose table rows: first timezone, then each day
const formattedItems = computed(() => {
    if (!settings.value) return []

    const rows = [{
        _rowId: 'timezone', id: settings.value.id, field: $lang.getTranslation('timezone'),
        value: settings.value.timezone, displayValue: formatTimezoneLabel(settings.value.timezone),
        status: '-', start: '-', end: '-', _type: 'timezone'
    }]

    daysOfWeek.forEach((day, i) => {
        const sched = settings.value.schedule?.[String(i)]
        rows.push({
            _rowId: `day_${i}`,
            id: settings.value.id,
            field: $lang.getTranslation(day),
            value: '-',
            status: sched ? 'yes' : 'no',
            start: sched?.start || '09:00',
            end: sched?.end || '18:00',
            _type: 'day',
            _dayIndex: i
        })
    })
    return rows
})

// Table column definitions with dynamic enable/disable and formatting
const columns = computed(() => [
    { key: 'field', label: $lang.getTranslation('field'), disabled: true, formatter: item => item.field },
    {
        key: 'value', label: $lang.getTranslation('value'), type: 'select',
        disabled: item => item._type !== 'timezone',
        options: timezones.map(tz => ({ value: tz, label: formatTimezoneLabel(tz) })),
        editValue: item => item.value,
        formatter: item => item._type === 'timezone' ? item.displayValue : item.value
    },
    {
        key: 'status', label: $lang.getTranslation('status'), type: 'select',
        disabled: item => item._type !== 'day',
        options: [{ value: 'yes', label: $lang.getTranslation('yes') }, { value: 'no', label: $lang.getTranslation('no') }],
        editValue: item => item.status,
        formatter: item => item._type === 'day' ? ($lang.getTranslation(item.status === 'yes' ? 'yes' : 'no')) : item.status
    },
    {
        key: 'start', label: $lang.getTranslation('start'), inputType: 'time',
        disabled: item => item._type !== 'day' || item.status === 'no',
        editValue: item => item.start,
        formatter: item => item._type === 'day' && item.status === 'yes' ? item.start : '-'
    },
    {
        key: 'end', label: $lang.getTranslation('end'), inputType: 'time',
        disabled: item => item._type !== 'day' || item.status === 'no',
        editValue: item => item.end,
        formatter: item => item._type === 'day' && item.status === 'yes' ? item.end : '-'
    }
])

// Handle updates from the table: timezone or day fields
const handleUpdate = async ({ item, field, value }) => {
    if (!item?.id) return console.error('No item ID')
    const payload = {}

    if (item._type === 'timezone' && field === 'value') payload.timezone = value
    else if (item._type === 'day' && item._dayIndex !== undefined) {
        const dayStr = String(item._dayIndex)
        payload.schedule = { ...settings.value.schedule }

        if (field === 'status') {
            value === 'yes' ? payload.schedule[dayStr] = { start: item.start || '09:00', end: item.end || '18:00' } : delete payload.schedule[dayStr]
        } else if (field === 'start' || field === 'end') {
            if (item.status === 'yes') payload.schedule[dayStr] = { ...payload.schedule[dayStr], [field]: value }
            else return console.warn(`Attempted to update ${field} on inactive day ${dayStr}`)
        }
    }

    try { await updateSettings(item.id, payload) } catch (err) { console.error('Update failed:', err) }
}

// Fetch settings when modal opens
watch(() => props.show, val => val && fetchSettings())
const close = () => emit('close')
</script>

<style scoped>
.calendar-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
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