<template>
    <!-- Warranties & Maintenance section: shows warranty info for the selected service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">11. {{ $lang.getTranslation('warrantiesAndMaintenance') }}</h3>
        <p class="section-text text-small">{{ getWarrantyText(serviceType) }}</p>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app'
const { $lang } = useNuxtApp()

const props = defineProps({
    serviceType: String,
    getWarrantyText: Function
})
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