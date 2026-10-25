<template>
    <!-- Online payment page (content: components/views/PayMe) -->
    <PayMe />
</template>

<script setup>
import PayMe from '@/components/views/PayMe/PayMe.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('payMe')
</script>
