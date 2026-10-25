<template>
    <!-- Liability article of the contract: responsibilities and their limits -->
    <section class="section">
        <h3 class="section-title text-large text-bold">12. {{ t('liability') }}</h3>
        <p class="section-text text-small">{{ t('liabilityText') }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
;
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