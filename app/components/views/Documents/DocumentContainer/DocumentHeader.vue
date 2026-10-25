<template>
    <!-- Header of the quote or invoice: logo, document number and dates, provider details -->
    <div class="header">
        <div class="left-header">
            <img :src="companyLogo" alt="Logo" class="logo" />

            <!-- Document metadata: date, number, validity -->
            <div class="document-info text-small text-bold">
                <div>{{ t('date') }}: {{ formatDate(issueDate) }}</div>
                <div>{{ documentNumber }}</div>
                <div v-if="isQuoteType">{{ t('validUntil') }}: {{ formatDate(quoteValidityDate) }}
                </div>
            </div>

            <!-- Company details: website, address, SIRET, TVA, contact -->
            <div class="company-details text-small">
                <a :href="companyWebsite">{{ companyWebsite }}</a><br />
                {{ companyAddress }}<br />
                SIRET: {{ companySiret }}<br />
                <span v-if="hasTVA">{{ t('tva') }}: {{ companyTvaNumber }}</span>
                <span v-else>{{ t('tvaNotApplicable') }}</span><br />
                {{ companyPhone }}<br />
                {{ companyEmail }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
;

defineProps({
    issueDate: { type: String, default: '' },
    documentNumber: { type: String, default: '' },
    quoteValidityDate: { type: String, default: '' },
    isQuoteType: { type: Boolean, default: false },
    companyLogo: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    companySiret: { type: [String, Number], default: '' },
    hasTVA: { type: Boolean, default: false },
    companyTvaNumber: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyEmail: { type: String, default: '' }
})

const lang = useLang()
const { getTranslation: t } = lang

// Formats date according to locale
const formatDate = d => d
    ? new Date(d).toLocaleDateString(lang.current.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
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