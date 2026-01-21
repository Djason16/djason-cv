<template>
    <div class="contract-container">
        <div class="content">
            <!-- Header -->
            <ContractHeader :companyLogo="companyLogo" :contractYear="contractYear" :contractIndex="contractIndex" />

            <!-- Client & Provider Info -->
            <GeneralInformation :providerInfo="providerInfo" :client="client" :hasTVA="hasTVA"
                :formatFullAddress="formatFullAddress" :getClientTypeLabel="getClientTypeLabel"
                :websiteUrl="websiteUrl" />

            <!-- Contract object -->
            <ContractObject :serviceType="serviceType" :getServiceLabel="getServiceLabel"
                :contractObjectText="$lang.getTranslation('contractObjectText')"
                :detailsInQuote="$lang.getTranslation('detailsInQuote')" />

            <!-- Duration -->
            <Duration :serviceType="serviceType" :getDurationText="getDurationText" />

            <!-- Payment terms -->
            <PaymentTerms :totalAmount="totalAmount" :deposit="deposit" :nbMensualites="nbMensualites"
                :monthlyPayment="monthlyPayment" :serviceType="serviceType" :formatPrice="formatPrice"
                :websiteUrl="websiteUrl" :providerInfo="providerInfo" />

            <!-- Other contract sections -->
            <LatePayment />
            <DeliveryAndTransfer :serviceType="serviceType" :getDeliveryText="getDeliveryText" />
            <IntellectualProperty :serviceType="serviceType"
                :getIntellectualPropertyText="getIntellectualPropertyText" />
            <TerminationAndSuspension :serviceType="serviceType" :getTerminationText="getTerminationText" />
            <RightOfWithdrawal :serviceType="serviceType" :getRefundPolicyText="getRefundPolicyText"
                :providerInfo="providerInfo" />
            <Confidentiality />
            <WarrantiesAndMaintenance :serviceType="serviceType" :getWarrantyText="getWarrantyText" />
            <Liability />
            <Disputes />
            <TCIntegration :websiteUrl="websiteUrl" />

            <!-- Signatures and footer -->
            <Signatures :client="client" :providerInfo="providerInfo" :hasTVA="hasTVA" :contractDate="contractDate"
                :providerCity="providerCity" :formatDate="formatDate" />
            <ContractFooter :providerInfo="providerInfo" :hasTVA="hasTVA" />
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import { useProviderInfo } from '~/composables/useProviderInfo'
import Confidentiality from './ContractContainer/Confidentiality.vue'
import ContractFooter from './ContractContainer/ContractFooter.vue'
import ContractHeader from './ContractContainer/ContractHeader.vue'
import ContractObject from './ContractContainer/ContractObject.vue'
import DeliveryAndTransfer from './ContractContainer/DeliveryAndTransfer.vue'
import Disputes from './ContractContainer/Disputes.vue'
import Duration from './ContractContainer/Duration.vue'
import GeneralInformation from './ContractContainer/GeneralInformation.vue'
import IntellectualProperty from './ContractContainer/IntellectualProperty.vue'
import LatePayment from './ContractContainer/LatePayment.vue'
import Liability from './ContractContainer/Liability.vue'
import PaymentTerms from './ContractContainer/PaymentTerms.vue'
import RightOfWithdrawal from './ContractContainer/RightOfWithdrawal.vue'
import Signatures from './ContractContainer/Signatures.vue'
import TCIntegration from './ContractContainer/TCIntegration.vue'
import TerminationAndSuspension from './ContractContainer/TerminationAndSuspension.vue'
import WarrantiesAndMaintenance from './ContractContainer/WarrantiesAndMaintenance.vue'

// Props with defaults
const props = defineProps({
    client: Object,
    contractDate: { type: String, default: () => new Date().toISOString() },
    contractYear: { type: Number, default: () => new Date().getFullYear() },
    contractIndex: { type: String, default: '0001' },
    serviceType: { type: String, default: 'web' },
    totalAmount: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    nbMensualites: { type: Number, default: 0 },
    monthlyPayment: { type: Number, default: 0 },
    hasTVA: { type: Boolean, default: false },
    bankInfo: { type: Object, default: () => ({ iban: null, bic: null }) }
})

// Nuxt app & config
const { $lang } = useNuxtApp()
const config = useRuntimeConfig()

// Reactive provider info
const providerInfo = useProviderInfo(props.bankInfo)

// Static info
const companyLogo = '/images/main_logo_dark.png'
const websiteUrl = config.public.frontendDomain
const providerCity = providerInfo.address.split(',')[0].trim()

// Formatting helpers
const formatFullAddress = c =>
    [c.address, c.postal_code + ' ' + c.city].filter(Boolean).join(', ')
const formatPrice = v =>
    $lang.locale.value === 'fr'
        ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
        : `$${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = d =>
    new Date(d).toLocaleDateString(
        $lang.locale.value === 'fr' ? 'fr-FR' : 'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    )

// Label getters using $lang translations
const getClientTypeLabel = type => $lang.getTranslation(`clientType_${type}`)
const getServiceLabel = type => $lang.getTranslation(`service_${type}`)
const getDurationText = type => $lang.getTranslation(`duration_${type}`)
const getDeliveryText = type => $lang.getTranslation(`delivery_${type}`)
const getIntellectualPropertyText = type => $lang.getTranslation(`intellectualProperty_${type}`)
const getTerminationText = type => $lang.getTranslation(`termination_${type}`)
const getRefundPolicyText = type => $lang.getTranslation(`refundPolicy_${type}`)
const getWarrantyText = type => $lang.getTranslation(`warranty_${type}`)
</script>

<style scoped>
.contract-container {
    max-width: 210mm;
    margin: auto;
    background: var(--zero-color);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.content {
    padding: 40px 50px;
    color: var(--text-color-dark);
}

@media print {
    body {
        background: var(--zero-color);
        padding: 0;
    }

    .contract-container {
        box-shadow: none;
        margin: 0;
    }
}
</style>