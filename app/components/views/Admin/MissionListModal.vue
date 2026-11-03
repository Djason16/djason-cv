<template>
    <!-- Missions: inline edit (pricing mode, TJM, duration...) and delete -->
    <TableModal :show="show" :title="t('viewMissions')"
        v-model:search="search" :search-placeholder="t('searchMissions')" @close="close">
        <EditableTable :items="filteredMissions" :columns="columns" :actions-label="t('actions')"
            :delete-label="t('delete')" :empty-message="t('noMissionsFound')" :per-page="8"
            @update="handleUpdate" @delete="deleteMission" />
        <!-- New: the form opens, and this list comes back when it closes -->
        <template #actions>
            <HeroButton primary iconClass="fas fa-plus" :label="t('adminCreateMissions')" @click="emit('open', 'mission')" />
        </template>
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useMissions } from '@/composables/useMissions.js'
import { showConfirm, showResult } from '@/utils/dialog.js'
import { displayValue } from '@/utils/display.js'
import { DURATION_OPTIONS } from '@/utils/durationOptions.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'open'])

// Missions (for companies), search and saving
const lang = useLang()
const { getTranslation: t } = lang
const { missions, search, fetchData, saveMission, deleteMission: removeMission } = useMissions()

// Derive pricing mode: tjm = 0 → manual, tjm = null or > 0 → tjm
const getPricingMode = m => (m.tjm === 0) ? 'manual' : 'tjm'

// Table columns: client, title, date, price, VAT and its invoice on the row; pricing under it (its arrow).
// A mission billed is no longer changed (its invoice would no longer match it)
const columns = computed(() => withBilled([
    {
        key: 'client',
        label: lang.getTranslation('client'),
        formatter: m => displayValue(m.company_name || [m.firstname, m.lastname].filter(Boolean).join(' ')),
        disabled: true
    },
    { key: 'title', label: lang.getTranslation('missionTitle'), formatter: m => displayValue(m.title), disabled: false, autocomplete: 'off', mobile: 'plain' },
    { key: 'description', detail: true, label: t('missionDescription'), formatter: m => displayValue(m.description), autocomplete: 'off' },
    {
        key: 'date', label: lang.getTranslation('missionDate'), mobile: 'tag',
        formatter: m => m.date ? new Date(`${String(m.date).slice(0, 10)}T12:00:00`).toLocaleDateString(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        inputType: 'date', autocomplete: 'off'
    },
    {
        // Pricing mode selector — hidden for individuals
        key: 'pricing_mode', detail: true, label: lang.getTranslation('pricingMode'), type: 'select',
        formatter: m => (getPricingMode(m) === 'tjm' ? (lang.getTranslation('pricingModeTjm')) : (lang.getTranslation('pricingModeManual'))),
        editValue: m => getPricingMode(m),
        disabled: false,
        options: [
            { value: 'tjm', label: lang.getTranslation('pricingModeTjm') },
            { value: 'manual', label: lang.getTranslation('pricingModeManual') }
        ]
    },
    {
        // TJM — visible and editable only in TJM mode for professionals
        key: 'tjm', detail: true, label: lang.getTranslation('hourlyRate'),
        formatter: m => (getPricingMode(m) === 'tjm') ? displayValue(m.tjm) : '-',
        disabled: m => getPricingMode(m) === 'manual',
        inputType: 'number', autocomplete: 'off'
    },
    {
        // Duration — visible and editable only in TJM mode for professionals
        key: 'duration', detail: true, label: lang.getTranslation('missionDuration'), type: 'select',
        formatter: m => (getPricingMode(m) === 'tjm') ? (DURATION_OPTIONS.find(o => parseFloat(o.value) === parseFloat(m.duration))?.label || displayValue(m.duration)) : '-',
        editValue: m => parseFloat(m.duration).toFixed(2),
        disabled: m => getPricingMode(m) === 'manual',
        get options() { return DURATION_OPTIONS }
    },
    { key: 'quantity', detail: true, label: lang.getTranslation('quantity'), formatter: m => displayValue(m.quantity), inputType: 'number', autocomplete: 'off' },
    {
        // Unit price — readonly in TJM mode (auto-calculated), editable in manual mode
        key: 'unit_price', label: t('billMissionAmount'), mobile: 'tag',
        formatter: m => new Intl.NumberFormat(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: 'EUR' }).format(Number(m.unit_price) || 0),
        editValue: m => m.unit_price,
        disabled: m => getPricingMode(m) === 'tjm',
        inputType: 'number', autocomplete: 'off'
    },
    {
        key: 'vat_applicable', detail: true, label: lang.getTranslation('tvaApplicable'), type: 'select',
        formatter: m => m.vat_applicable ? lang.getTranslation('yes') : lang.getTranslation('no'),
        editValue: m => m.vat_applicable ? 1 : 0,
        options: [{ value: 1, label: lang.getTranslation('yes') }, { value: 0, label: lang.getTranslation('no') }]
    },
    {
        key: 'invoice', label: t('missionInvoice'), disabled: true, mobile: 'tag',
        // Billed on a document of the site (its number), billed before it (the old database: invoice_id 'legacy'), or to bill
        formatter: m => m.invoice_number ? `${m.invoice_number} ✓` : m.invoice_id ? t('missionBilledLegacy') : t('missionToBill'),
    },
]))
const withBilled = cols => cols.map(col => ({ ...col, disabled: m => Boolean(m.invoice_id) || (typeof col.disabled === 'function' ? col.disabled(m) : col.disabled) }))

// Recalculates unit price based on TJM, duration, and quantity
const recalcPrice = m => {
    if (getPricingMode(m) === 'tjm' && m.tjm && m.duration && m.quantity)
        m.unit_price = Math.round(m.tjm * m.duration * m.quantity * 100) / 100
}

// Fetches missions when modal opens
watch(() => props.show, val => val && fetchData())

// Filters missions by search query
const filteredMissions = computed(() => missions.value.filter(m =>
    [m.firstname, m.lastname, m.company_name, m.title, m.description, m.invoice_number]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(search.value.toLowerCase()))
))

// Handles inline updates and recalc price if needed
const handleUpdate = async ({ item, field, value }) => {
    const oldQty = item.quantity || 1

    if (field === 'pricing_mode') {
        // Switching to manual: set tjm = 0 and duration = 0 so getPricingMode returns 'manual' on reload
        if (value === 'manual') {
            item.tjm = 0
            item.duration = 0
            const res = await saveMission(item)
            await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
        }
        // Switching to TJM: reverse-calculate tjm from existing unit_price to avoid price change
        else {
            const dur = item.duration || 7
            const qty = item.quantity || 1
            const existingPrice = item.unit_price || 0
            item.duration = dur
            // Infer tjm from current price — fallback to 30 if no price set yet
            item.tjm = existingPrice > 0
                ? Math.round((existingPrice / (dur * qty)) * 100) / 100
                : 30
            // unit_price stays unchanged since tjm × duration × quantity = existing price
            const res = await saveMission(item, { quantity: qty })
            await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
        }
        // pricing_mode is local only — side effects persisted above, exit early
        return
    }
    else if (field === 'vat_applicable') item.vat_applicable = Number(value)
    else if (field === 'quantity') {
        const newQty = Number(value) || 1
        item.quantity = newQty
        if (getPricingMode(item) === 'tjm') recalcPrice(item)
        else if (item.unit_price && oldQty > 0) item.unit_price = Math.round(item.unit_price * (newQty / oldQty) * 100) / 100
    }
    else if (field === 'duration') { item.duration = parseFloat(value); recalcPrice(item) }
    else if (field === 'tjm') { item.tjm = Number(value) || 0; recalcPrice(item) }
    else if (field === 'unit_price') item.unit_price = Number(value) || 0
    else item[field] = value === '' ? null : value

    if (field === 'date') missions.value.sort((a, b) => new Date(b.date) - new Date(a.date))

    const res = await saveMission(item)
    await showResult(res, lang.getTranslation('saveSuccess'), lang.getTranslation('saveFailed'))
}

// Deletes mission with confirmation
const deleteMission = async m => {
    if (!(await showConfirm(lang.getTranslation('deleteMissionConfirm'), { okLabel: lang.getTranslation('dialogDelete') }))) return
    const res = await removeMission(m.id)
    await showResult(res, lang.getTranslation('deleteSuccess'), lang.getTranslation('deleteMissionFailed'))
}

// Close modal
const close = () => emit('close')
</script>
