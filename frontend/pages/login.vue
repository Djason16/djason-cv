<!-- Admin login page (content: components/views/Login) -->
<template>
    <Login />
</template>

<script setup lang="ts">
import Login from '@/components/views/Login/Login.vue'
import { useSeo } from '@/composables/useSeo'

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('login')

// Already logged in: straight to /admin/
definePageMeta({ middleware: 'guest' })
</script>
