<!-- A finalized document: its state and amounts, then what can be done.
Quote: its path in order (BillingFlow). Contract: signed. Invoice: the payments received, its payment link. All: PDF, duplicate, cancel -->
<template>
    <div class="billing-actions">
        <p class="billing-actions__note text-body-s">{{ t('billReadOnly') }}</p>

        <dl class="billing-actions__amounts">
            <div><dt class="text-label">{{ t('billColState') }}</dt><dd><span class="bill-state" :class="`is-${state.state}`">{{ t(doc.type === 'contract' && state.state === 'accepted' ? 'billState_signed' : `billState_${state.state}`) }}</span></dd></div>
            <div><dt class="text-label">{{ t('billColTotal') }}</dt><dd class="text-display-s">{{ money(doc.netToPay) }}</dd></div>
            <div v-if="doc.type === 'invoice'"><dt class="text-label">{{ t('billColRemaining') }}</dt><dd class="text-display-s">{{ money(state.remaining) }}</dd></div>
        </dl>

        <!-- Quote: its path in order (contract, signature, payments), with the button of the step of now -->
        <BillingFlow v-if="doc.type === 'quote' && doc.status !== 'cancelled'" :doc="doc" :busy="busy"
            @download="emit('download')" @download-both="c => emit('download-both', c)" @open="id => emit('open', id)" @busy="v => emit('busy', v)" />

        <!-- A contract or an invoice of a quote: its path is followed from the quote (next step there) -->
        <div v-if="quote" class="billing-actions__buttons">
            <HeroButton primary iconClass="fas fa-route" :label="t('billBackToQuote', { number: quote.number })" @click="emit('open', quote.id)" />
        </div>

        <!-- Contract alone (not made from a quote): signed by the client -->
        <div v-if="doc.type === 'contract' && !quote && doc.status !== 'cancelled'" class="billing-actions__buttons">
            <HeroButton :primary="doc.status !== 'accepted'" iconClass="fas fa-signature" :label="t('billMarkSigned')" :disabled="busy || doc.status === 'accepted'" @click="setStatus('accepted')" />
        </div>

        <!-- Invoice: payments received, and a new one -->
        <section v-if="doc.type === 'invoice' && doc.status !== 'cancelled'" class="billing-actions__block">
            <p class="eyebrow">{{ t('billPaymentsReceived') }}</p>
            <ul v-if="doc.payments.length" class="billing-actions__payments">
                <li v-for="p in doc.payments" :key="p.id">
                    <span class="text-body-s">{{ p.date }} · {{ t(`billMethod_${p.method}`) }}<template v-if="p.note"> · {{ p.note }}</template></span>
                    <strong class="text-body">{{ money(p.amount) }}</strong>
                    <IconButton icon="trash" variant="danger" :label="t('billRemovePayment')" @click="removePayment(p.id)" />
                </li>
            </ul>
            <form v-if="state.remaining > 0" class="billing-actions__pay" @submit.prevent="addPayment">
                <div class="row-group">
                    <div class="form-group"><label for="pay-date">{{ t('billPaymentDate') }}</label><input id="pay-date" v-model="payment.date" type="date" required /></div>
                    <div class="form-group"><label for="pay-amount">{{ t('billPaymentAmount') }}</label><input id="pay-amount" v-model.number="payment.amount" type="number" min="0.01" step="0.01" required /></div>
                </div>
                <div class="row-group">
                    <div class="form-group">
                        <label for="pay-method">{{ t('billPaymentMethod') }}</label>
                        <select id="pay-method" v-model="payment.method"><option v-for="m in METHODS" :key="m" :value="m">{{ t(`billMethod_${m}`) }}</option></select>
                    </div>
                    <div class="form-group"><label for="pay-note">{{ t('billPaymentNote') }}</label><input id="pay-note" v-model="payment.note" type="text" /></div>
                </div>
                <HeroButton type="submit" primary iconClass="fas fa-euro-sign" :label="t('billAddPayment')" :disabled="busy" />
            </form>
        </section>

        <!-- Online payment: the link of this document on the Pay me page (the client pays by card, the payment is saved alone) -->
        <section v-if="canPayOnline" class="billing-actions__block">
            <p class="eyebrow">{{ t('payLinkTitle') }}</p>
            <p class="billing-actions__note text-body-s">{{ t(doc.type === 'quote' ? 'payLinkQuoteHint' : 'payLinkInvoiceHint') }}</p>
            <div class="billing-actions__paylink">
                <input v-if="payUrl" :value="payUrl" type="text" readonly :aria-label="t('payLinkTitle')" @focus="$event.target.select()" />
                <HeroButton :primary="!payUrl" iconClass="fas fa-link" :label="t(payUrl ? 'payLinkCopy' : 'payLinkCreate')" :disabled="busy" @click="copyPayLink" />
            </div>
        </section>

        <!-- By email to the client, the PDF attached (a quote with its contract: both, from its path) -->
        <p v-if="doc.options?.mailedAt" class="billing-actions__note text-body-s">{{ t('billMailedAt', { date: sentDate(doc.options.mailedAt) }) }}</p>
        <div class="billing-actions__buttons">
            <HeroButton v-if="doc.status !== 'cancelled'" :primary="doc.type === 'invoice' && !doc.options?.mailedAt" iconClass="fas fa-paper-plane"
                :label="t(doc.options?.mailedAt ? 'billMailAgain' : 'billMailSend')" :disabled="busy" @click="mail" />
            <HeroButton iconClass="fas fa-download" :label="t('billDownloadPdf')" :disabled="busy" @click="emit('download')" />
            <HeroButton iconClass="fas fa-copy" :label="t('billDuplicate')" :disabled="busy" @click="duplicate" />
            <HeroButton v-if="doc.status !== 'cancelled'" iconClass="fas fa-ban" :label="t('billCancelDoc')" :disabled="busy" @click="cancel" />
        </div>
    </div>
</template>

<script setup>
import { currentTimeZone, todayIso } from '@/utils/display.js'
import { computed, reactive, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import BillingFlow from '@/components/views/Admin/Billing/BillingFlow.vue'
import { useLang } from '@/composables/useLang.js'
import { useBillingStore } from '@/stores/billing.js'
import { paymentState } from '@/utils/billing.js'
import { useDocumentMail } from '@/composables/useDocumentMail.js'
import { showConfirm, showFailure, showSuccess } from '@/utils/dialog.js'

const props = defineProps({
    doc: { type: Object, required: true },
    busy: Boolean,
})
const emit = defineEmits(['download', 'download-both', 'open', 'busy'])

const lang = useLang()
const t = lang.getTranslation
const billing = useBillingStore()
const METHODS = ['transfer', 'card', 'stripe', 'cash', 'check', 'other']
const money = value => new Intl.NumberFormat(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: props.doc.currency || 'EUR' }).format(Number(value) || 0)

const state = computed(() => paymentState(props.doc, props.doc.netToPay))
// The quote this document was made from
const quote = computed(() => props.doc.quoteId ? billing.documents.find(d => d.id === props.doc.quoteId) || null : null)
// New payment: today, what remains
const payment = reactive({ date: '', amount: 0, method: 'transfer', note: '' })
const resetPayment = () => Object.assign(payment, { date: todayIso(), amount: state.value.remaining, method: 'transfer', note: '' })
watch(() => props.doc, resetPayment, { immediate: true })

// Runs an action of the store, shows its result
const run = async (action, opened = false) => {
    emit('busy', true)
    const res = await action()
    emit('busy', false)
    if (!res.success) return showFailure(res.error || t('billError'))
    showSuccess(t('billSaved'))
    if (opened) emit('open', res.document.id)
    return res
}

const setStatus = status => run(() => billing.setStatus(props.doc.id, status))
// A payment recorded: the client gets the invoice by email at once, with a thank you (nothing sent without an address)
const addPayment = async () => {
    const res = await run(() => billing.addPayment(props.doc.id, { ...payment }))
    if (res?.document && props.doc.client?.email) mailed(await documentMail.send([res.document], 'paid'))
}
const removePayment = id => run(() => billing.removePayment(props.doc.id, id))
const duplicate = () => run(() => billing.duplicate(props.doc.id), true)

// Online payment of an invoice with something left to pay (a quote has its link in its path: BillingFlow)
const canPayOnline = computed(() => props.doc.type === 'invoice' && props.doc.status === 'final' && state.value.remaining > 0)
const payUrl = computed(() => props.doc.payToken ? `${useRuntimeConfig().public.frontendDomain}/pay-me/?doc=${props.doc.payToken}` : '')
// Makes the link the first time, then copies it to send it to the client
const copyPayLink = async () => {
    emit('busy', true)
    const res = props.doc.payToken ? { success: true } : await billing.payLink(props.doc.id)
    emit('busy', false)
    if (!res.success) return showFailure(res.error || t('billError'))
    try {
        await navigator.clipboard.writeText(payUrl.value || res.url)
        showSuccess(t('payLinkCopied'))
    } catch {
        showSuccess(t('payLinkReady'))
    }
}

// Sent to the client, the PDF attached; asked first (who gets it)
const documentMail = useDocumentMail()
const mailed = res => res.success ? showSuccess(t('billMailSent', { email: res.sentTo })) : showFailure(t(res.error || 'billMailFailed'))
const sentDate = iso => new Date(iso).toLocaleString(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: currentTimeZone() })
const mail = async () => {
    const email = props.doc.client?.email
    if (!email) return showFailure(t('billMailNoEmail'))
    if (!(await showConfirm(t('billMailConfirm', { number: props.doc.number, email })))) return
    emit('busy', true)
    const res = await documentMail.send([props.doc], 'documents')
    emit('busy', false)
    mailed(res)
}

const cancel = async () => {
    if (await showConfirm(t('billCancelConfirm'))) run(() => billing.setStatus(props.doc.id, 'cancelled'))
}
</script>
