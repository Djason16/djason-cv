<template>
    <!-- Terms and conditions page (content: components/views/Terms) -->
    <Terms />
</template>

<script setup>
import Terms from '@/components/views/Terms/Terms.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('terms')
</script>
