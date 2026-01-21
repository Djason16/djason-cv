<template>
    <!-- Sticky header with dynamic styling when scrolled -->
    <header :class="{ scrolled: isScrolled }" ref="header">
        <HeaderTop />
    </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import HeaderTop from './sections/HeaderTop.vue'

const isScrolled = ref(false)

// Update scroll state: true if page scrolled down
const handleScroll = () => (isScrolled.value = window.scrollY > 0)

onMounted(() => {
    handleScroll() // initialize on mount
    window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
header {
    position: sticky;
    top: 0;
    background-color: var(--third-color);
    padding: 0;
    z-index: 15;
    transition: background-color 0.5s, box-shadow 0.5s, backdrop-filter 0.5s;
    will-change: background-color, box-shadow, backdrop-filter;
}

header.scrolled {
    background-color: rgba(82, 97, 107, 0.75);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
