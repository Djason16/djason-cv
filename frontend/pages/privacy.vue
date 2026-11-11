<!-- Privacy policy page (content: components/views/Privacy) -->
<template>
    <Privacy />
</template>

<script setup lang="ts">
import Privacy from '@/components/views/Privacy/Privacy.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('privacy')
</script>
