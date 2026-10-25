<template>
    <!-- Page shown for an address that does not exist or a server error: same frame as the other pages -->
    <AppShell>
        <NotFound :error="error" />
    </AppShell>
</template>

<script setup>
import AppShell from '@/components/layout/AppShell/AppShell.vue'
import NotFound from '@/components/views/NotFound/NotFound.vue'

defineProps({ error: { type: Object, default: null } })
</script>
