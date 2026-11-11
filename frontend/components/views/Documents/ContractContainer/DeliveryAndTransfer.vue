<template>
    <!-- Delivery and transfer article of the contract, depending on the service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">6. {{ t('deliveryAndTransfer') }}</h3>
        <p class="section-text text-small">{{ getDeliveryText(serviceType) }}</p>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()
defineProps({
    serviceType: { type: String, default: '' },
    getDeliveryText: { type: Function as PropType<(type: string) => string>, required: true },
})

// Access lang globally
</script>
