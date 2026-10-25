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
;

defineProps({
    providerInfo: Object
})
</script>

<style scoped>
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px;
}

.section-text {
    text-align: justify;
    margin-bottom: 16px;
    line-height: 1.8
}

.section-subtitle {
    color: var(--third-color);
    margin: 16px 0 8px 0;
    font-weight: 700;
}

.bullet-list {
    list-style: none;
    padding-left: 20px;
    margin: 0 0 16px 0;
    line-height: 1.8
}

.bullet-list li {
    margin-bottom: 8px;
    text-align: justify;
    position: relative;
    padding-left: 20px;
}

.bullet-list li::before {
    content: "• ";
    position: absolute;
    left: 0;
    font-weight: bold;
}
</style>
