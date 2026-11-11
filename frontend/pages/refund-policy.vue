<!-- Refund policy page (content: components/views/RefundPolicy) -->
<template>
    <RefundPolicy />
</template>

<script setup lang="ts">
import RefundPolicy from '@/components/views/RefundPolicy/RefundPolicy.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('refundPolicy')
</script>
