<!-- Online withdrawal page (content: components/views/Withdrawal) -->
<template>
    <Withdrawal />
</template>

<script setup>
import Withdrawal from '@/components/views/Withdrawal/Withdrawal.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('withdrawal')
</script>
