<!-- Legal notice page (content: components/views/Legal) -->
<template>
    <Legal />
</template>

<script setup lang="ts">
import Legal from '@/components/views/Legal/Legal.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('legal')
</script>
