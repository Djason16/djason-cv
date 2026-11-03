<template>
    <!-- Termination and suspension article of the contract -->
    <section class="section">
        <h3 class="section-title text-large text-bold">8. {{ t('terminationAndSuspension') }}</h3>
        <p class="section-text text-small">{{ getTerminationText(serviceType) }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    serviceType: String,
    getTerminationText: Function
})
</script>
