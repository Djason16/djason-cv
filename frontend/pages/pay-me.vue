<!-- Online payment page (content: components/views/PayMe) -->
<template>
    <PayMe />
</template>

<script setup lang="ts">
import PayMe from '@/components/views/PayMe/PayMe.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('payMe')
</script>
