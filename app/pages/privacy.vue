<template>
    <!-- Privacy policy page (content: components/views/Privacy) -->
    <Privacy />
</template>

<script setup>
import Privacy from '@/components/views/Privacy/Privacy.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('privacy')
</script>
