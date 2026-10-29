<template>
    <!-- Missions: inline edit (pricing mode, TJM, duration...) and delete -->
    <TableModal :show="show" :title="t('viewMissions')"
        v-model:search="search" :search-placeholder="t('searchMissions')" @close="close">
        <EditableTable :items="filteredMissions" :columns="columns" :actions-label="t('actions')"
            :delete-label="t('delete')" :empty-message="t('noMissionsFound')"
            @update="handleUpdate" @delete="deleteMission" />
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useMissions } from '@/composables/useMissions.js'
import { isIndividualType, isProfessionalType } from '@/utils/clientTypes.js'
import { showConfirm, showResult } from '@/utils/dialog.js'
import { displayValue } from '@/utils/display.js'
import { DURATION_OPTIONS } from '@/utils/durationOptions.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Composable provides missions, clients, services, search, formatting helpers
const lang = useLang()
const { getTranslation: t } = lang
const { missions, clients, services, search, isIndividualClient, displayServiceName, fetchData, saveMission, deleteMission: removeMission } = useMissions()

// Resolves client type for a mission
const getClientType = m => clients.value.find(c => c.id === m.client_id)?.type

// Derive pricing mode: tjm = 0 → manual, tjm = null or > 0 → tjm
const getPricingMode = m => (m.tjm === 0) ? 'manual' : 'tjm'

// Table columns with dynamic formatting, editable logic, and options
const columns = computed(() => [
    {
        key: 'client',
        label: lang.getTranslation('client'),
        formatter: m => displayValue(m.company_name || [m.firstname, m.lastname].filter(Boolean).join(' ')),
        disabled: true
    },
    { key: 'title', label: lang.getTranslation('missionTitle'), formatter: m => displayValue(m.title), disabled: false, autocomplete: 'off' },
    {
        key: 'service', label: lang.getTranslation('service'), type: 'select',
        formatter: m => {
            const s = services.value.find(s => s.id === m.service_id)
            return isIndividualClient(m.client_id) ? displayServiceName(s || { name: m.service }) : displayValue(m.service)
        },
        editValue: m => m.service_id,
        disabled: m => isProfessionalType(getClientType(m)),
        get options() { return services.value.filter(s => !['Corporate Mission', 'corporateMission'].includes(s.name)).map(s => ({ value: s.id, label: displayServiceName(s) })) }
    },
    {
        key: 'date', label: lang.getTranslation('missionDate'),
        formatter: m => m.date ? `${String(new Date(m.date).getDate()).padStart(2, '0')}/${String(new Date(m.date).getMonth() + 1).padStart(2, '0')}/${new Date(m.date).getFullYear()}` : '-',
        inputType: 'date', autocomplete: 'off'
    },
    {
        // Pricing mode selector — hidden for individuals
        key: 'pricing_mode', label: lang.getTranslation('pricingMode'), type: 'select',
        formatter: m => isIndividualType(getClientType(m)) ? '-' : (getPricingMode(m) === 'tjm' ? (lang.getTranslation('pricingModeTjm')) : (lang.getTranslation('pricingModeManual'))),
        editValue: m => getPricingMode(m),
        disabled: m => isIndividualType(getClientType(m)),
        options: [
            { value: 'tjm', label: lang.getTranslation('pricingModeTjm') },
            { value: 'manual', label: lang.getTranslation('pricingModeManual') }
        ]
    },
    {
        // TJM — visible and editable only in TJM mode for professionals
        key: 'tjm', label: lang.getTranslation('hourlyRate'),
        formatter: m => (isProfessionalType(getClientType(m)) && getPricingMode(m) === 'tjm') ? displayValue(m.tjm) : '-',
        disabled: m => isIndividualType(getClientType(m)) || getPricingMode(m) === 'manual',
        inputType: 'number', autocomplete: 'off'
    },
    {
        // Duration — visible and editable only in TJM mode for professionals
        key: 'duration', label: lang.getTranslation('missionDuration'), type: 'select',
        formatter: m => (isProfessionalType(getClientType(m)) && getPricingMode(m) === 'tjm') ? (DURATION_OPTIONS.find(o => parseFloat(o.value) === parseFloat(m.duration))?.label || displayValue(m.duration)) : '-',
        editValue: m => parseFloat(m.duration).toFixed(2),
        disabled: m => isIndividualType(getClientType(m)) || getPricingMode(m) === 'manual',
        get options() { return DURATION_OPTIONS }
    },
    { key: 'quantity', label: lang.getTranslation('quantity'), formatter: m => displayValue(m.quantity), inputType: 'number', autocomplete: 'off' },
    {
        // Unit price — readonly in TJM mode (auto-calculated), editable in manual mode
        key: 'unit_price', label: lang.getTranslation('unitPrice') + ' / ' + (lang.getTranslation('totalAmount')),
        formatter: m => displayValue(m.unit_price),
        disabled: m => isProfessionalType(getClientType(m)) && getPricingMode(m) === 'tjm',
        inputType: 'number', autocomplete: 'off'
    },
    {
        key: 'vat_applicable', label: lang.getTranslation('tvaApplicable'), type: 'select',
        formatter: m => m.vat_applicable ? lang.getTranslation('yes') : lang.getTranslation('no'),
        editValue: m => m.vat_applicable ? 1 : 0,
        options: [{ value: 1, label: lang.getTranslation('yes') }, { value: 0, label: lang.getTranslation('no') }]
    }
])

// Recalculates unit price based on TJM, duration, and quantity
const recalcPrice = m => {
    if (isProfessionalType(getClientType(m)) && getPricingMode(m) === 'tjm' && m.tjm && m.duration && m.quantity)
        m.unit_price = Math.round(m.tjm * m.duration * m.quantity * 100) / 100
}

// Fetches missions when modal opens
watch(() => props.show, val => val && fetchData())

// Filters missions by search query
const filteredMissions = computed(() => missions.value.filter(m =>
    [m.firstname, m.lastname, m.company_name, m.title, m.service]
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
    else if (field === 'service') item.service_id = value
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
