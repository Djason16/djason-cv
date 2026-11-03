<!-- List of the quotes or the invoices: two tabs, a search, the new document buttons, then the table (number, client, subject,
date, total, state, left to pay) with its buttons: open, PDF -->
<template>
    <div class="billing-list">
        <div class="billing-list__bar">
            <div class="billing-list__tabs" role="tablist">
                <button v-for="tab in TABS" :key="tab.type" type="button" role="tab" class="billing-list__tab text-label"
                    :class="{ 'is-active': type === tab.type }" :aria-selected="type === tab.type" @click="type = tab.type">
                    {{ t(tab.labelKey) }} <span class="billing-list__count">{{ counts[tab.type] }}</span>
                </button>
            </div>
            <input v-model="search" type="search" class="billing-list__search" :placeholder="t('billSearch')" :aria-label="t('billSearch')" />
        </div>

        <!-- What the list holds: total, already paid, left to pay -->
        <dl class="billing-list__summary">
            <div v-for="item in summary" :key="item.key">
                <dt class="text-label">{{ t(item.key) }}</dt>
                <dd class="text-display-s">{{ money(item.value) }}</dd>
            </div>
        </dl>

        <EditableTable :items="rows" :columns="columns" :actions-label="t('actions')" :empty-message="t('billEmpty')" :show-delete="false">
            <template #actions="{ item }">
                <IconButton icon="pen" :label="t('billOpen')" @click="emit('open', item.id)" />
            </template>
        </EditableTable>

        <!-- New documents: a quote or an invoice; a contract is made from a finalized quote -->
        <p v-if="type === 'contract'" class="billing-actions__note text-body-s">{{ t('billContractsHint') }}</p>
        <div class="billing-list__new">
            <HeroButton :primary="type !== 'invoice'" iconClass="fas fa-plus" :label="t('billNewQuote')" @click="emit('create', 'quote')" />
            <HeroButton :primary="type === 'invoice'" iconClass="fas fa-plus" :label="t('billNewInvoice')" @click="emit('create', 'invoice')" />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useLang } from '@/composables/useLang.js'
import { paymentState } from '@/utils/billing.js'

const props = defineProps({
    documents: { type: Array, default: () => [] },
    clients: { type: Array, default: () => [] },
})
const emit = defineEmits(['open', 'create'])

const lang = useLang()
const t = lang.getTranslation
const TABS = [{ type: 'quote', labelKey: 'billTabQuotes' }, { type: 'invoice', labelKey: 'billTabInvoices' }, { type: 'contract', labelKey: 'billTabContracts' }]
const type = ref('quote')
const search = ref('')

const locale = computed(() => lang.current.value === 'fr' ? 'fr-FR' : 'en-GB')
const money = (value, currency = 'EUR') => new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(Number(value) || 0)
const date = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString(locale.value, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// Name of the client: its copy on a finalized document, the live one for a draft
const clientName = doc => {
    if (doc.client?.name) return doc.client.name
    const c = props.clients.find(x => x.id === doc.clientId)
    return c ? (c.company_name || `${c.firstname || ''} ${c.lastname || ''}`.trim()) : '—'
}

// A contract accepted by the client is signed
const stateKey = d => d.type === 'contract' && d.state === 'accepted' ? 'billState_signed' : `billState_${d.state}`

const withState = computed(() => props.documents.map(doc => ({ ...doc, ...paymentState(doc, doc.netToPay), clientName: clientName(doc) })))
const counts = computed(() => Object.fromEntries(TABS.map(tab => [tab.type, props.documents.filter(d => d.type === tab.type).length])))

const rows = computed(() => {
    const term = search.value.trim().toLowerCase()
    return withState.value.filter(d => d.type === type.value
        && (!term || [d.number, d.clientName, d.title].some(v => String(v || '').toLowerCase().includes(term))))
})

// Totals of the tab, cancelled and drafts left out
const summary = computed(() => {
    const counted = rows.value.filter(d => !['draft', 'cancelled', 'refused'].includes(d.status))
    const sum = key => counted.reduce((s, d) => s + (Number(d[key]) || 0), 0)
    if (type.value === 'contract') return [{ key: 'billColTotal', value: sum('netToPay') }, { key: 'billState_signed', value: counted.filter(d => d.status === 'accepted').reduce((s, d) => s + d.netToPay, 0) }]
    if (type.value === 'quote') return [{ key: 'billColTotal', value: sum('netToPay') }, { key: 'billState_accepted', value: counted.filter(d => d.status === 'accepted').reduce((s, d) => s + d.netToPay, 0) }]
    return [{ key: 'billColTotal', value: sum('netToPay') }, { key: 'billPaid', value: sum('paid') }, { key: 'billColRemaining', value: sum('remaining') }]
})

const columns = computed(() => [
    { key: 'number', label: t('billColNumber'), disabled: true, formatter: d => d.number || `<em>${t('billDraft')}</em>`, processHtml: true },
    { key: 'clientName', label: t('billColClient'), disabled: true },
    { key: 'title', label: t('billColObject'), disabled: true, formatter: d => d.title || '—' },
    { key: 'issueDate', label: t('billColDate'), disabled: true, formatter: d => date(d.issueDate) },
    { key: 'netToPay', label: t('billColTotal'), disabled: true, formatter: d => money(d.netToPay, d.currency) },
    { key: 'state', label: t('billColState'), disabled: true, processHtml: true, tooltip: d => t(stateKey(d)),
        formatter: d => `<span class="bill-state is-${d.state}">${t(stateKey(d))}</span>` },
    ...(type.value === 'invoice' ? [{ key: 'remaining', label: t('billColRemaining'), disabled: true, formatter: d => money(d.remaining, d.currency) }] : []),
])
</script>
