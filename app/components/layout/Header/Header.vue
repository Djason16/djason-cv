<template>
    <!-- Top of every page: sticks to the top and changes its style once the page is scrolled -->
    <header :class="{ scrolled: isScrolled }" ref="header">
        <HeaderTop />
    </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import HeaderTop from './HeaderTop.vue'

const isScrolled = ref(false)

// Updates scroll state: true if page scrolled down
const handleScroll = () => (isScrolled.value = window.scrollY > 0)

onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
/* Header stuck at the top of the page while scrolling */
header {
    position: sticky;
    top: 0;
    background-color: var(--ink-900);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0;
    z-index: 15;
    transition: background-color var(--motion-fast) var(--ease), box-shadow var(--motion-fast) var(--ease);
}

/* Once the page is scrolled: see-through blurred background, a lower bar */
header.scrolled {
    background-color: rgba(17, 20, 23, 0.82);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

header.scrolled :deep(.header-top) {
    height: 4.5rem;
}
</style>
