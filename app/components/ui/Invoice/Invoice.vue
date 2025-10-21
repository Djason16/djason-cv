<template>
    <div class="invoice-container">
        <div class="content">

            <!-- Header: logo, invoice info, company details -->
            <div class="header">
                <div class="left-header">
                    <img :src="companyLogo" alt="Logo" class="logo" />
                    <div class="invoice-info text-small text-bold">
                        <div>{{ $lang.getTranslation('date') }}: {{ formatDate(issueDate) }}</div>
                        <div>{{ invoiceNumber }}</div>
                    </div>
                    <div class="company-details text-small">
                        <a :href="companyWebsite">{{ companyWebsite }}</a><br />
                        {{ companyAddress }}<br />
                        SIRET: {{ companySiret }}<br />
                        <span v-if="hasTVA">{{ $lang.getTranslation('tva') }}: {{ companyTvaNumber }}</span>
                        <span v-else>{{ $lang.getTranslation('tvaNotApplicable') }}</span><br />
                        {{ companyPhone }}<br />
                        {{ companyEmail }}
                    </div>
                </div>
            </div>

            <!-- Client info -->
            <div class="client-section text-small">
                <div class="client-name text-bold">{{ client.name }}</div>
                <div>{{ formatFullAddress(client) }}</div>
                <div v-if="client.siret">SIRET: {{ client.siret }}</div>
                <div>{{ client.phone }}</div>
                <div>{{ client.email }}</div>
            </div>

            <!-- Delivery address for companies/freelance -->
            <div v-if="!sameAsClientAddress && deliveryAddress && isCompanyOrFreelance(client.type)"
                class="delivery-section text-small">
                <strong>{{ $lang.getTranslation('deliveryAddress') }}:</strong> {{ deliveryAddress }}
            </div>

            <!-- Invoice metadata -->
            <div class="object-line text-small">
                <div v-if="description"><strong>{{ $lang.getTranslation('object') }}:</strong> {{ description }}</div>
                <div><strong>{{ $lang.getTranslation('type') }}:</strong> {{ translatedInvoiceType }}</div>
                <div><strong>{{ $lang.getTranslation('operation') }}:</strong> {{ operationNature }}</div>
                <div v-if="orderRef"><strong>{{ $lang.getTranslation('orderRef') }}:</strong> {{ orderRef }}</div>
            </div>

            <!-- Items table -->
            <table class="items-table text-small">
                <thead>
                    <tr>
                        <th v-if="isIndividualType(client.type)">{{ $lang.getTranslation('description') }}</th>
                        <th v-else>{{ $lang.getTranslation('date') }}</th>
                        <th v-if="!isIndividualType(client.type)">{{ $lang.getTranslation('hours') }}</th>
                        <th v-if="!isIndividualType(client.type)">{{ $lang.getTranslation('mission') }}</th>
                        <th>{{ $lang.getTranslation('qty') }}</th>
                        <th>{{ $lang.getTranslation('unitPriceHt') }}</th>
                        <th v-if="hasTVA">{{ $lang.getTranslation('tva') }}</th>
                        <th>{{ $lang.getTranslation('amountHt') }}</th>
                        <th v-if="hasTVA">{{ $lang.getTranslation('amountTtc') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in items" :key="i">
                        <td v-if="isIndividualType(client.type)">{{ item.name }}</td>
                        <td v-else>{{ item.date || '' }}</td>
                        <td v-if="!isIndividualType(client.type)">{{ item.hours || '' }}</td>
                        <td v-if="!isIndividualType(client.type)">{{ item.mission || '' }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ formatPrice(item.unitPrice) }}</td>
                        <td v-if="hasTVA">{{ item.tvaApplicable ? tvaRateLabel : $lang.getTranslation('no') }}</td>
                        <td>{{ formatPrice(item.unitPrice * item.quantity) }}</td>
                        <td v-if="hasTVA">{{ formatPrice(calculateItemTTC(item)) }}</td>
                    </tr>
                    <tr v-if="!items.length">
                        <td :colspan="getColspan()" class="text-bold">{{ $lang.getTranslation('noItems') }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals-section">
                <table class="totals-table text-small">
                    <tr>
                        <td class="text-bold">{{ $lang.getTranslation('totalHt') }}</td>
                        <td class="text-bold">{{ formatPrice(totalHT) }}</td>
                    </tr>
                    <tr v-if="hasTVA">
                        <td class="text-bold">{{ $lang.getTranslation('totalTva') }}</td>
                        <td class="text-bold">{{ formatPrice(totalTVA) }}</td>
                    </tr>
                    <tr v-if="hasTVA">
                        <td class="text-bold">{{ $lang.getTranslation('totalTtc') }}</td>
                        <td class="text-bold">{{ formatPrice(totalTTC) }}</td>
                    </tr>
                    <tr>
                        <td class="text-bold">{{ $lang.getTranslation('currency') }}</td>
                        <td class="text-bold">{{ currency }}</td>
                    </tr>

                    <!-- Individual deposits & installments -->
                    <template v-if="isIndividualType(client.type) && deposit > 0">
                        <tr>
                            <td class="text-bold">{{ $lang.getTranslation('paid') }}</td>
                            <td class="text-bold">{{ formatPrice(deposit) }}</td>
                        </tr>
                        <tr v-if="remainingToPay > 0">
                            <td class="text-bold">{{ $lang.getTranslation('remaining') }}</td>
                            <td class="text-bold">{{ formatPrice(remainingToPay) }}</td>
                        </tr>
                        <tr v-if="nbMensualites > 0 && remainingToPay > 0">
                            <td class="text-bold">{{ $lang.getTranslation('installments') }} ({{ nbMensualites }} {{
                                $lang.getTranslation('months') }})</td>
                            <td class="text-bold">{{ formatPrice(monthlyPayment) }}</td>
                        </tr>
                    </template>

                    <!-- Company month concerned -->
                    <template v-else>
                        <tr>
                            <td class="text-bold">{{ $lang.getTranslation('monthConcerned') }}</td>
                            <td class="text-bold">{{ monthConcerned }}</td>
                        </tr>
                    </template>
                </table>
            </div>

            <!-- Legal & payment -->
            <div v-if="showLegalText" class="legal-text text-small">{{ legalText }}</div>
            <div v-if="showPaymentConditions" class="payment-conditions text-small">
                <strong>{{ $lang.getTranslation('paymentMethod') }}:</strong> {{ paymentMethod }}<br />
                <span v-if="isIndividualType(client.type)">
                    <strong>{{ $lang.getTranslation('termsInvoice') }}:</strong> {{ paymentTerms }}<br />
                </span>
                <strong>{{ $lang.getTranslation('due') }}:</strong> {{ isIndividualType(client.type) && nbMensualites >
                    0 ? monthlyPaymentInfo : paymentDue }}
            </div>

            <!-- Bank info -->
            <table v-if="bankInfo" class="bank-table text-small">
                <thead>
                    <tr>
                        <th>IBAN</th>
                        <th>BIC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ bankInfo.iban }}</td>
                        <td>{{ bankInfo.bic }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Signature -->
            <div class="signature-section text-bold text-small">{{ signerName }}</div>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import { personalInfo } from '~/utils/personalInfo'

const props = defineProps({
    type: { type: String, default: 'invoice' },
    client: { type: Object, required: true },
    items: { type: Array, default: () => [] },
    issueDate: { type: String, default: new Date().toISOString() },
    description: { type: String, default: '' },
    deposit: { type: Number, default: 0 },
    monthConcerned: { type: String, default: '' },
    invoiceType: { type: String, default: 'invoice' },
    deliveryAddress: { type: String, default: '' },
    sameAsClientAddress: { type: Boolean, default: true },
    orderRef: { type: String, default: '' },
    customInvoiceNumber: { type: String, default: '' },
    customPaymentDue: { type: String, default: '' },
    nbMensualites: { type: Number, default: 0 },
    monthlyPayment: { type: Number, default: 0 },
    remainingToPay: { type: Number, default: 0 }
})

const isIndividualType = t => t === 'individual'
const isCompanyType = t => t === 'company'
const isFreelanceType = t => t === 'freelance'
const isCompanyOrFreelance = t => isCompanyType(t) || isFreelanceType(t)

const config = useRuntimeConfig()
const { invoiceAddress: companyAddress, siret: companySiret, tvaNumber: companyTvaNumber, phone: companyPhone, email: companyEmail, name: signerName, bank: bankInfo } = personalInfo
const companyLogo = '/images/main_logo_dark.png'
const companyWebsite = config.public.frontendDomain
const { $lang } = useNuxtApp()
const currency = computed(() => ($lang.locale.value === 'fr' ? 'EUR' : 'USD'))

const TVA_RATE = 0.2
const tvaRateLabel = '20%'
const hasTVA = computed(() => props.items.some(i => i.tvaApplicable))

const calculateItemTTC = i => (i.unitPrice * i.quantity) * (i.tvaApplicable ? 1 + TVA_RATE : 1)
const totalHT = computed(() => props.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0))
const totalTVA = computed(() => props.items.reduce((sum, i) => sum + (i.tvaApplicable ? i.unitPrice * i.quantity * TVA_RATE : 0), 0))
const totalTTC = computed(() => hasTVA.value ? totalHT.value + totalTVA.value : totalHT.value)

// Important : utiliser la valeur transmise pour rester cohérent avec le calcul dans downloadInvoice
const remainingToPay = computed(() => props.remainingToPay)
const deposit = computed(() => props.deposit)
const nbMensualites = computed(() => props.nbMensualites)
const monthlyPayment = computed(() => props.monthlyPayment)

const formatFullAddress = c => [c.address, c.postal_code, c.city].filter(Boolean).join(', ')
const formatPrice = v => $lang.locale.value === 'fr'
    ? (v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
    : '$' + (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = d => new Date(d).toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' })
const getColspan = () => 5 + (isCompanyOrFreelance(props.client.type) ? 3 : 0) + (hasTVA.value ? 1 : 0)

const invoiceNumber = computed(() => props.customInvoiceNumber || (() => {
    const y = new Date(props.issueDate).getFullYear()
    return props.type === 'quotes' ? `DE-${y}-0001` : isIndividualType(props.client.type) ? `CL-${y}-0001` : `FA-${y}-0001`
})())
const operationNature = $lang.getTranslation('serviceProvision')
const legalText = $lang.getTranslation('latePaymentNotice')
const paymentMethod = $lang.getTranslation('bankTransfer')
const paymentTerms = $lang.getTranslation('asPerContractTerms')
const paymentDue = computed(() => props.customPaymentDue ? $lang.getTranslation('paymentDueBy', { date: props.customPaymentDue }) : $lang.getTranslation('seeContractConditions'))
const showLegalText = true
const showPaymentConditions = true
const translatedInvoiceType = computed(() => {
    if (!props.invoiceType) return ''
    const key = props.invoiceType.toLowerCase()
    if (key === 'invoice' || key === 'quote') {
        const translated = $lang.getTranslation(key)
        return translated !== key ? translated : props.invoiceType
    }
    return props.invoiceType
})

// Calcul du message des mensualités avec date formatée
const monthlyPaymentInfo = computed(() => {
    if (!isIndividualType(props.client.type) || props.nbMensualites <= 0) return ''
    if (!$lang.locale.value) return ''

    // Date première mensualité formatée
    const firstPaymentDateStr = props.customPaymentDue || new Date().toISOString().slice(0, 10)
    const [dayStr, monthStr, yearStr] = firstPaymentDateStr.split('/')
    const firstPaymentDate = new Date(`${yearStr}-${monthStr}-${dayStr}`)

    const formattedStartDate = firstPaymentDate.toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return $lang.getTranslation('monthlyPaymentStartInfo', {
        startDate: formattedStartDate,
        day: firstPaymentDate.getDate(),
        months: props.nbMensualites
    })
})
</script>

<style scoped>
.invoice-container {
    max-width: 210mm;
    min-height: 297mm;
    margin: auto;
    background: var(--zero-color);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.content {
    padding: 40px 50px;
}

.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 50px;
}

.left-header {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.logo {
    width: 130px;
}

.invoice-info,
.company-details,
.client-section,
.delivery-section,
.object-line,
.legal-text,
.payment-conditions {
    color: var(--text-color-dark);
}

.invoice-info,
.client-section,
.delivery-section,
.items-table td:last-child,
.totals-table td:last-child {
    text-align: right;
}

.company-details a {
    color: var(--accent-blue);
}

table {
    border-collapse: collapse;
}

.client-section,
.delivery-section,
.object-line,
.items-table,
.totals-table,
.bank-table,
.legal-text,
.payment-conditions {
    margin-bottom: 25px;
}

.items-table th,
.items-table td,
.totals-table td,
.bank-table th,
.bank-table td {
    padding: 8px 12px;
    border: 1px solid var(--second-color);
    color: var(--text-color-dark);
}

.items-table th {
    background: var(--third-color);
    color: var(--text-color-light);
    text-align: left;
}

.totals-section {
    display: flex;
    justify-content: flex-end;
}

.totals-table {
    width: 380px;
}

.totals-table td:first-child {
    background: #f7f9fb;
}

.legal-text {
    line-height: 1.6;
    text-align: justify;
}

.items-table,
.bank-table {
    width: 100%;
}

.bank-table th,
.bank-table td,
.signature-section {
    text-align: center;
}

.bank-table th {
    background: var(--third-color);
    color: var(--text-color-light);
    letter-spacing: .05em;
}

.bank-table td {
    background: var(--zero-color);
}

.signature-section {
    color: var(--third-color);
}

@media print {
    body {
        background: var(--zero-color);
        padding: 0;
    }

    .invoice-container {
        box-shadow: none;
        margin: 0;
    }
}
</style>