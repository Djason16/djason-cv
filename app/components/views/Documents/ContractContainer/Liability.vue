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
</script>
