<template>
    <!-- Warranties and maintenance article of the contract, depending on the service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">11. {{ t('warrantiesAndMaintenance') }}</h3>
        <p class="section-text text-small">{{ getWarrantyText(serviceType) }}</p>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()

defineProps({
    serviceType: { type: String, default: '' },
    getWarrantyText: { type: Function as PropType<(type: string) => string>, required: true },
})
</script>
