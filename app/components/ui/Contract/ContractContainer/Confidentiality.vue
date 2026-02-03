<template>
    <!-- Confidentiality section with GDPR compliance notice -->
    <section class="section">
        <h3 class="section-title text-large text-bold">10. {{ $lang.getTranslation('confidentiality') }}</h3>
        <p class="section-text text-small">{{ $lang.getTranslation('confidentialityIntro') }}</p>
        <p class="section-text text-small">{{ $lang.getTranslation('gdprCompliance') }}</p>

        <p class="section-subtitle text-small"><strong>{{ $lang.getTranslation('paymentProcessing') }}</strong></p>
        <p class="section-text text-small">{{ $lang.getTranslation('stripePartner') }}</p>
        <p class="section-text text-small">{{ $lang.getTranslation('stripeCollects') }}:</p>
        <ul class="bullet-list text-small">
            <li>{{ $lang.getTranslation('stripeData1') }}</li>
            <li>{{ $lang.getTranslation('stripeData2') }}</li>
            <li>{{ $lang.getTranslation('stripeData3') }}</li>
        </ul>
        <p class="section-text text-small">
            {{ $lang.getTranslation('stripeCompliance') }}<br />
            {{ $lang.getTranslation('stripePrivacy') }}
        </p>
        <p class="section-text text-small">
            {{ $lang.getTranslation('dataAccess', { email: providerInfo.email }) }}
        </p>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app';
const { $lang } = useNuxtApp()

const props = defineProps({
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
