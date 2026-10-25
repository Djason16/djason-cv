<template>
    <!-- Fullscreen loader with spinner and translated text -->
    <div class="loader-wrapper">
        <div class="spinner"></div>
        <p class="loader-text text-large">{{ t('loading') }}</p>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
// Access Nuxt's language utility for translations
</script>
