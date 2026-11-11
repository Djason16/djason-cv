<template>
    <!-- Termination and suspension article of the contract -->
    <section class="section">
        <h3 class="section-title text-large text-bold">8. {{ t('terminationAndSuspension') }}</h3>
        <p class="section-text text-small">{{ getTerminationText(serviceType) }}</p>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()

defineProps({
    serviceType: { type: String, default: '' },
    getTerminationText: { type: Function as PropType<(type: string) => string>, required: true },
})
</script>
