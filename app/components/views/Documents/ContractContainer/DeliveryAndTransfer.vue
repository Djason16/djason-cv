<template>
    <!-- Delivery and transfer article of the contract, depending on the service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">6. {{ t('deliveryAndTransfer') }}</h3>
        <p class="section-text text-small">{{ getDeliveryText(serviceType) }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
defineProps({
    serviceType: String,
    getDeliveryText: Function
})

// Access lang globally
</script>
