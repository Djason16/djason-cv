<template>
    <div class="document-container">
        <div class="content">
            <!-- Header with company & document info -->
            <DocumentHeader :issueDate="issueDate" :documentNumber="documentNumber"
                :quoteValidityDate="quoteValidityDate" :isQuoteType="isQuoteType" :companyLogo="companyLogo"
                :companyWebsite="companyWebsite" :companyAddress="providerInfo.invoiceAddress"
                :companySiret="providerInfo.siret" :hasTVA="hasTVA" :companyTvaNumber="providerInfo.tvaNumber"
                :companyPhone="providerInfo.phone" :companyEmail="providerInfo.email" />

            <!-- Client details -->
            <ClientInfo :client="client" />

            <!-- Delivery address for companies/freelancers if different from client -->
            <DeliveryAddress v-if="!sameAsClientAddress && deliveryAddress && isCompanyOrFreelance(client.type)"
                :deliveryAddress="deliveryAddress" :clientType="client.type" />

            <!-- Document metadata -->
            <DocumentMeta :description="description" :documentType="documentType" :operationNature="operationNature"
                :orderRef="orderRef" :translatedDocumentType="translatedDocumentType" />

            <!-- Table of items -->
            <ItemsTable :items="items" :clientType="client.type" :tvaRateLabel="tvaRateLabel" :hasTVA="hasTVA"
                :calculateItemTTC="calculateItemTTC" />

            <!-- Totals and financial summary -->
            <TotalsSection :clientType="client.type" :totalHT="totalHT" :totalTVA="totalTVA" :totalTTC="totalTTC"
                :finalTotal="finalTotal" :isQuoteType="isQuoteType" :deposit="deposit" :nbMensualites="nbMensualites"
                :amountPaid="amountPaid" :remainingToPay="remainingToPay" :monthlyPayment="monthlyPayment"
                :monthConcerned="monthConcerned" :currency="currency" />

            <!-- Legal notices -->
            <LegalText :showLegalText="showLegalText" :isQuoteType="isQuoteType" :legalText="legalText"
                :quoteLegalText="quoteLegalText" />

            <!-- Payment options only for individual quotes -->
            <PaymentOptions v-if="isQuoteType && isIndividualType(client.type) && paymentOptions"
                :paymentOptions="paymentOptions" />

            <!-- Payment conditions for invoices -->
            <PaymentConditions v-if="showPaymentConditions && !isQuoteType" :paymentMethod="paymentMethod"
                :nbMensualites="nbMensualites" :monthlyPaymentInfo="monthlyPaymentInfo" :paymentDue="paymentDue"
                :clientType="client.type" />

            <!-- Bank info and signatures -->
            <BankInfo v-if="providerInfo.bank.iban || providerInfo.bank.bic" :bankInfo="providerInfo.bank" />
            <QuoteSignature v-if="isQuoteType" />
            <CompanySignature :signerName="providerInfo.name" />
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import { useProviderInfo } from '~/composables/useProviderInfo'
import BankInfo from './DocumentContainer/BankInfo.vue'
import ClientInfo from './DocumentContainer/ClientInfo.vue'
import CompanySignature from './DocumentContainer/CompanySignature.vue'
import DeliveryAddress from './DocumentContainer/DeliveryAddress.vue'
import DocumentHeader from './DocumentContainer/DocumentHeader.vue'
import DocumentMeta from './DocumentContainer/DocumentMeta.vue'
import ItemsTable from './DocumentContainer/ItemsTable.vue'
import LegalText from './DocumentContainer/LegalText.vue'
import PaymentConditions from './DocumentContainer/PaymentConditions.vue'
import PaymentOptions from './DocumentContainer/PaymentOptions.vue'
import QuoteSignature from './DocumentContainer/QuoteSignature.vue'
import TotalsSection from './DocumentContainer/TotalsSection.vue'

const props = defineProps({
    type: String, client: Object, items: Array, issueDate: String,
    description: String, deposit: Number, monthConcerned: String,
    documentType: String, deliveryAddress: String, sameAsClientAddress: Boolean,
    orderRef: String, customDocumentNumber: String, customPaymentDue: String,
    nbMensualites: Number, monthlyPayment: Number, remainingToPay: Number,
    amountPaid: Number, quoteValidityDays: Number, paymentOptions: Object,
    bankInfo: { type: Object, default: () => ({ iban: null, bic: null }) }
})

// Type check helpers
const isIndividualType = t => t === 'individual'
const isCompanyType = t => t === 'company'
const isFreelanceType = t => t === 'freelance'
const isCompanyOrFreelance = t => isCompanyType(t) || isFreelanceType(t)
const isQuoteType = computed(() => props.documentType === 'quote')

// Nuxt app & config
const { $lang } = useNuxtApp()
const config = useRuntimeConfig()

// Reactive provider info
const providerInfo = useProviderInfo(props.bankInfo)

// Static info
const companyLogo = '/images/main_logo_dark.png'
const companyWebsite = config.public.frontendDomain
const currency = computed(() => $lang.locale.value === 'fr' ? 'EUR' : 'USD')

// TVA & financial calculations
const TVA_RATE = 0.2
const tvaRateLabel = '20%'
const hasTVA = computed(() => props.items.some(i => i.tvaApplicable))
const calculateItemTTC = i => i.unitPrice * i.quantity * (i.tvaApplicable ? 1 + TVA_RATE : 1)
const totalHT = computed(() => props.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))
const totalTVA = computed(() => props.items.reduce((s, i) => s + (i.tvaApplicable ? i.unitPrice * i.quantity * TVA_RATE : 0), 0))
const totalTTC = computed(() => hasTVA.value ? totalHT.value + totalTVA.value : totalHT.value)
const finalTotal = computed(() => hasTVA.value ? totalTTC.value : totalHT.value)

// Document number
const documentNumber = computed(() => props.customDocumentNumber || (() => {
    const y = new Date(props.issueDate).getFullYear()
    return isQuoteType.value ? `DE-${y}-0001` : isIndividualType(props.client.type) ? `CL-${y}-0001` : `FA-${y}-0001`
})())

// Quote validity calculation
const quoteValidityDate = computed(() => {
    if (!isQuoteType.value) return ''
    const d = new Date(props.issueDate)
    d.setDate(d.getDate() + props.quoteValidityDays)
    return d.toISOString()
})

// Static texts
const operationNature = $lang.getTranslation('serviceProvision')
const legalText = $lang.getTranslation('latePaymentNotice')
const quoteLegalText = computed(() => $lang.getTranslation('quoteValidityNotice', { days: props.quoteValidityDays }))
const paymentMethod = $lang.getTranslation('bankTransfer')

// Payment due formatting
const paymentDue = computed(() => {
    if (!props.customPaymentDue) return $lang.getTranslation('seeContractConditions')
    const parts = props.customPaymentDue.includes('/') ? props.customPaymentDue.split('/') : props.customPaymentDue.split('-')
    let date = parts.length === 3 ? (props.customPaymentDue.includes('/') ? new Date(+parts[2], parts[1] - 1, +parts[0]) : new Date(+parts[0], parts[1] - 1, +parts[2])) : new Date(props.customPaymentDue)
    const f = date.toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    return $lang.getTranslation('paymentDueBy', { date: f })
})

const showLegalText = true, showPaymentConditions = true

// Translate document type intelligently
const translatedDocumentType = computed(() => {
    if (!props.documentType) return ''
    const k = props.documentType.toLowerCase()
    const t = $lang.getTranslation(k)
    return (k === 'invoice' || k === 'quote') && (t !== k) ? t : props.documentType
})

// Monthly payment info for individuals
const monthlyPaymentInfo = computed(() => {
    if (!isIndividualType(props.client.type) || props.nbMensualites <= 0) return ''
    const firstDateStr = props.customPaymentDue || new Date().toISOString().slice(0, 10)
    const firstDate = new Date(firstDateStr.split('/').reverse().join('-')) || new Date(firstDateStr)
    return $lang.getTranslation('monthlyPaymentStartInfo', { startDate: firstDate.toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), day: firstDate.getDate(), months: props.nbMensualites })
})
</script>

<style scoped>
.document-container {
    max-width: 210mm;
    height: auto;
    margin: auto;
    background: var(--zero-color);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.content {
    padding: 40px 50px;
}

@media print {
    body {
        background: var(--zero-color);
        padding: 0;
    }

    .document-container {
        box-shadow: none;
        margin: 0;
    }
}
</style>