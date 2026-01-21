<template>
    <!-- Delivery & transfer section: displays delivery info based on service type -->
    <section class="section">
        <h3 class="section-title text-large text-bold">6. {{ $lang.getTranslation('deliveryAndTransfer') }}</h3>
        <p class="section-text text-small">{{ getDeliveryText(serviceType) }}</p>
    </section>
</template>

<script setup>
// Props: service type and delivery text getter
const props = defineProps({
    serviceType: String,
    getDeliveryText: Function
})

// Access $lang globally
import { useNuxtApp } from '#app'
const { $lang } = useNuxtApp()
</script>

<style scoped>
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px
}

.section-text {
    text-align: justify;
    margin-bottom: 16px;
    line-height: 1.8
}
</style>