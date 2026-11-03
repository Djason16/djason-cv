<!-- One quote or invoice: on the left its form (a draft) or its actions (finalized: state, invoices, payments),
on the right the document itself, updated at every change (the same template as the PDF) -->
<template>
    <div class="billing-editor">
        <div class="billing-editor__side">
            <button type="button" class="billing-editor__back text-label" @click="emit('back')">← {{ t('adminBilling') }}</button>

            <!-- Draft: every field -->
            <form v-if="isDraft" class="billing-editor__form" @submit.prevent="save()">
                <div class="row-group">
                    <div class="form-group">
                        <label for="bill-client">{{ t('billClient') }}</label>
                        <select id="bill-client" v-model="draft.clientId">
                            <option value="" disabled>{{ t('billChooseClient') }}</option>
                            <option v-for="c in clients" :key="c.id" :value="c.id">{{ clientLabel(c) }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="bill-currency">{{ t('billCurrency') }}</label>
                        <select id="bill-currency" v-model="draft.currency"><option value="EUR">EUR</option><option value="USD">USD</option></select>
                    </div>
                </div>
                <!-- An invoice made by hand: an invoice, or a deposit invoice (a deposit received, its quote made elsewhere) -->
                <div v-if="draft.type === 'invoice' && !draft.quoteId" class="form-group">
                    <label for="bill-kind">{{ t('billInvoiceKind') }}</label>
                    <select id="bill-kind" v-model="draft.kind">
                        <option value="standard">{{ t('billInvoice_standard') }}</option>
                        <option value="deposit">{{ t('billInvoice_deposit') }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="bill-title">{{ t('billObject') }}</label>
                    <input id="bill-title" v-model="draft.title" type="text" :placeholder="t('billObjectPlaceholder')" />
                </div>
                <div class="row-group">
                    <div class="form-group">
                        <label for="bill-issue">{{ t('billIssueDate') }}</label>
                        <input id="bill-issue" v-model="draft.issueDate" type="date" />
                    </div>
                    <div v-if="draft.type === 'quote'" class="form-group">
                        <label for="bill-validity">{{ t('billValidityDays') }}</label>
                        <input id="bill-validity" v-model.number="draft.validityDays" type="number" min="1" />
                    </div>
                    <div v-else class="form-group">
                        <label for="bill-due">{{ t('billDueDate') }}</label>
                        <input id="bill-due" v-model="draft.dueDate" type="date" />
                    </div>
                    <!-- Invoice: when the service was done (a required mention; the issue date when left empty) -->
                    <div v-if="draft.type === 'invoice'" class="form-group">
                        <label for="bill-service-date">{{ t(draft.kind === 'deposit' ? 'billDepositDate' : 'billServiceDate') }}</label>
                        <input id="bill-service-date" v-model="draft.options.serviceDate" type="date" />
                    </div>
                </div>

                <!-- Interest rate of the half-year (admin > Rates): the late payment penalties of the document -->
                <p class="billing-editor__rate text-body-s" :class="{ 'is-missing': appliedRate === null }">
                    <template v-if="appliedRate !== null">{{ t('billRateApplied', { legal: percent(appliedRate), penalty: percent(appliedRate * 3) }) }}</template>
                    <template v-else>{{ t('billRateMissing') }}</template>
                </p>

                <!-- Contract: its service (the articles that apply), its amounts come from the quote -->
                <template v-if="draft.type === 'contract'">
                    <div class="form-group">
                        <label for="bill-service">{{ t('billServiceType') }}</label>
                        <select id="bill-service" v-model="draft.options.serviceType">
                            <option v-for="s in ['web', 'video', 'repair']" :key="s" :value="s">{{ t(`service_${s}`) }}</option>
                        </select>
                    </div>
                    <p class="billing-actions__note text-body-s">{{ t('billContractFromQuote', { number: draft.options.quoteNumber || '' }) }}</p>
                </template>

                <EditorLines v-if="draft.type !== 'contract'" v-model="draft.lines" :missions="clientMissions" :start-picking="pick" />

                <div v-if="draft.type !== 'contract'" class="row-group">
                    <div class="form-group">
                        <label for="bill-discount-type">{{ t('billDiscount') }}</label>
                        <select id="bill-discount-type" v-model="draft.discountType">
                            <option :value="null">{{ t('billDiscountNone') }}</option>
                            <option value="percent">{{ t('billDiscountPercent') }}</option>
                            <option value="amount">{{ t('billDiscountAmount') }}</option>
                        </select>
                    </div>
                    <div v-if="draft.discountType" class="form-group">
                        <label for="bill-discount">{{ draft.discountType === 'percent' ? t('billPercent') : t('billAmount') }}</label>
                        <input id="bill-discount" v-model.number="draft.discountValue" type="number" min="0" step="0.01" />
                    </div>
                </div>

                <EditorPlan v-if="draft.type === 'quote' || (draft.type === 'invoice' && draft.kind === 'standard')" v-model="draft.paymentPlan"
                    :total="totals.totalTTC" :issue-date="draft.issueDate" :currency="draft.currency" />

                <!-- Card only by default (paid and invoiced alone); a bank transfer when the client asks for it -->
                <div v-if="draft.type !== 'contract'" class="billing-editor__option">
                    <label class="billing-editor__check text-body">
                        <input v-model="draft.options.allowTransfer" type="checkbox" /> {{ t('billAllowTransfer') }}
                    </label>
                    <p class="billing-editor__option-hint text-body-s">{{ t('billAllowTransferHint') }}</p>
                </div>

                <div class="form-group">
                    <label for="bill-notes">{{ t('billNotes') }}</label>
                    <textarea id="bill-notes" v-model="draft.notes" rows="3" :placeholder="t('billNotesPlaceholder')"></textarea>
                </div>

                <div class="billing-editor__buttons">
                    <HeroButton primary iconClass="fas fa-lock" :label="t('billFinalize')" :disabled="busy" @click="finalize" />
                    <HeroButton type="submit" iconClass="fas fa-save" :label="t('billSaveDraft')" :disabled="busy" @click="save()" />
                    <HeroButton iconClass="fas fa-download" :label="t('billDownloadPdf')" :disabled="busy" @click="download" />
                    <HeroButton v-if="draft.id" iconClass="fas fa-trash" :label="t('billDeleteDraft')" :disabled="busy" @click="removeDraft" />
                </div>
            </form>

            <!-- Finalized: what can still be done -->
            <BillingActions v-else :doc="doc" :busy="busy" @download="download" @download-both="downloadBoth" @open="id => emit('open', id)" @busy="v => busy = v" />
        </div>

        <!-- The document as it will be sent -->
        <div class="billing-editor__preview" :aria-label="t('billDownloadPdf')">
            <ContractContainer v-if="previewDoc.type === 'contract'" v-bind="contractProps(previewWithRate, clientInfo, bank)" />
            <BillingDocument v-else :doc="previewWithRate" :client-info="clientInfo" :bank="bank" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import BillingActions from '@/components/views/Admin/Billing/BillingActions.vue'
import EditorLines from '@/components/views/Admin/Billing/EditorLines.vue'
import EditorPlan from '@/components/views/Admin/Billing/EditorPlan.vue'
import BillingDocument from '@/components/views/Documents/BillingDocument.vue'
import ContractContainer from '@/components/views/Documents/ContractContainer.vue'
import { useInterestRates } from '@/composables/useInterestRates.js'
import { contractProps } from '@/utils/contractDocument.js'
import { useLang } from '@/composables/useLang.js'
import { useBillingStore } from '@/stores/billing.js'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'
import { nextNumber } from '@/utils/numbering.js'
import { api } from '@/utils/api.js'
import { documentTotals } from '@/utils/billing.js'
import { showConfirm, showFailure, showPrompt, showSuccess } from '@/utils/dialog.js'
import { pdfOptions } from '@/utils/documentPdf.js'
import { exportPdf } from '@/utils/pdf.js'

const props = defineProps({
    doc: { type: Object, required: true },
    clients: { type: Array, default: () => [] },
    missions: { type: Array, default: () => [] },
    // The missions of the client to tick shown at once (a new invoice from the dashboard)
    pick: Boolean,
})
const emit = defineEmits(['back', 'open'])

const lang = useLang()
const t = lang.getTranslation
const billing = useBillingStore()
const siteSettings = useSiteSettingsStore()
const busy = ref(false)

// Copy edited by the form (the list changes only once saved)
const draft = reactive(JSON.parse(JSON.stringify(props.doc)))
watch(() => props.doc, doc => Object.assign(draft, JSON.parse(JSON.stringify(doc))))
const isDraft = computed(() => props.doc.status === 'draft')
const previewDoc = computed(() => isDraft.value ? draft : props.doc)
const totals = computed(() => documentTotals(draft))
if (!draft.options) draft.options = {}

// Legal interest rate on the issue date, for the type of the client (a finalized document keeps the one it was made with)
const { getApplicableRate } = useInterestRates()
const appliedRate = computed(() => isDraft.value ? getApplicableRate(clientInfo.value.type, draft.issueDate || undefined) : props.doc.options?.interestRate ?? null)
const percent = rate => `${(Number(rate) * 100).toLocaleString(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 2 })} %`
const previewWithRate = computed(() => isDraft.value ? { ...draft, options: { ...draft.options, interestRate: appliedRate.value } } : props.doc)

const clientLabel = c => c.company_name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || c.email
// The client printed on a draft (a finalized document has its own copy)
const clientInfo = computed(() => {
    const c = props.clients.find(x => x.id === draft.clientId)
    if (!c) return {}
    return { type: c.type, name: clientLabel(c), contact: c.company_name ? `${c.firstname || ''} ${c.lastname || ''}`.trim() : '',
        email: c.email, phone: c.phone, address: c.address, postalCode: c.postal_code, city: c.city, siret: c.siret }
})
const clientMissions = computed(() => props.missions.filter(m => m.client_id === draft.clientId))

// Bank details printed on the documents (.env, admin > Environment)
const bank = ref({})
onMounted(async () => {
    const res = await api.get('/bank')
    if (res.success) bank.value = { iban: res.bank?.iban, bic: res.bank?.bic }
})

// Saves the draft; a new one then opens as itself (not when it is finalized right after: it opens once finalized,
// the editor would otherwise be replaced in the middle of the finalization)
const save = async (quiet = false, reopen = true) => {
    busy.value = true
    const { payments, ...body } = draft
    // The rate of the day of the document is kept with it
    body.options = { ...(draft.options || {}), interestRate: appliedRate.value }
    const res = await billing.save(body)
    busy.value = false
    if (!res.success) return showFailure(t('billError')), null
    if (!draft.id && reopen) emit('open', res.document.id)
    if (!draft.id) draft.id = res.document.id
    if (!quiet) showSuccess(t('billSaved'))
    return res.document
}

// Next free number of its series, in the format of admin → Numbering, proposed to the admin (the server checks it again)
const proposedNumber = () => nextNumber(draft.type, draft.issueDate, siteSettings.values.numbering,
    billing.documents.filter(d => d.type === draft.type && d.number).map(d => d.number))

const finalize = async () => {
    if (!draft.clientId) return showFailure(t('billClientRequired'))
    if (!draft.lines.some(l => Number(l.unitPrice) > 0)) return showFailure(t('billLinesRequired'))
    if (appliedRate.value === null && !(await showConfirm(t('billRateMissingConfirm')))) return
    const number = await showPrompt(t('billNumberPrompt'), proposedNumber())
    if (!number) return
    if (!(await showConfirm(t('billFinalizeConfirm', { number })))) return
    const saved = await save(true, false)
    if (!saved) return
    busy.value = true
    const res = await billing.finalize(saved.id, number)
    busy.value = false
    if (!res.success) return showFailure(res.error ? t(res.error) : t('billError'))
    emit('open', res.document.id)
    showSuccess(t('billSaved'))
}

const download = async () => {
    busy.value = true
    try {
        await exportPdf(pdfOptions(previewWithRate.value, clientInfo.value, bank.value, t('billDraft')))
    } catch {
        showFailure(t('documentFailed'))
    }
    busy.value = false
}

// The quote and its contract downloaded together, one file each, to give them to the client at the same time
const downloadBoth = async contract => {
    busy.value = true
    try {
        await exportPdf(pdfOptions(previewWithRate.value, clientInfo.value, bank.value))
        await exportPdf(pdfOptions(contract, clientInfo.value, bank.value, t('billDraft')))
    } catch {
        showFailure(t('documentFailed'))
    }
    busy.value = false
}

const removeDraft = async () => {
    if (!(await showConfirm(t('billDeleteConfirm')))) return
    const res = await billing.remove(draft.id)
    if (res.success) emit('back')
    else showFailure(t('billError'))
}
</script>
