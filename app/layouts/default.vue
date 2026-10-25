<template>
    <!-- Default layout: every page inside the app shell -->
    <AppShell>
        <NuxtPage />
    </AppShell>
</template>

<script setup>
// Root layout — wraps all pages inside the main app shell
import AppShell from '@/components/layout/AppShell/AppShell.vue';
</script>
