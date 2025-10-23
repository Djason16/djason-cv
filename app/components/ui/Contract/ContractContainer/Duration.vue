<template>
    <!-- Duration section: displays the service duration based on type -->
    <section class="section">
        <h3 class="section-title text-large text-bold">3. {{ $lang.getTranslation('duration') }}</h3>
        <p class="section-text text-small">{{ getDurationText(serviceType) }}</p>
    </section>
</template>

<script setup>
const props = defineProps({
    serviceType: String,
    getDurationText: Function
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