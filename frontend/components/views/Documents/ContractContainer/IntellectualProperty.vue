<template>
    <!-- Intellectual property article of the contract: rights and portfolio use -->
    <section class="section">
        <h3 class="section-title text-large text-bold">7. {{ t('intellectualProperty') }}</h3>
        <p class="section-text text-small">{{ getIntellectualPropertyText(serviceType) }}</p>
        <p class="section-text text-small">{{ t('portfolioRight') }}</p>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()
defineProps({
    serviceType: { type: String, default: '' },
    getIntellectualPropertyText: { type: Function as PropType<(type: string) => string>, required: true },
})
</script>
