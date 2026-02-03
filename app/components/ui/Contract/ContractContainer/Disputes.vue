<template>
    <!-- Disputes section: introduces legal framework and applicable law -->
    <section class="section">
        <h3 class="section-title text-large text-bold">13. {{ $lang.getTranslation('disputes') }}</h3>
        <p class="section-text text-small">{{ $lang.getTranslation('disputesIntro') }}</p>
        <p class="section-text text-small">{{ $lang.getTranslation('frenchLaw') }}</p>

        <p class="section-subtitle text-small"><strong>13bis. {{ $lang.getTranslation('chargebackDispute') }}</strong>
        </p>
        <p class="section-text text-small">{{ $lang.getTranslation('chargebackInfo') }}</p>
        <ul class="bullet-list text-small">
            <li>{{ $lang.getTranslation('chargebackContinue') }}</li>
            <li>{{ $lang.getTranslation('chargebackNoNewCharge') }}</li>
            <li>{{ $lang.getTranslation('chargebackCancel') }}</li>
            <li>{{ $lang.getTranslation('chargebackEvidence') }}</li>
        </ul>
        <p class="section-text text-small">{{ $lang.getTranslation('mediationFirst') }}</p>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app';

// Access $lang globally
const { $lang } = useNuxtApp()
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