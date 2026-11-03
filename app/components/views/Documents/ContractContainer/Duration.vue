<template>
    <!-- Duration article of the contract, depending on the service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">3. {{ t('duration') }}</h3>
        <p class="section-text text-small">{{ getDurationText(serviceType) }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
defineProps({
    serviceType: String,
    getDurationText: Function
})
</script>
