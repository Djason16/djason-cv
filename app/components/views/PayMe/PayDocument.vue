<template>
    <!-- Pay me page opened from the payment link of a quote or an invoice (/pay-me/?doc=...): the document, the amount set by it
         (not editable), the email of the receipt, then Stripe Checkout. The server saves the payment on the document. -->
    <div class="pay-document">
        <div v-if="loading" class="pay-document__card is-loading text-body">{{ t('payDocLoading') }}</div>

        <div v-else-if="!doc" class="pay-document__card">
            <p class="eyebrow">{{ t('payDocUnknownLabel') }}</p>
            <p class="text-body">{{ t('payDocUnknown') }}</p>
        </div>

        <template v-else>
            <div class="pay-document__card">
                <p class="eyebrow">{{ t(doc.type === 'quote' ? 'billQuote' : `billInvoice_${doc.kind || 'standard'}`) }} · {{ doc.number }}</p>
                <h3 class="pay-document__title text-display-s">{{ doc.title || doc.number }}</h3>
                <p v-if="doc.client" class="pay-document__client text-body-s">{{ t('payDocFor', { name: doc.client }) }}</p>
                <dl class="pay-document__amounts">
                    <div>
                        <dt class="text-label">{{ t('payDocTotal') }}</dt>
                        <dd class="text-body">{{ money(doc.total) }}</dd>
                    </div>
                    <div>
                        <dt class="text-label">{{ t(amountKey) }}</dt>
                        <dd class="pay-document__due text-display-s">{{ money(doc.amount) }}</dd>
                    </div>
                </dl>
                <!-- A quote in several steps: every step, its date, paid or not -->
                <PaySchedule v-if="doc.steps?.length > 1" :steps="doc.steps" :current="doc.step || ''" :money="money" />
                <p v-if="doc.autopay?.active" class="pay-document__autopay text-body-s">{{ t('payDocAutopayOn', { card: doc.autopay.card }) }}</p>
            </div>

            <!-- Its PDF, the same file as the one of the admin, drawn here (opened from the email of a payment: at once) -->
            <div class="payment-buttons">
                <HeroButton :primary="doc.amount <= 0" iconClass="fas fa-download" :label="t('payDocDownload')" :disabled="downloading" @click="download" />
            </div>

            <!-- Paid: nothing left to pay -->
            <p v-if="doc.amount <= 0" class="pay-document__done text-body">{{ t('payDocPaid') }}</p>

            <template v-else>
                <div class="form-group text-label">
                    <label for="pay-doc-email">{{ t('payMeEmailAddress') }}</label>
                    <FormInput id="pay-doc-email" v-model="email" type="email" :placeholder="t('payMeEnterEmail')" autocomplete="email" required
                        :aria-label="t('payMeEmailAddress')" @enter="pay" />
                </div>
                <!-- Automatic debit of the next steps on their dates: only when the client ticks it (their agreement) -->
                <label v-if="doc.canAutopay && !doc.autopay?.active" class="pay-document__consent text-body-s">
                    <input v-model="autopay" type="checkbox" />
                    <span>{{ t('payDocAutopayConsent', { name: site.name || '' }) }}</span>
                </label>
                <div class="payment-buttons">
                    <HeroButton primary iconClass="fas fa-credit-card" :label="t('payDocButton', { amount: money(doc.amount) })" :disabled="paying" @click="pay" />
                </div>
            </template>
        </template>

        <MessageBox :message="translatedMessage" />
        <NuxtLink :to="withTrailingSlash('/pay-me')" :title="t('payDocOther')" class="pay-document__other text-body-s">{{ t('payDocOther') }} →</NuxtLink>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import FormInput from '@/components/ui/Form/FormInput.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import PaySchedule from '@/components/views/PayMe/PaySchedule.vue'
import { useSite } from '@/composables/useSite.js'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { api } from '@/utils/api.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'

const props = defineProps({
    token: { type: String, required: true },
    // Opened from the email of a payment (&pdf=1): its PDF downloaded at once
    autoPdf: Boolean,
})
const lang = useLang()
const t = lang.getTranslation
const { translatedMessage, showMessage, clearMessage } = useMessage()

const doc = ref(null)
const loading = ref(true)
const paying = ref(false)
const email = ref('')
// The client agrees to the automatic debit of the next steps (ticked by them, never by default)
const autopay = ref(false)
const site = useSite()

const money = value => new Intl.NumberFormat(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: doc.value?.currency || 'EUR' }).format(Number(value) || 0)
// What the amount is: what is left on an invoice, the deposit / installment / whole of a quote
const amountKey = computed(() => doc.value?.type === 'invoice' ? 'payDocRemaining' : `payDocStep_${doc.value?.stepKind || 'standard'}`)

const load = async () => {
    const res = await api.get(`/stripe/document?token=${encodeURIComponent(props.token)}`)
    doc.value = res.success ? res.document : null
    if (doc.value && !email.value) email.value = doc.value.email || ''
    loading.value = false
}
onMounted(async () => {
    await load()
    if (props.autoPdf && doc.value) download()
})

// The whole document of the link, drawn as the PDF of the admin (the template loaded only when asked)
const downloading = ref(false)
const download = async () => {
    downloading.value = true
    try {
        const res = await api.get(`/stripe/document-file?token=${encodeURIComponent(props.token)}`)
        if (!res.success) throw new Error('unknown')
        const [{ pdfOptions }, { exportPdf }] = await Promise.all([import('@/utils/documentPdf.js'), import('@/utils/pdf.js')])
        await exportPdf(pdfOptions(res.document, {}, res.bank || {}))
    } catch {
        showMessage('error', 'documentFailed', 0)
    }
    downloading.value = false
}

// Stripe Checkout in a popup; once it is closed the server checks the payment and saves it on the document
const pay = async () => {
    clearMessage()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value || '')) return showMessage('error', 'invalidEmail', 0)
    paying.value = true
    const session = await api.post('/stripe/create-checkout', { token: props.token, email: email.value, autopay: autopay.value, language: lang.current.value })
    if (!session.success || !session.url) {
        paying.value = false
        return showMessage('error', session.error === 'payLinkNothing' ? 'payDocPaid' : 'checkoutError', 0)
    }
    const popup = window.open(session.url, 'Stripe Checkout', 'width=500,height=700,resizable,scrollbars=yes,status=1')
    const timer = setInterval(async () => {
        if (popup && !popup.closed) return
        clearInterval(timer)
        const res = await api.get(`/stripe/check-payment?sessionId=${encodeURIComponent(session.sessionId)}`)
        paying.value = false
        if (!res.success) return showMessage('error', 'unknownError', 0)
        showMessage(res.paid ? 'success' : 'error', res.paid ? (autopay.value ? 'payDocThanksAutopay' : 'payDocThanks') : 'cancelPayment', res.paid ? 8000 : 0)
        if (res.paid) load()
    }, 1000)
}
</script>

<style scoped>
.pay-document {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 560px;
}

/* The document: its label in mint, its title, its amounts, on the panel of the site */
.pay-document__card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.5rem 1.75rem;
    border-left: 2px solid var(--accent);
    background: var(--panel);
}

.pay-document__card .eyebrow {
    color: var(--accent);
}

.pay-document__card.is-loading {
    color: var(--fg-muted);
}

.pay-document__title,
.pay-document__client {
    margin: 0;
}

.pay-document__client {
    color: var(--fg-muted);
}

.pay-document__amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2.5rem;
    margin: 0.75rem 0 0;
    padding-top: 1rem;
    border-top: 1px solid var(--line);
}

.pay-document__amounts dd {
    margin: 0.3rem 0 0;
}

.pay-document__due {
    color: var(--accent);
}

.pay-document__done {
    margin: 0;
    color: var(--accent);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.payment-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

/* The agreement to the automatic debit: a checkbox and its text */
.pay-document__consent {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: var(--fg-muted);
    cursor: pointer;
}

.pay-document__consent input {
    flex-shrink: 0;
    margin-top: 0.2rem;
    accent-color: var(--accent);
}

.pay-document__autopay {
    margin: 0.5rem 0 0;
    color: var(--accent);
}

.pay-document__other {
    color: var(--fg-muted);
}
</style>
