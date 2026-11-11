<!-- Admin dashboard, only with a session (content: components/views/Admin) -->
<template>
    <Admin />
</template>

<script setup lang="ts">
import Admin from '@/components/views/Admin/Admin.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('admin')

// Without a session: back to /login/ (the API checks the session itself)
definePageMeta({ middleware: 'auth' })
</script>
