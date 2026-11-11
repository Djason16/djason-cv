<template>
    <!-- Loader of the site (first visit and every page change): "Loading" in small capitals over a thin line that fills up -->
    <div class="loader-wrapper" role="status" aria-live="polite">
        <p class="loader-wrapper__text text-label">{{ t('loading') }}</p>
        <span class="loader-wrapper__line" aria-hidden="true"></span>
    </div>
</template>

<script setup lang="ts">
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()
</script>
