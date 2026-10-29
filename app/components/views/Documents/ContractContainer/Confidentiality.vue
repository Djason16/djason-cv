<template>
    <!-- Confidentiality article of the contract, with the GDPR notice -->
    <section class="section">
        <h3 class="section-title text-large text-bold">10. {{ t('confidentiality') }}</h3>
        <p class="section-text text-small">{{ t('confidentialityIntro') }}</p>
        <p class="section-text text-small">{{ t('gdprCompliance') }}</p>

        <p class="section-subtitle text-small"><strong>{{ t('paymentProcessing') }}</strong></p>
        <p class="section-text text-small">{{ t('stripePartner') }}</p>
        <p class="section-text text-small">{{ t('stripeCollects') }}:</p>
        <ul class="bullet-list text-small">
            <li>{{ t('stripeData1') }}</li>
            <li>{{ t('stripeData2') }}</li>
            <li>{{ t('stripeData3') }}</li>
        </ul>
        <p class="section-text text-small">
            {{ t('stripeCompliance') }}<br />
            {{ t('stripePrivacy') }}
        </p>
        <p class="section-text text-small">
            {{ t('dataAccess', { email: providerInfo.email }) }}
        </p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    providerInfo: Object
})
</script>

<style scoped>
.section-subtitle {
    color: var(--third-color);
    margin: 16px 0 8px 0;
    font-weight: 700;
}
</style>
