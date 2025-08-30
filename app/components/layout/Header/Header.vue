<template>
    <!-- Sticky header reacts to scroll position -->
    <header :class="{ sticky: isSticky }" ref="header">
        <HeaderTop />
    </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HeaderTop from './sections/HeaderTop.vue'

const isSticky = ref(false)

// Toggle sticky class based on scroll Y offset
const handleScroll = () => isSticky.value = window.scrollY > 0

onMounted(() => {
    handleScroll() // initial check
    window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
header {
    position: relative;
    background-color: var(--third-color);
    padding: 0;
    z-index: 15;
    transition: background-color 0.5s ease-in-out, box-shadow 0.5s ease-in-out, padding 0.5s ease-in-out, width 0.5s ease-in-out;
}

header.sticky {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    background-color: rgba(82, 97, 107, 0.75);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 25;
}

@media (max-width: 1024px) {
    header.sticky {
        width: 100%;
    }
}
</style>