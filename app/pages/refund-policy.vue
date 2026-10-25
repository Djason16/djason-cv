<template>
    <!-- Refund policy page (content: components/views/RefundPolicy) -->
    <RefundPolicy />
</template>

<script setup>
import RefundPolicy from '@/components/views/RefundPolicy/RefundPolicy.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('refundPolicy')
</script>
