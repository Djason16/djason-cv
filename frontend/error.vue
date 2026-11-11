<template>
    <!-- Page shown for an address that does not exist or a server error: same frame as the other pages -->
    <AppShell>
        <NotFound :error="error" />
    </AppShell>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell/AppShell.vue'
import NotFound from '@/components/views/NotFound/NotFound.vue'

defineProps({ error: { type: Object as PropType<Record<string, any>>, default: null } })

// A link of the header, the footer or the menu leads to another page: Nuxt keeps the error until it is cleared.
// The navigation is stopped and done again by clearError, in one step (no page swapped under the leaving error page)
const router = useRouter()
const stop = router.beforeEach(to => {
    stop()
    clearError({ redirect: to.fullPath })
    return false
})
onUnmounted(stop)
</script>
