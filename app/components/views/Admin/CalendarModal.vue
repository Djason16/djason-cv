<template>
    <!-- Weekly schedule and timezone, sending of the agenda to the clients -->
    <TableModal :show="show" :title="t('viewCalendar')" max-width="1200px" @close="close">
        <EditableTable :items="formattedItems" :columns="columns" :show-actions="false" :item-key="'_rowId'"
            :empty-message="t('calendarNoSchedule')" @update="handleUpdate" />

        <MessageBox :message="translatedMessage" margin="0" />

        <template #actions>
            <HeroButton :label="sending ? t('sending') : t('sendAgenda')"
                iconClass="fas fa-paper-plane" :disabled="sending" @click="handleSendAgenda" />
        </template>
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { getGMTOffset, useCalendar } from '@/composables/useCalendar.js'
import { useMessage } from '@/composables/useMessage.js'
import timezones from '@/utils/timezones.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const lang = useLang()
const { getTranslation: t } = lang
const { settings, fetchSettings, updateSettings, sendAgenda } = useCalendar()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const sending = ref(false)

// Translated name of the timezone and its GMT offset (plugins/translations/pages/admin/timezones*.js)
const formatTimezoneLabel = tz => `${lang.getTranslation(tz)} (${getGMTOffset(tz)})`

// Composes table rows: first timezone, then each day
const formattedItems = computed(() => {
    if (!settings.value) return []

    const rows = [{
        _rowId: 'timezone', id: settings.value.id, field: lang.getTranslation('timezone'),
        value: settings.value.timezone, displayValue: formatTimezoneLabel(settings.value.timezone),
        status: '-', start: '-', end: '-', _type: 'timezone'
    }]

    daysOfWeek.forEach((day, i) => {
        const sched = settings.value.schedule?.[String(i)]
        rows.push({
            _rowId: `day_${i}`,
            id: settings.value.id,
            field: lang.getTranslation(day),
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
    { key: 'field', label: lang.getTranslation('field'), disabled: true, formatter: item => item.field },
    {
        key: 'value', label: lang.getTranslation('value'), type: 'select',
        disabled: item => item._type !== 'timezone',
        options: timezones.map(tz => ({ value: tz, label: formatTimezoneLabel(tz) })),
        editValue: item => item.value,
        formatter: item => item._type === 'timezone' ? item.displayValue : item.value
    },
    {
        key: 'status', label: lang.getTranslation('status'), type: 'select',
        disabled: item => item._type !== 'day',
        options: [{ value: 'yes', label: lang.getTranslation('yes') }, { value: 'no', label: lang.getTranslation('no') }],
        editValue: item => item.status,
        formatter: item => item._type === 'day' ? (lang.getTranslation(item.status === 'yes' ? 'yes' : 'no')) : item.status
    },
    {
        key: 'start', label: lang.getTranslation('start'), inputType: 'time',
        disabled: item => item._type !== 'day' || item.status === 'no',
        editValue: item => item.start,
        formatter: item => item._type === 'day' && item.status === 'yes' ? item.start : '-'
    },
    {
        key: 'end', label: lang.getTranslation('end'), inputType: 'time',
        disabled: item => item._type !== 'day' || item.status === 'no',
        editValue: item => item.end,
        formatter: item => item._type === 'day' && item.status === 'yes' ? item.end : '-'
    }
])

// Handles updates from the table: timezone or day fields
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

// Picks the right confirmation message key depending on override status vs. dated unavailability
const resolveSentMessageKey = res => {
    if (res.hasOverride && res.availabilityStatus === 'unavailable') return 'agendaSentOverrideUnavailable'
    if (res.hasOverride && res.availabilityStatus === 'busy') return 'agendaSentOverrideBusy'
    if (res.isCurrentlyUnavailable) return 'agendaSentUnavailable'
    return 'agendaSent'
}

// Sends the current agenda to all active clients
const handleSendAgenda = async () => {
    clearMessage()
    sending.value = true
    try {
        const res = await sendAgenda(lang.current.value)
        if (res.sent === 0 && res.total === 0)
            showMessage('error', 'noActiveClients', 0)
        else {
            const key = resolveSentMessageKey(res)
            showMessage('success', lang.getTranslation(key, { count: res.sent }), 3000)
        }
    } catch (err) {
        showMessage('error', err.data?.message || err.message || 'errorSendingAgenda', 0)
    } finally {
        sending.value = false
    }
}

// Fetches settings when modal opens
watch(() => props.show, val => val && fetchSettings())
const close = () => { clearMessage(); emit('close') }
</script>
