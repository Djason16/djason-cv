<template>
    <!-- Intellectual property section: rights and portfolio usage -->
    <section class="section">
        <h3 class="section-title text-large text-bold">7. {{ $lang.getTranslation('intellectualProperty') }}</h3>
        <p class="section-text text-small">{{ getIntellectualPropertyText(serviceType) }}</p>
        <p class="section-text text-small">{{ $lang.getTranslation('portfolioRight') }}</p>
    </section>
</template>

<script setup>
const props = defineProps({
    serviceType: String,
    getIntellectualPropertyText: Function
})

import { useNuxtApp } from '#app';
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