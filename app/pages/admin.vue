<template>
    <!-- Admin dashboard, only with a session (content: components/views/Admin) -->
    <Admin />
</template>

<script setup>
import Admin from '@/components/views/Admin/Admin.vue'
import { useSeo } from '@/composables/useSeo.js'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('admin')

// Without a session: back to /login/ (the API checks the session itself)
definePageMeta({ middleware: 'auth' })
</script>
