<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewMissions')" @close="close">
        <div class="mission-list-modal">

            <!-- Search input -->
            <div class="search-bar">
                <input v-model="search" id="mission-search" name="mission-search" type="text"
                    :placeholder="$lang.getTranslation('searchMissions')" class="text-small" autocomplete="off"
                    :title="$lang.getTranslation('searchMissions')" />
            </div>

            <!-- Editable missions table -->
            <EditableTable :items="filteredMissions" :columns="columns" :actions-label="$lang.getTranslation('actions')"
                :delete-label="$lang.getTranslation('delete')" :empty-message="$lang.getTranslation('noMissionsFound')"
                @update="handleUpdate" @delete="deleteMission" />

            <!-- Footer with close button -->
            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="$lang.getTranslation('close')"
                    @click="close" />
            </div>

        </div>
    </ModalDialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useMissions } from '~/composables/useMissions'
import { getDurationOptions } from '~/utils/durationOptions'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Composable provides missions, clients, services, search, formatting helpers
const { $lang, missions, clients, services, search, isIndividualClient, displayValue, displayServiceName, fetchData } = useMissions()

// Precompute duration options for select fields
const durationOptions = computed(() => getDurationOptions())

// Table columns with dynamic formatting, editable logic, and options
const columns = computed(() => [
    {
        key: 'client',
        label: $lang.getTranslation('client'),
        formatter: m => displayValue(m.company_name || [m.firstname, m.lastname].filter(Boolean).join(' ')),
        disabled: true
    },
    { key: 'title', label: $lang.getTranslation('missionTitle'), formatter: m => displayValue(m.title), disabled: false, autocomplete: 'off' },
    {
        key: 'service', label: $lang.getTranslation('service'), type: 'select',
        formatter: m => { const c = clients.value.find(c => c.id === m.client_id); const s = services.value.find(s => s.id === m.service_id); return c?.type === 'individual' ? displayServiceName(s || { name: m.service }) : displayValue(m.service) },
        editValue: m => m.service_id,
        disabled: m => ['freelance', 'company'].includes(clients.value.find(c => c.id === m.client_id)?.type),
        get options() { return services.value.filter(s => !['Corporate Mission', 'corporateMission'].includes(s.name)).map(s => ({ value: s.id, label: displayServiceName(s) })) }
    },
    { key: 'date', label: $lang.getTranslation('missionDate'), formatter: m => m.date ? `${String(new Date(m.date).getDate()).padStart(2, '0')}/${String(new Date(m.date).getMonth() + 1).padStart(2, '0')}/${new Date(m.date).getFullYear()}` : '-', inputType: 'date', autocomplete: 'off' },
    { key: 'tjm', label: $lang.getTranslation('hourlyRate') || '€/h', formatter: m => isIndividualClient(m.client_id) ? '-' : displayValue(m.tjm), disabled: m => isIndividualClient(m.client_id), inputType: 'number', autocomplete: 'off' },
    {
        key: 'duration', label: $lang.getTranslation('missionDuration'), type: 'select',
        formatter: m => isIndividualClient(m.client_id) ? '-' : (durationOptions.value.find(o => parseFloat(o.value) === parseFloat(m.duration))?.label || displayValue(m.duration)),
        editValue: m => parseFloat(m.duration).toFixed(2),
        disabled: m => isIndividualClient(m.client_id),
        get options() { return durationOptions.value }
    },
    { key: 'quantity', label: $lang.getTranslation('quantity'), formatter: m => displayValue(m.quantity), inputType: 'number', autocomplete: 'off' },
    { key: 'unit_price', label: $lang.getTranslation('unitPrice') + ' / ' + ($lang.getTranslation('totalAmount') || 'Total'), formatter: m => displayValue(m.unit_price), inputType: 'number', autocomplete: 'off' },
    {
        key: 'vat_applicable', label: $lang.getTranslation('tvaApplicable'), type: 'select',
        formatter: m => m.vat_applicable ? $lang.getTranslation('yes') : $lang.getTranslation('no'),
        editValue: m => m.vat_applicable ? 1 : 0,
        options: [{ value: 1, label: $lang.getTranslation('yes') }, { value: 0, label: $lang.getTranslation('no') }]
    }
])

// Recalculate unit price based on TJM, duration, and quantity
const recalcPrice = m => { if (!isIndividualClient(m.client_id) && m.tjm && m.duration && m.quantity) m.unit_price = Math.round(m.tjm * m.duration * m.quantity * 100) / 100 }

// Fetch missions and compute TJM per mission
const fetchMissionsData = async () => {
    await fetchData()
    missions.value = missions.value.map(m => ({ ...m, tjm: m.duration && m.quantity && m.unit_price ? Math.round((m.unit_price / (m.duration * m.quantity)) * 100) / 100 : 0 }))
}

// Fetch data when modal opens
watch(() => props.show, val => val && fetchMissionsData())

// Filter missions by search query
const filteredMissions = computed(() => missions.value.filter(m => [m.firstname, m.lastname, m.company_name, m.title, m.service].filter(Boolean).some(v => v.toLowerCase().includes(search.value.toLowerCase()))))

// Handle inline updates and recalc price if needed
const handleUpdate = async ({ item, field, value }) => {
    const oldQty = item.quantity || 1
    if (field === 'service') item.service_id = value
    else if (field === 'vat_applicable') item.vat_applicable = Number(value)
    else if (field === 'quantity') { const newQty = Number(value) || 1; item.quantity = newQty; if (isIndividualClient(item.client_id) || (item.tjm && item.duration)) recalcPrice(item); else if (item.unit_price && oldQty > 0) item.unit_price = Math.round(item.unit_price * (newQty / oldQty) * 100) / 100 }
    else if (field === 'duration') { item.duration = parseFloat(value); recalcPrice(item) }
    else if (field === 'tjm') { item.tjm = Number(value) || 0; recalcPrice(item) }
    else if (field === 'unit_price') item.unit_price = Number(value) || 0
    else item[field] = value
    if (field === 'date') missions.value.sort((a, b) => new Date(b.date) - new Date(a.date))
    try { await $fetch('/api/missions/edit-mission', { method: 'PUT', body: { id: item.id, clientId: item.client_id, serviceId: item.service_id, title: item.title, date: item.date, duration: item.duration, quantity: item.quantity, unitPrice: item.unit_price, tvaApplicable: item.vat_applicable } }) } catch (e) { console.error('Update error:', e) }
}

// Delete mission with confirmation
const deleteMission = async m => {
    if (!confirm($lang.getTranslation('deleteMissionConfirm'))) return
    try {
        const res = await $fetch('/api/missions/delete-mission', { method: 'POST', body: { id: m.id } })
        if (res.success) missions.value = missions.value.filter(mi => mi.id !== m.id)
        else alert(res.error || $lang.getTranslation('deleteMissionFailed'))
    } catch (e) { console.error(e); alert($lang.getTranslation('deleteMissionFailed')) }
}

// Close modal
const close = () => emit('close')
</script>

<style scoped>
.mission-list-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1920px;
    min-width: 60vw;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark);
    box-sizing: border-box
}

.search-bar {
    display: flex;
    justify-content: flex-end
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto
}
</style>