<!-- Quotes and invoices, in one modal: the list (BillingList), or one document open in the editor (BillingEditor).
One modal only, its content changes: no modal over a modal. Data: stores/billing.js, amounts: utils/billing.js -->
<template>
    <ModalDialog :show="show" :title="title" @close="close">
        <Transition name="swap" mode="out-in">
            <BillingEditor v-if="current" :key="current.id || 'new'" :doc="current" :clients="adminData.clients"
                :missions="adminData.missions" :pick="pick && !current.id" @back="current = null" @open="openDocument" />
            <BillingList v-else :documents="billing.documents" :clients="adminData.clients" @open="openDocument" @create="create" />
        </Transition>
    </ModalDialog>
</template>

<script setup lang="ts">
import { todayIso } from '@/utils/display'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ModalDialog from '@/components/ui/Modal/ModalDialog.vue'
import BillingEditor from '@/components/views/Admin/Billing/BillingEditor.vue'
import BillingList from '@/components/views/Admin/Billing/BillingList.vue'
import { useLang } from '@/composables/useLang'
import { useAdminDataStore } from '@/stores/adminData'
import { useBillingStore } from '@/stores/billing'

const props = defineProps({
    show: Boolean,
    // Opened from the dashboard: a document at once (openId), or a new one (create: 'quote' | 'invoice', for clientId,
    // pick: the missions of the client to tick shown at once)
    openId: { type: String, default: '' },
    create: { type: String, default: '' },
    clientId: { type: String, default: '' },
    pick: Boolean,
})
const emit = defineEmits(['close'])

const { getTranslation: t } = useLang()
const billing = useBillingStore()
const adminData = useAdminDataStore()

// Document open in the editor (null: the list)
const current = ref<any>(null)

/*
 * Always the documents of now: a payment online (payment link, automatic debit) changes them on the server.
 * Loaded again at each opening, when the tab comes back, and every 20 s while the modal is open; a finalized document
 * open in the editor follows (a draft being changed is never replaced)
 */
const REFRESH_MS = 20000
let timer: ReturnType<typeof setTimeout> | undefined
const refresh = async () => {
    if (!props.show) return
    await billing.load(true)
    const open = current.value
    if (open?.id && open.status !== 'draft') current.value = billing.documents.find(d => d.id === open.id) || open
}
const onVisible = () => document.visibilityState === 'visible' && refresh()

watch(() => props.show, open => {
    if (!import.meta.client) return
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
    if (!open) return
    current.value = null
    billing.load(true).then(() => {
        if (props.openId) openDocument(props.openId)
        else if (props.create) create(props.create, props.clientId)
    })
    // The interest rates: the late payment penalties printed on every document
    // The missions again too: the ones billed since are no longer offered
    adminData.invalidate('missions')
    adminData.load('clients', 'missions', 'interestRates')
    timer = setInterval(refresh, REFRESH_MS)
    document.addEventListener('visibilitychange', onVisible)
}, { immediate: true })
onBeforeUnmount(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) })

// A finalized document open in the editor shows its new version at once (a payment, a status, an email sent);
// a draft being changed is never replaced
watch(() => billing.documents, list => {
    const open = current.value
    if (!open?.id || open.status === 'draft') return
    const fresh = list.find(d => d.id === open.id)
    if (fresh && fresh !== open) current.value = fresh
// deep 1: a document replaced inside the list (splice) is seen too
}, { deep: 1 })

const title = computed(() => {
    if (!current.value) return t('adminBilling')
    const doc = current.value
    const kind = doc.type === 'invoice' ? `billInvoice_${doc.kind || 'standard'}` : doc.type === 'contract' ? 'billContract' : 'billQuote'
    return doc.number || `${t(kind)} · ${t('billDraft')}`
})

// A new draft: today, valid 30 days, paid at once (it is saved the first time the admin saves it)
const create = (type: string, clientId = '') => {
    const today = todayIso()
    current.value = {
        type, kind: 'standard', status: 'draft', clientId, title: '', issueDate: today, dueDate: type === 'invoice' ? today : '',
        validityDays: 30, currency: 'EUR', lines: [{ description: '', details: '', quantity: 1, unit: '', unitPrice: 0, vatRate: 0 }],
        discountType: null, discountValue: 0, paymentPlan: { mode: 'full' }, deductions: [], notes: '', payments: [],
        // Paid by card (the payment link); a bank transfer only when ticked
        options: { allowTransfer: false },
    }
}

// A document of the list (or the one just made from another): always its last version
const openDocument = (id: string) => {
    current.value = billing.documents.find(d => d.id === id) || null
}

const close = () => {
    current.value = null
    emit('close')
}
</script>
