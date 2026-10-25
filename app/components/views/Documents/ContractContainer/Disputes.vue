<template>
    <!-- Disputes article of the contract: applicable law and competent court -->
    <section class="section">
        <h3 class="section-title text-large text-bold">13. {{ t('disputes') }}</h3>
        <p class="section-text text-small">{{ t('disputesIntro') }}</p>
        <p class="section-text text-small">{{ t('frenchLaw') }}</p>

        <p class="section-subtitle text-small"><strong>13bis. {{ t('chargebackDispute') }}</strong>
        </p>
        <p class="section-text text-small">{{ t('chargebackInfo') }}</p>
        <ul class="bullet-list text-small">
            <li>{{ t('chargebackContinue') }}</li>
            <li>{{ t('chargebackNoNewCharge') }}</li>
            <li>{{ t('chargebackCancel') }}</li>
            <li>{{ t('chargebackEvidence') }}</li>
        </ul>
        <p class="section-text text-small">{{ t('mediationFirst') }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
;

// Access lang globally
</script>

<style scoped>
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px
}

.section-text {
    text-align: justify;
    margin-bottom: 16px;
    line-height: 1.8
}

.section-subtitle {
    color: var(--third-color);
    margin: 16px 0 8px 0;
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