<template>
    <!-- Contract printed to PDF (utils/pdf.js): one component per article, in order -->
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
                :contractObjectText="t('contractObjectText')"
                :detailsInQuote="t('detailsInQuote')" />

            <!-- Duration -->
            <Duration :serviceType="serviceType" :getDurationText="getDurationText" />

            <!-- Payment terms -->
            <PaymentTerms :totalAmount="totalAmount" :deposit="deposit" :nbMensualites="nbMensualites"
                :monthlyPayment="monthlyPayment" :serviceType="serviceType" :formatPrice="formatPrice"
                :calculateStripeFees="calculateStripeFees" :websiteUrl="websiteUrl" :providerInfo="providerInfo" />

            <!-- Other contract sections -->
            <LatePayment :interestRate="interestRate" :clientType="client?.type" />
            <DeliveryAndTransfer :serviceType="serviceType" :getDeliveryText="getDeliveryText" />
            <IntellectualProperty :serviceType="serviceType"
                :getIntellectualPropertyText="getIntellectualPropertyText" />
            <TerminationAndSuspension :serviceType="serviceType" :getTerminationText="getTerminationText" />
            <RightOfWithdrawal :serviceType="serviceType" :getRefundPolicyText="getRefundPolicyText"
                :providerInfo="providerInfo" />
            <Confidentiality :providerInfo="providerInfo" />
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
import { useSite } from '@/composables/useSite.js'
import { documentProvider, formatPrice as formatDocumentPrice } from '@/utils/documents.js'
import { useLang } from '@/composables/useLang.js'
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
    interestRate: { type: Number, default: null },
    hasTVA: { type: Boolean, default: false },
    bankInfo: { type: Object, default: () => ({ iban: null, bic: null }) }
})

// Nuxt app & config
const lang = useLang()
const { getTranslation: t } = lang
const config = useRuntimeConfig()
const site = useSite()

// Reactive provider info
const providerInfo = documentProvider(config, props.bankInfo)

// Static info
const companyLogo = '/images/main_logo_dark.png'
const websiteUrl = site.url
const providerCity = providerInfo.address.split(',')[0].trim()

// Formatting helpers
const formatFullAddress = c =>
    [c.address, c.postal_code + ' ' + c.city].filter(Boolean).join(', ')
const formatPrice = v => formatDocumentPrice(v, lang.current.value)
const formatDate = d =>
    new Date(d).toLocaleDateString(
        lang.current.value === 'fr' ? 'fr-FR' : 'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    )

// Label getters using lang translations
const getClientTypeLabel = type => lang.getTranslation(`clientType_${type}`)
const getServiceLabel = type => lang.getTranslation(`service_${type}`)
const getDurationText = type => lang.getTranslation(`duration_${type}`)
const getDeliveryText = type => lang.getTranslation(`delivery_${type}`)
const getIntellectualPropertyText = type => lang.getTranslation(`intellectualProperty_${type}`)
const getTerminationText = type => lang.getTranslation(`termination_${type}`)
const getRefundPolicyText = type => lang.getTranslation(`refundPolicy_${type}`)
const getWarrantyText = type => lang.getTranslation(`warranty_${type}`)
</script>
