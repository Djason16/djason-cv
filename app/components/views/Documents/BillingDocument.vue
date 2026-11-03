<!-- A quote or an invoice (admin > Quotes & invoices): the live preview of the editor and the PDF (utils/pdf.js).
In the style of the site (its ink, light texts, mint labels): Archivo titles, Barlow Condensed texts, thin rules. Style: assets/css/components/billing-document.css -->
<template>
    <article class="billing-document" :class="{ 'is-draft': doc.status === 'draft' }">
        <!-- Top bar, like the header of the site: the logo, the address of the site -->
        <div class="bd-bar">
            <img class="bd-logo" src="/images/main_logo_light.png" width="200" height="80" :alt="provider.name" :title="provider.name" />
            <span class="bd-label">{{ siteHost }}</span>
        </div>

        <!-- Like the opening of a section: a mint label, a large title, the dates -->
        <header class="bd-head">
            <p class="bd-label bd-label--mint">{{ t(kindKey) }} — {{ doc.number || t('billDraft') }}</p>
            <h1 class="bd-title">{{ doc.title || t(kindKey) }}</h1>
            <dl class="bd-dates">
                <div><dt class="bd-label">{{ t('billIssued') }}</dt><dd>{{ date(doc.issueDate) }}</dd></div>
                <div v-if="doc.type === 'quote'"><dt class="bd-label">{{ t('billValidUntil') }}</dt><dd>{{ date(validUntil) }}</dd></div>
                <div v-else-if="doc.dueDate"><dt class="bd-label">{{ t('billDue') }}</dt><dd>{{ date(doc.dueDate) }}</dd></div>
                <!-- Invoice: the date of the service (or of the deposit), and the nature of the operation -->
                <div v-if="doc.type === 'invoice'"><dt class="bd-label">{{ t(doc.kind === 'deposit' ? 'billDepositDate' : 'billServiceDate') }}</dt><dd>{{ date(doc.options?.serviceDate || doc.issueDate) }}</dd></div>
                <div><dt class="bd-label">{{ t('billNature') }}</dt><dd>{{ t('billNatureServices') }}</dd></div>
                <div><dt class="bd-label">{{ t('billNetToPay') }}</dt><dd>{{ money(doc.type === 'invoice' ? remaining : totals.netToPay) }}</dd></div>
            </dl>
        </header>

        <!-- Who sends it, who receives it: two cards side by side, the same information on the same line (SIRET facing SIRET...) -->
        <div class="bd-parties">
            <p class="bd-label bd-label--mint">{{ t('billFrom') }}</p>
            <p class="bd-label bd-label--mint">{{ t('billTo') }}</p>
            <template v-for="row in partyRows" :key="row.key">
                <p :class="`is-${row.key}`" :style="row.key === 'name' ? { fontSize: partyNameSize(row.from) } : null">{{ row.from }}</p>
                <p :class="`is-${row.key}`" :style="row.key === 'name' ? { fontSize: partyNameSize(row.to) } : null">{{ row.to }}</p>
            </template>
        </div>

        <!-- Lines -->
        <table class="bd-lines">
            <thead>
                <tr>
                    <th class="bd-index">#</th>
                    <th>{{ t('billDescription') }}</th>
                    <th class="num">{{ t('billQuantity') }}</th>
                    <th class="num">{{ t('billUnitPrice') }}</th>
                    <th v-if="hasVat" class="num">{{ t('billVat') }}</th>
                    <th class="num">{{ t('billLineTotal') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(line, i) in doc.lines" :key="i">
                    <td class="bd-index">{{ padIndex(i) }}</td>
                    <td>
                        <span class="bd-line-name">{{ line.description || '—' }}</span>
                        <span v-if="line.details" class="bd-line-details">{{ line.details }}</span>
                    </td>
                    <td class="num">{{ number(line.quantity) }}<template v-if="line.unit">&nbsp;{{ line.unit }}</template></td>
                    <td class="num">{{ money(line.unitPrice) }}</td>
                    <td v-if="hasVat" class="num">{{ percent(line.vatRate) }}</td>
                    <td class="num">{{ money(lineTotal(line)) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Totals, then the net to pay in large letters -->
        <section class="bd-totals">
            <dl>
                <div v-if="totals.discount"><dt>{{ t('billSubtotal') }}</dt><dd>{{ money(totals.subtotal) }}</dd></div>
                <div v-if="totals.discount"><dt>{{ t('billDiscount') }}<template v-if="doc.discountType === 'percent'"> ({{ number(doc.discountValue) }} %)</template></dt><dd>− {{ money(totals.discount) }}</dd></div>
                <div><dt>{{ t(hasVat ? 'billTotalHT' : 'billTotal') }}</dt><dd>{{ money(totals.totalHT) }}</dd></div>
                <div v-for="(amount, rate) in vatRates" :key="rate"><dt>{{ t('billVat') }} {{ percent(rate) }}</dt><dd>{{ money(amount) }}</dd></div>
                <div v-if="hasVat"><dt>{{ t('billTotalTTC') }}</dt><dd>{{ money(totals.totalTTC) }}</dd></div>
                <div v-for="d in doc.deductions" :key="d.number"><dt>{{ t('billDeducted', { number: d.number }) }}</dt><dd>− {{ money(d.amount) }}</dd></div>
                <div v-if="doc.type === 'invoice' && paid"><dt>{{ t('billPaid') }}</dt><dd>− {{ money(paid) }}</dd></div>
            </dl>
            <p class="bd-net">
                <span class="bd-label">{{ t(doc.type === 'quote' ? 'billTotalToPay' : 'billNetToPay') }}</span>
                <strong>{{ money(doc.type === 'invoice' ? remaining : totals.netToPay) }}</strong>
            </p>
        </section>

        <!-- Quote: how it will be paid (deposit, schedule, monthly payments) -->
        <section v-if="doc.type === 'quote' && steps.length > 1" class="bd-block">
            <p class="bd-label bd-label--mint">{{ t('billPaymentPlan') }}</p>
            <table class="bd-steps">
                <tr v-for="step in steps" :key="step.key">
                    <td>{{ stepLabel(step) }}</td>
                    <td class="num">{{ number(step.percent) }} %</td>
                    <td class="num">{{ step.dueDate ? date(step.dueDate) : t('billOnDelivery') }}</td>
                    <td class="num strong">{{ money(step.amount) }}</td>
                </tr>
            </table>
        </section>

        <!-- Invoice: payments already received -->
        <section v-if="doc.type === 'invoice' && doc.payments?.length" class="bd-block">
            <p class="bd-label bd-label--mint">{{ t('billPaymentsReceived') }}</p>
            <table class="bd-steps">
                <tr v-for="p in doc.payments" :key="p.id">
                    <td>{{ date(p.date) }}</td>
                    <td>{{ t(`billMethod_${p.method}`) }}</td>
                    <td class="num strong">{{ money(p.amount) }}</td>
                </tr>
            </table>
        </section>

        <!-- Payment, bank, legal notices -->
        <section class="bd-block bd-terms" :class="{ 'has-sign': doc.type === 'quote' }">
            <div>
                <!-- Bank transfer: only when offered (showBank) -->
                <template v-if="showBank">
                    <p class="bd-label">{{ t('billBankTransfer') }}</p>
                    <p>IBAN {{ bank.iban }}<template v-if="bank.bic"> · BIC {{ bank.bic }}</template></p>
                </template>
                <!-- Its own payment link once made (a link in the PDF), otherwise the payment page of the site (an invoice), by card;
                     nothing for an invoice already paid -->
                <template v-if="!(doc.type === 'invoice' && remaining <= 0) && (payUrl || (doc.type === 'invoice' && siteHost))">
                    <!-- Under the bank transfer: a space above it; alone: on the line of the conditions -->
                    <p class="bd-label" :class="{ 'bd-label--spaced': showBank }">{{ t('billPayOnline') }}</p>
                    <p v-if="payUrl" class="bd-paylink"><a :href="payUrl" :title="payUrl">{{ payUrl.replace(/^https?:\/\//, '') }}</a></p>
                    <p v-else>{{ siteHost }}/pay-me</p>
                </template>
            </div>
            <div>
                <p class="bd-label">{{ t('billConditions') }}</p>
                <p v-if="doc.type === 'quote'">{{ t('billQuoteValidity', { days: doc.validityDays || 30 }) }}</p>
                <p v-if="!hasVat">{{ t('billNoVat') }}</p>
                <p>{{ rate !== null ? t('billLatePenaltiesRate', { penalty: percent(rate * 3), legal: percent(rate) }) : t('billLatePenalties') }}<template v-if="isProfessional">{{ ' ' + t('billRecoveryFee') }}</template></p>
                <p>{{ t('billNoDiscount') }}</p>
            </div>
            <!-- Quote: room for the signature of the client, beside the terms -->
            <div v-if="doc.type === 'quote'" class="bd-sign">
                <p class="bd-label">{{ t('billAgreement') }}</p>
                <p>{{ t('billAgreementText') }}</p>
                <div class="bd-sign-box"></div>
                <!-- What the signature means: the terms read and accepted; a consumer: the start asked before the 14 days end -->
                <p class="bd-sign-note">{{ t('billCgvAccepted', { url: termsUrl }) }}</p>
                <!-- The box to tick drawn (a "☐" is not in the fonts of the site: the PDF would leave a gap) -->
                <p v-if="!isProfessional" class="bd-sign-note"><span class="doc-tick" aria-hidden="true"></span>{{ t('billEarlyStart') }}</p>
            </div>
            <p v-if="doc.notes" class="bd-notes">{{ doc.notes }}</p>
        </section>

        <!-- Bottom bar, like the one of the opening of the site: the mint dot, the name, the address of the site -->
        <footer class="bd-foot">
            <span class="bd-label"><span class="bd-dot"></span>{{ provider.name }} EI<template v-if="provider.siret">{{ ' · SIRET ' + provider.siret }}</template></span>
            <span class="bd-label">Web · Vidéo · VFX</span>
        </footer>
    </article>
</template>

<script setup>
import { computed } from 'vue'
import { documentTotals, lineTotal, paymentState, planSteps, quoteValidUntil, vatByRate } from '@/utils/billing.js'
import { isProfessionalType } from '@/utils/clientTypes.js'
import { alignRows, padIndex, partyNameSize } from '@/utils/display.js'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'

const props = defineProps({
    // Document of the API (DocumentsHelper): type, kind, number, lines, paymentPlan, deductions, payments...
    doc: { type: Object, required: true },
    // Client of the document: its copy once finalized, the live one for a draft
    clientInfo: { type: Object, default: () => ({}) },
    bank: { type: Object, default: () => ({}) },
})

const lang = useLang()
const t = lang.getTranslation
const site = useSite()
const provider = computed(() => ({ name: site.name, email: site.email, phone: site.phone, siret: site.siret, tva: site.tva, address: site.address, invoiceAddress: site.invoiceAddress }))
const siteHost = computed(() => String(site.url || '').replace(/^https?:\/\//, '').replace(/\/$/, ''))
// Payment link of this document (admin → Payment link), printed as a link in the PDF
// Address of the terms (CGV) printed under the signature of a quote
const termsUrl = computed(() => `${siteHost.value || 'djason-chery.dev'}/terms`)
const payUrl = computed(() => props.doc.payToken && site.url ? `${String(site.url).replace(/\/$/, '')}/pay-me/?doc=${props.doc.payToken}` : '')

const client = computed(() => props.doc.client || props.clientInfo || {})

// The information of both parties line by line (utils/display.js alignRows): what both have face to face, the rest under it
const partyRows = computed(() => {
    const p = provider.value, c = client.value
    const clientAddress = [c.address, [c.postalCode, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
    const rows = [
        // "EI" after the name of a sole proprietor: required on every professional document
        { key: 'name', from: p.name ? `${p.name} EI` : '', to: c.name || '—' },
        { key: 'address', from: p.invoiceAddress || p.address, to: clientAddress },
        { key: 'siret', from: p.siret && `SIRET ${p.siret}`, to: c.siret && `SIRET ${c.siret}` },
        { key: 'vat', from: hasVat.value && p.tva ? `${t('billVatNumber')} ${p.tva}` : '', to: c.tva ? `${t('billVatNumber')} ${c.tva}` : '' },
        { key: 'email', from: p.email, to: c.email },
        { key: 'phone', from: p.phone, to: c.phone },
        // The person to contact at the client, last: nothing faces it on the side of the provider
        { key: 'contact', from: '', to: c.contact },
    ]
    // The names always face each other, even when one is missing
    return [rows[0], ...alignRows(rows.slice(1))]
})
const isProfessional = computed(() => isProfessionalType(client.value.type))
const totals = computed(() => documentTotals(props.doc))
const vatRates = computed(() => vatByRate(props.doc))
const hasVat = computed(() => (props.doc.lines || []).some(l => Number(l.vatRate) > 0))
const steps = computed(() => planSteps(props.doc.paymentPlan, totals.value.totalTTC, props.doc.issueDate))
const state = computed(() => paymentState(props.doc, totals.value.netToPay))
const paid = computed(() => state.value.paid)
const remaining = computed(() => state.value.remaining)
const validUntil = computed(() => quoteValidUntil(props.doc.issueDate, props.doc.validityDays || 30))
// Legal interest rate of the day of the document (admin > Rates): the penalties are three times this rate
const rate = computed(() => props.doc.options?.interestRate ?? null)
// The bank transfer only when offered on this document (card only otherwise); a document made before the choice keeps it
const showBank = computed(() => Boolean(props.bank.iban) && (props.doc.options?.allowTransfer ?? props.doc.status !== 'draft'))

// Name of the document: quote, invoice, deposit invoice, installment invoice, balance invoice
const kindKey = computed(() => props.doc.type === 'quote' ? 'billQuote' : `billInvoice_${props.doc.kind || 'standard'}`)

const locale = computed(() => lang.current.value === 'fr' ? 'fr-FR' : 'en-GB')
const money = value => new Intl.NumberFormat(locale.value, { style: 'currency', currency: props.doc.currency || 'EUR' }).format(Number(value) || 0)
const number = value => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(Number(value) || 0)
const percent = rate => `${number(Number(rate) * 100)} %`
const date = value => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(locale.value, { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
// Name of a step: the one written by the admin, "Installment 2/12" for a monthly payment, else deposit / balance / at once
const stepLabel = step => {
    if (/^\d+\/\d+$/.test(step.label)) return `${t('billStep_installment')} ${step.label}`
    return step.label && !['deposit', 'balance', 'full'].includes(step.label) ? step.label : t(`billStep_${step.kind}`)
}
</script>
