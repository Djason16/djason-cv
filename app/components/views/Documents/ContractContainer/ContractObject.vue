<template>
    <!-- Object article of the contract: the service and what it includes -->
    <section class="section">
        <h3 class="section-title text-large text-bold">2. {{ t('contractObject') }}</h3>
        <p class="section-text text-small">{{ contractObjectText }}</p>
        <div class="service-list text-small">
            <strong>{{ getServiceLabel(serviceType) }}</strong>
        </div>
        <p class="section-text text-small">{{ detailsInQuote }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    serviceType: String,
    getServiceLabel: Function,
    contractObjectText: String,
    detailsInQuote: String
})
</script>

<style scoped>
/* Services of the contract */
.service-list {
    margin: 12px 0 16px 20px;
    line-height: 1.8;
    position: relative;
    padding-left: 20px;
}

.service-list::before {
    content: "• ";
    position: absolute;
    left: 0;
    font-weight: bold;
}
</style>
