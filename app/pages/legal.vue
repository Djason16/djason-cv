<template>
    <!-- Legal notice page (content: components/views/Legal) -->
    <Legal />
</template>

<script setup>
import Legal from '@/components/views/Legal/Legal.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('legal')
</script>
