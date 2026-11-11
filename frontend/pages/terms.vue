<!-- Terms and conditions page (content: components/views/Terms) -->
<template>
    <Terms />
</template>

<script setup lang="ts">
import Terms from '@/components/views/Terms/Terms.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('terms')
</script>
