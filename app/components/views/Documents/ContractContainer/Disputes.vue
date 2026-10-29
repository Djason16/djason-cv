<template>
    <!-- Disputes article of the contract: applicable law, payment disputes (chargeback) and competent court -->
    <section class="section">
        <h3 class="section-title text-large text-bold">13. {{ t('disputes') }}</h3>
        <p class="section-text text-small">{{ t('disputesIntro') }}</p>
        <p class="section-text text-small">{{ t('frenchLaw') }}</p>

        <p class="section-subtitle text-small"><strong>13bis. {{ t('chargebackDispute') }}</strong>
        </p>
        <p class="section-text text-small">{{ t('chargebackInfo') }}</p>
        <ul class="bullet-list text-small">
            <!-- Subscription: what happens to the next installments -->
            <template v-if="isSubscription">
                <li>{{ t('chargebackContinue') }}</li>
                <li>{{ t('chargebackNoNewCharge') }}</li>
                <li>{{ t('chargebackCancel') }}</li>
            </template>
            <li v-else>{{ t('chargebackOneTime') }}</li>
            <li>{{ t('chargebackEvidence') }}</li>
        </ul>
        <p class="section-text text-small">{{ t('mediationFirst') }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

// Paid in monthly installments (Stripe subscription)
defineProps({ isSubscription: Boolean })
</script>

<style scoped>
.section-subtitle {
    color: var(--third-color);
    margin: 16px 0 8px 0;
}
</style>
