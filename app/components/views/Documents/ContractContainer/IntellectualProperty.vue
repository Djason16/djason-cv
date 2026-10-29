<template>
    <!-- Intellectual property article of the contract: rights and portfolio use -->
    <section class="section">
        <h3 class="section-title text-large text-bold">7. {{ t('intellectualProperty') }}</h3>
        <p class="section-text text-small">{{ getIntellectualPropertyText(serviceType) }}</p>
        <p class="section-text text-small">{{ t('portfolioRight') }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
defineProps({
    serviceType: String,
    getIntellectualPropertyText: Function
})
</script>
