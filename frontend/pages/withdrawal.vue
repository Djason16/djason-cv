<!-- Online withdrawal page (content: components/views/Withdrawal) -->
<template>
    <Withdrawal />
</template>

<script setup lang="ts">
import Withdrawal from '@/components/views/Withdrawal/Withdrawal.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('withdrawal')
</script>
