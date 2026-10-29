<template>
    <!-- Warranties and maintenance article of the contract, depending on the service -->
    <section class="section">
        <h3 class="section-title text-large text-bold">11. {{ t('warrantiesAndMaintenance') }}</h3>
        <p class="section-text text-small">{{ getWarrantyText(serviceType) }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    serviceType: String,
    getWarrantyText: Function
})
</script>
