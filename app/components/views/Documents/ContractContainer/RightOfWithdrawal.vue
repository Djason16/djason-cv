<template>
    <!-- Right of withdrawal article of the contract: withdrawal period and refunds -->
    <section class="section">
        <h3 class="section-title text-large text-bold">9. {{ t('rightOfWithdrawal') }}</h3>
        <p class="section-text text-small">{{ t('withdrawalIntro') }}</p>
        <p class="section-text text-small">{{ getRefundPolicyText(serviceType) }}</p>
        <p class="section-text text-small">
            {{ t('refundRequestInfo', { email: providerInfo.email }) }}
        </p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    serviceType: String,
    getRefundPolicyText: Function,
    providerInfo: Object
})
</script>
