<template>
    <!-- Header of the contract, like the quotes and invoices: the bar of the site (logo, address), then the opening
         of a section (mint label with the number, large title, the quote it comes from) -->
    <header class="contract-header">
        <div class="contract-header__bar">
            <img class="contract-header__logo" :src="companyLogo" width="200" height="80" alt="Logo" title="Logo" />
            <span class="contract-header__label">{{ siteHost }}</span>
        </div>
        <p class="contract-header__label contract-header__label--mint">
            {{ t('contractTitle') }} · {{ contractNumber || (contractIndex ? t('contractNumber', { year: contractYear, index: contractIndex }) : t('billDraft')) }}
        </p>
        <h1 class="contract-header__title">{{ title || t('contractTitle') }}</h1>
        <p v-if="quoteNumber" class="contract-header__quote">{{ t('billQuote') }} {{ quoteNumber }}</p>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()

const props = defineProps({
    companyLogo: String,
    contractYear: { type: Number, default: 0 },
    contractIndex: String,
    // CO-2026-0001 (empty for a draft)
    contractNumber: { type: String, default: '' },
    // Number of the quote the contract comes from, the service as the title
    quoteNumber: { type: String, default: '' },
    title: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
})

const siteHost = computed(() => String(props.websiteUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, ''))
</script>

<style scoped>
.contract-header {
    margin-bottom: 22px;
}

.contract-header__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 26px;
}

.contract-header__logo {
    width: 120px;
    height: auto;
}

.contract-header__label {
    margin: 0;
    color: #a4b0b8;
    font-family: var(--font-label);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
}

.contract-header__label--mint {
    color: #7ee6a8;
}

.contract-header__title {
    max-width: 560px;
    margin: 8px 0 6px;
    font-family: var(--font-display);
    font-size: 24px;
    font-stretch: 125%;
    font-weight: 600;
    line-height: 1.05;
    text-transform: uppercase;
}

.contract-header__quote {
    margin: 0;
    color: #a4b0b8;
    font-size: 11px;
}
</style>
