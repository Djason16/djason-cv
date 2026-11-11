<template>
    <!-- Duration article of the contract, depending on the service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">3. {{ t('duration') }}</h3>
        <p class="section-text text-small">{{ getDurationText(serviceType) }}</p>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()
defineProps({
    serviceType: { type: String, default: '' },
    getDurationText: { type: Function as PropType<(type: string) => string>, required: true },
})
</script>
