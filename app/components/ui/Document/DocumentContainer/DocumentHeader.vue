<template>
    <!-- Header: logo, document info, company details -->
    <div class="header">
        <div class="left-header">
            <img :src="companyLogo" alt="Logo" class="logo" />

            <!-- Document metadata: date, number, validity -->
            <div class="document-info text-small text-bold">
                <div>{{ $lang.getTranslation('date') }}: {{ formatDate(issueDate) }}</div>
                <div>{{ documentNumber }}</div>
                <div v-if="isQuoteType">{{ $lang.getTranslation('validUntil') }}: {{ formatDate(quoteValidityDate) }}
                </div>
            </div>

            <!-- Company details: website, address, SIRET, TVA, contact -->
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
</template>

<script setup>
import { useNuxtApp } from '#app'

// Props for header info and company details
const props = defineProps({
    issueDate: String,
    documentNumber: String,
    quoteValidityDate: String,
    isQuoteType: Boolean,
    companyLogo: String,
    companyWebsite: String,
    companyAddress: String,
    companySiret: String,
    hasTVA: Boolean,
    companyTvaNumber: String,
    companyPhone: String,
    companyEmail: String
})

const { $lang } = useNuxtApp()

// Format date according to locale
const formatDate = d => d
    ? new Date(d).toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''
</script>

<style scoped>
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

.document-info {
    color: var(--text-color-dark);
    text-align: end;
}

.company-details a {
    color: var(--accent-blue);
}

.company-details {
    color: var(--text-color-dark);
}
</style>