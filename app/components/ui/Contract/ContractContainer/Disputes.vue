<template>
    <!-- Disputes section: introduces legal framework and applicable law -->
    <section class="section">
        <h3 class="section-title text-large text-bold">13. {{ $lang.getTranslation('disputes') }}</h3>
        <p class="section-text text-small">{{ $lang.getTranslation('disputesIntro') }}</p>
        <p class="section-text text-small">{{ $lang.getTranslation('frenchLaw') }}</p>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app'

// Access $lang globally
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